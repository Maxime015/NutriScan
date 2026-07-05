# ==============================
# app.py
# ==============================

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import jwt
import requests
import os
from dotenv import load_dotenv

from utils import *

# ==============================
# LOAD ENV
# ==============================
load_dotenv()

OCR_API_KEY = os.getenv("OCR_API_KEY")

# Vérification des tokens d'accès Supabase.
# Les projets Supabase récents signent les JWT avec une clé asymétrique (ECC/ES256)
# exposée via JWKS. On vérifie donc via le JWKS (clé publique), avec repli sur
# l'ancien secret partagé HS256 si celui-ci est fourni.
# Si aucune des deux options n'est configurée, la vérification est désactivée
# (pratique en développement local).
SUPABASE_JWKS_URL = os.getenv("SUPABASE_JWKS_URL")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

# Client JWKS mis en cache (récupère et met en cache les clés de signature).
# On force un contexte SSL basé sur le bundle de certificats de `certifi` : certaines
# installations Python (builds python.org sur macOS) n'ont pas les CA racines système,
# ce qui ferait échouer la récupération HTTPS du JWKS.
def _build_jwks_client(url):
    if not url:
        return None
    try:
        import ssl
        import certifi
        ctx = ssl.create_default_context(cafile=certifi.where())
        return jwt.PyJWKClient(url, ssl_context=ctx)
    except Exception:
        return jwt.PyJWKClient(url)


_jwks_client = _build_jwks_client(SUPABASE_JWKS_URL)

# ==============================
# LOAD MODEL
# ==============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "main_model.pkl"))
vectorizer = joblib.load(os.path.join(BASE_DIR, "vectorizer_model.pkl"))

# ==============================
# INIT
# ==============================
app = Flask(__name__)
CORS(app)


# ==============================
# AUTH (JWT Supabase)
# ==============================
def is_authorized(req):
    """Vérifie le token d'accès Supabase transmis en Bearer.

    - JWKS/ES256 (clé asymétrique, projets Supabase récents) si SUPABASE_JWKS_URL
      est défini ;
    - repli HS256 (secret partagé legacy) si SUPABASE_JWT_SECRET est défini.

    Renvoie True si la vérification est désactivée (aucune des deux options) ou si
    le token est valide ; False sinon.
    """
    # Vérification désactivée si rien n'est configuré (dev local).
    if not _jwks_client and not SUPABASE_JWT_SECRET:
        return True

    header = req.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return False

    token = header.split(" ", 1)[1].strip()

    # 1) JWKS asymétrique (ES256/RS256) — voie principale.
    if _jwks_client:
        try:
            signing_key = _jwks_client.get_signing_key_from_jwt(token)
            jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256", "RS256"],
                audience="authenticated",
            )
            return True
        except Exception:
            # On tente le repli HS256 ci-dessous si disponible.
            pass

    # 2) Repli HS256 (secret partagé legacy).
    if SUPABASE_JWT_SECRET:
        try:
            jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
            return True
        except Exception:
            return False

    return False


# ==============================
# HEALTH CHECK
# ==============================
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

# ==============================
# OCR FUNCTION
# ==============================
def extract_text(image_bytes, filename):
    url = "https://api.ocr.space/parse/image"

    res = requests.post(
        url,
        files={"file": (filename, image_bytes)},
        data={"apikey": OCR_API_KEY}
    )

    try:
        data = res.json()

        if data.get("ParsedResults"):
            return data["ParsedResults"][0]["ParsedText"]

    except:
        return ""

    return ""


# ==============================
# MAIN API
# ==============================
@app.route("/analyze", methods=["POST"])
def analyze():

    try:

        # =========================
        # AUTH
        # =========================
        if not is_authorized(request):
            return jsonify({
                "error": "Non autorisé"
            }), 401

        # =========================
        # CHECK IMAGE
        # =========================
        if "image" not in request.files:
            return jsonify({
                "error": "No image uploaded"
            }), 400

        file = request.files["image"]

        # =========================
        # OCR
        # =========================
        extracted_text = extract_text(
            file.read(),
            file.filename
        )

        if not extracted_text.strip():
            return jsonify({
                "error": "No text detected"
            }), 400

        # =========================
        # VALIDATE FOOD
        # =========================
        if not is_food_related(extracted_text):
            return jsonify({
                "error": "Upload a valid ingredients or nutrition label"
            }), 400

        # =========================
        # CLEAN
        # =========================
        clean = clean_text(extracted_text)

        # =========================
        # VECTORIZE
        # =========================
        vec = vectorizer.transform([clean])

        if vec.nnz < 5:
            return jsonify({
                "error": "Not enough food-related data detected"
            }), 400

        # =========================
        # PREDICT
        # =========================
        grade = model.predict(vec)[0]

        confidence = float(
            model.predict_proba(vec).max()
        )

        # =========================
        # DETECT
        # =========================
        risks = detect_risk(extracted_text)

        allergens = detect_allergens(extracted_text)

        # =========================
        # HEALTH CONDITIONS
        # =========================
        conditions = request.form.get(
            "health_conditions",
            ""
        )

        conditions_list = [
            c.strip().lower()
            for c in conditions.split(",")
            if c.strip()
        ]

        # =========================
        # USAGE
        # =========================
        usage = usage_recommendation(grade)

        # =========================
        # PERSONALIZATION
        # =========================

        # Diabetes
        if (
            "diabetes" in conditions_list
            and "sugar" in risks
        ):
            usage["level"] = "Avoid"
            usage["impact"] = "High"

        # BP
        if (
            ("bp" in conditions_list
             or "blood_pressure" in conditions_list)
            and "sodium" in risks
        ):
            usage["level"] = "Avoid"
            usage["impact"] = "High"

        # Heart
        if (
            "heart" in conditions_list
            and (
                "palm oil" in risks
                or "refined oil" in risks
            )
        ):
            usage["level"] = "Avoid"
            usage["impact"] = "High"

        # =========================
        # RECOMMENDATIONS
        # =========================
        recs = generate_recommendations(
            risks,
            allergens,
            grade,
            conditions_list
        )

        # =========================
        # GEMINI
        # =========================
        ai_text = gemini_enhance(
            grade,
            risks,
            allergens,
            usage.get("frequency"),
            conditions_list
        )

        # =========================
        # RESPONSE
        # =========================
        return jsonify({

            "analysis": {
                "grade": grade,
                "confidence": round(confidence, 2),
                "impact": usage.get("impact")
            },

            "usage": usage,

            "risks": {
                "list": risks,
                "details": risk_details(risks)
            },

            "allergens": {
                "list": allergens,
                "details": allergen_details(allergens)
            },

            "recommendations": recs,

            "ai_explanation": (
                ai_text
                if ai_text
                else "Analyse de base fournie."
            ),

            "health_conditions": conditions_list,

            "extracted_text": extracted_text

        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# ==============================
# RUN
# ==============================
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5050)