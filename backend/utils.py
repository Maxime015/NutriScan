# ==============================
# utils.py
# ==============================

import re
import os
import requests
from dotenv import load_dotenv

# ==============================
# LOAD ENV
# ==============================
load_dotenv()


# ==============================
# CLEAN TEXT
# ==============================
def clean_text(text):

    text = str(text).lower()

    text = re.sub(
        r'[^a-zA-Z ]',
        ' ',
        text
    )

    return re.sub(
        r'\s+',
        ' ',
        text
    ).strip()


# ==============================
# FOOD VALIDATION
# ==============================
def is_food_related(text):

    keywords = [
        # Anglais
        "ingredient",
        "contains",
        "nutrition",
        "protein",
        "sugar",
        "salt",
        "oil",
        "fat",
        "carbohydrate",
        "sodium",
        "milk",
        "wheat",
        "flour",
        # Français
        "ingredient",
        "ingredients",
        "valeurs nutritionnelles",
        "energie",
        "kcal",
        "matieres grasses",
        "glucides",
        "proteines",
        "sucre",
        "sel",
        "fibres",
        "lait",
        "farine",
        "portion",
    ]

    text = text.lower()

    matches = sum(
        1 for k in keywords
        if k in text
    )

    return matches >= 2


# ==============================
# RISK DETECTION
# ==============================
# Chaque risque (clé canonique en anglais, réutilisée par risk_details /
# recommendations) est associé à ses synonymes anglais ET français.
RISK_TERMS = {
    "sugar": ["sugar", "sucre", "sucres", "sirop de glucose", "sirop de fructose"],
    "palm oil": ["palm oil", "huile de palme"],
    "refined oil": [
        "refined oil",
        "huile raffinee",
        "huile vegetale",
        "huiles vegetales",
    ],
    "sodium": ["sodium"],
    "salt": ["salt", "sel"],
    "msg": ["msg", "glutamate", "glutamate monosodique", "e621"],
    "preservatives": ["preservatives", "conservateur", "conservateurs"],
}


def detect_risk(text):

    text = text.lower()

    return [
        key
        for key, terms in RISK_TERMS.items()
        if any(t in text for t in terms)
    ]


# ==============================
# ALLERGEN DETECTION
# ==============================
def detect_allergens(text):

    allergens = {

        "milk": [
            "milk",
            "lactose",
            "lait",
            "creme",
            "beurre",
            "fromage",
        ],

        "gluten": [
            "wheat",
            "gluten",
            "ble",
            "farine de ble",
            "orge",
            "seigle",
            "avoine",
        ],

        "nuts": [
            "almond",
            "cashew",
            "peanut",
            "amande",
            "noisette",
            "arachide",
            "noix",
            "cajou",
            "pistache",
        ],

        "soy": [
            "soy",
            "soja",
            "lecithine de soja",
        ],

        "egg": [
            "egg",
            "oeuf",
            "oeufs",
        ]
    }

    found = []

    text = text.lower()

    for key, values in allergens.items():

        if any(v in text for v in values):
            found.append(key)

    return found


# ==============================
# USAGE
# ==============================
def usage_recommendation(grade):

    return {

        "A": {
            "level": "Safe",
            "frequency": "Daily",
            "quantity": "1-2 servings/day",
            "impact": "Low"
        },

        "B": {
            "level": "Moderate",
            "frequency": "Daily (limited)",
            "quantity": "1 serving/day",
            "impact": "Mild"
        },

        "C": {
            "level": "Limit",
            "frequency": "2-3/week",
            "quantity": "Small portions",
            "impact": "Moderate"
        },

        "D": {
            "level": "Rare",
            "frequency": "1-2/week",
            "quantity": "Very small",
            "impact": "High"
        },

        "E": {
            "level": "Avoid",
            "frequency": "Avoid",
            "quantity": "None",
            "impact": "Very high"
        }

    }.get(grade, {})


