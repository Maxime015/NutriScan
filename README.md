# 🥗 NutriScan — AI Food Ingredient Analyzer

<p align="center">
  <img src="https://img.shields.io/badge/ML-Scikit--Learn-blue?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/API-Flask-green?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/OCR-OCR.space-orange?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Frontend-React-blueviolet?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Status-Live-success?style=for-the-badge"/>
</p>

<p align="center">
  🚀 <b>Prenez les ingrédients en photo → Analysez leur impact sur la santé → Faites des choix alimentaires plus éclairés.</b>
</p>


Application mobile qui analyse les étiquettes alimentaires : photographiez la
liste d'ingrédients ou le tableau nutritionnel d'un produit, et obtenez un
**score de santé (A–E)**, les **risques** et **allergènes** détectés, ainsi que
des **recommandations personnalisées** selon vos conditions de santé
(diabète, hypertension, etc.).

| Partie | Dossier | Stack | Documentation |
|---|---|---|---|
| 📱 Frontend (app mobile) | [`mobile/`](mobile/) | Expo (React Native) · TypeScript · NativeWind · Supabase | [mobile/README.md](mobile/README.md) |
| 🧠 Backend (API + ML) | [`backend/`](backend/) | Flask · scikit-learn · OCR.space · Gemini (optionnel) | [backend/README.md](backend/README.md) |

## ✨ Principales fonctionnalités

- 📸 Téléchargez instantanément des images des ingrédients des aliments  
- 🔍 L'OCR extrait automatiquement le texte des ingrédients  
- 🧠 Le modèle de Machine Learning prédit le **Nutri-Score (A–E)**  
- ⚠️ Détecte les **ingrédients à risque** (sucre, sodium, conservateurs)  
- 🧬 Identifie les **allergènes**  
- ❤️ Fournit des conseils personnalisés en fonction des problèmes de santé  
- 📊 Propose des recommandations d'utilisation intelligentes (**à consommer quotidiennement / à limiter / à éviter**)  


---

## 📸 Screenshots

<p align="center">
  <img src="./mobile/assets/images/screenshots/a.png" width="230" />
  &nbsp;&nbsp;
  <img src="./mobile/assets/images/screenshots/b.png" width="230" />
  &nbsp;&nbsp;
  <img src="./mobile/assets/images/screenshots/c.png" width="230" />
  &nbsp;&nbsp;
  <img src="./mobile/assets/images/screenshots/d.png" width="230" />
</p>

<p align="center">
  <img src="./mobile/assets/images/screenshots/e.png" width="180" />
  &nbsp;&nbsp;
  <img src="./mobile/assets/images/screenshots/f.png" width="180" />
  &nbsp;&nbsp;
  <img src="./mobile/assets/images/screenshots/g.png" width="180" />
  &nbsp;&nbsp;
  <img src="./mobile/assets/images/screenshots/h.png" width="180" />
</p>

<p align="center">
  <img src="./mobile/assets/images/screenshots/i.png" width="180" />
  &nbsp;&nbsp;
  <img src="./mobile/assets/images/screenshots/j.png" width="180" />
  &nbsp;&nbsp;
  <img src="./mobile/assets/images/screenshots/k.png" width="180" />
  &nbsp;&nbsp;
  <img src="./mobile/assets/images/screenshots/l.png" width="180" />
</p>

---


## Architecture générale

```mermaid
flowchart LR
    subgraph Mobile["📱 App mobile (Expo / React Native)"]
        UI["Écrans<br/>Accueil · Caméra · Historique<br/>Conseils · Profil"]
    end

    subgraph Backend["🧠 Backend Flask"]
        API["POST /analyze<br/>(JWT Supabase requis)"]
        ML["Modèle ML<br/>TF-IDF + Régression logistique<br/>grade A–E"]
        DET["Détection FR/EN<br/>risques · allergènes<br/>recommandations"]
    end

    subgraph Cloud["☁️ Services"]
        SB[("Supabase<br/>Auth · Postgres (RLS) · Storage")]
        OCR["OCR.space<br/>image → texte"]
        GEM["Gemini<br/>explication IA (optionnel)"]
    end

    UI -- "photo de l'étiquette<br/>(multipart + Bearer JWT)" --> API
    API --> OCR
    API --> ML
    API --> DET
    API -. "explication" .-> GEM
    UI -- "auth (JWT ES256)<br/>profil · historique" --> SB
    API -- "vérification JWT<br/>(JWKS)" --> SB
```

**Flux d'une analyse :**

1. L'utilisateur photographie (ou téléverse) une étiquette dans l'app.
2. L'app envoie l'image à `POST /analyze` avec son token Supabase et ses
   conditions de santé.
3. Le backend : OCR → validation « aliment » → vectorisation TF-IDF →
   prédiction du grade A–E → détection risques/allergènes (FR/EN) →
   recommandations personnalisées (+ explication Gemini si configurée).
4. L'app enregistre le résultat dans Supabase (table `analyses`, protégée par
   RLS) et affiche les écrans de résultats (jauge, risques, allergènes, texte
   extrait).

## Démarrage rapide

Ordre recommandé :

```bash
# 1. Base de données — exécuter le schéma dans Supabase (SQL Editor)
#    → mobile/supabase/migrations/0001_init.sql

# 2. Backend
cd backend
pip install -r requirements.txt
cp .env.example .env          # OCR_API_KEY, SUPABASE_JWKS_URL…
python3 -m flask --app app run --host 0.0.0.0 --port 5050

# 3. App mobile
cd ../mobile
npm install
cp .env.example .env          # URL/clé Supabase + URL de l'API
npx expo start
```

> ⚠️ **Port 5050** en local : le port 5000 est occupé par le récepteur AirPlay
> de macOS. Détails et pièges (simulateur iOS, variables `EXPO_PUBLIC_*`) dans
> [mobile/README.md](mobile/README.md).

## Arborescence

```
AI Food Ingredient Analyzer/
├── backend/                  API Flask + modèle ML (voir backend/README.md)
│   ├── app.py                Endpoints /health et /analyze, garde JWT
│   ├── utils.py              OCR helpers, détection risques/allergènes, recos
│   ├── main_model.pkl        Classifieur (grade A–E)
│   ├── vectorizer_model.pkl  Vectoriseur TF-IDF
│   └── render.yaml           Déploiement Render
└── mobile/                   App Expo (voir mobile/README.md)
    ├── src/app/              Écrans (expo-router)
    ├── src/components/       Composants UI réutilisables
    ├── src/lib/              Supabase, API, thème, requêtes
    └── supabase/migrations/  Schéma SQL (tables, RLS, triggers, buckets)
```