# ==============================
# RISK DETAILS
# ==============================
def risk_details(risks):

    info = {

        "sugar":
        "High sugar may cause diabetes and weight gain.",

        "sodium":
        "Excess salt can increase blood pressure.",

        "palm oil":
        "High saturated fats may affect heart health.",

        "refined oil":
        "Processed oils may increase cholesterol.",

        "msg":
        "May trigger headaches in sensitive individuals.",

        "preservatives":
        "Frequent intake may affect metabolism."
    }

    return [

        {
            "name": r,

            "description":
            info.get(
                r,
                "May affect health"
            ),

            "long_term":
            "Frequent use may be harmful"
        }

        for r in risks
    ]


# ==============================
# ALLERGEN DETAILS
# ==============================
def allergen_details(allergens):

    return [

        {
            "name": a,

            "symptoms":
            "Digestive issues / allergic reactions",

            "prevalence":
            "Common in some individuals"
        }

        for a in allergens
    ]


# ==============================
# RECOMMENDATIONS
# ==============================
def generate_recommendations(
    risks,
    allergens,
    grade,
    conditions
):

    recs = {

        "overall": "",

        "do": [],

        "avoid": [],

        "alternatives": [],

        "medical_warnings": []
    }

    # =========================
    # OVERALL
    # =========================
    if grade in ["A", "B"]:

        recs["overall"] = (
            "Bon choix alimentaire, dans le cadre d'une alimentation équilibrée."
        )

    elif grade == "C":

        recs["overall"] = (
            "À consommer avec modération."
        )

    else:

        recs["overall"] = (
            "À limiter, voire à éviter."
        )

    # =========================
    # RISK BASED
    # =========================
    if "sugar" in risks:

        recs["avoid"].append(
            "Consommation élevée de sucre"
        )

        recs["alternatives"].append(
            "Utiliser des édulcorants naturels"
        )

    if "sodium" in risks:

        recs["avoid"].append(
            "Excès de sel"
        )

        recs["alternatives"].append(
            "Choisir des options faibles en sodium"
        )

    if "milk" in allergens:

        recs["avoid"].append(
            "Produits laitiers"
        )

        recs["alternatives"].append(
            "Laits végétaux"
        )

    # =========================
    # HEALTH CONDITIONS
    # =========================

    # Diabetes
    if "diabetes" in conditions:

        recs["do"].append(
            "Privilégier les aliments pauvres en sucre"
        )

        if "sugar" in risks:

            recs["medical_warnings"].append(
                "Ce produit contient du sucre, ce qui peut augmenter la glycémie."
            )

    # Blood Pressure
    if (
        "bp" in conditions
        or "blood_pressure" in conditions
    ):

        recs["do"].append(
            "Choisir des aliments faibles en sodium"
        )

        if "sodium" in risks:

            recs["medical_warnings"].append(
                "Un excès de sodium peut augmenter la pression artérielle."
            )

    # Heart
    if "heart" in conditions:

        recs["do"].append(
            "Privilégier les aliments pauvres en graisses"
        )

        if (
            "palm oil" in risks
            or "refined oil" in risks
        ):

            recs["medical_warnings"].append(
                "Les huiles transformées peuvent affecter la santé cardiaque."
            )

    # Lactose
    if "lactose_intolerance" in conditions:

        if "milk" in allergens:

            recs["medical_warnings"].append(
                "Contient des ingrédients laitiers pouvant déclencher une intolérance au lactose."
            )

    # Default
    if not recs["do"]:

        recs["do"].append(
            "Maintenir une alimentation équilibrée"
        )

    return recs


# ==============================
# GEMINI
# ==============================
def gemini_enhance(
    grade,
    risks,
    allergens,
    usage,
    conditions
):

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return ""

    prompt = f"""
Explique simplement cette analyse nutritionnelle. Réponds UNIQUEMENT en français.

Note de l'aliment : {grade}

Risques détectés : {risks}

Allergènes détectés : {allergens}

Fréquence recommandée : {usage}

Conditions de santé de l'utilisateur : {conditions}

Donne :
- un avertissement personnalisé
- l'impact sur la santé
- les aliments à éviter
- des alternatives plus saines

Réponse courte et simple, en français.
"""

    url = (
        "https://generativelanguage.googleapis.com"
        f"/v1/models/gemini-pro:generateContent?key={api_key}"
    )

    try:

        res = requests.post(
            url,
            json={
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ]
            }
        )

        data = res.json()

        return (
            data["candidates"][0]
            ["content"]["parts"][0]["text"]
        )

    except:
        return ""