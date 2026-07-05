/** Types partagés : réponse de l'API Flask + entités Supabase. */

export interface RiskDetail {
  name: string;
  description: string;
  long_term: string;
}

export interface AllergenDetail {
  name: string;
  symptoms: string;
  prevalence: string;
}

export interface UsageInfo {
  level?: string;
  frequency?: string;
  quantity?: string;
  impact?: string;
}

export interface Recommendations {
  overall: string;
  do: string[];
  avoid: string[];
  alternatives: string[];
  medical_warnings: string[];
}

/** Corps JSON renvoyé par `POST /analyze` du backend Flask. */
export interface AnalyzeResponse {
  analysis: {
    grade: string;
    confidence: number;
    impact?: string;
  };
  usage: UsageInfo;
  risks: {
    list: string[];
    details: RiskDetail[];
  };
  allergens: {
    list: string[];
    details: AllergenDetail[];
  };
  recommendations: Recommendations;
  ai_explanation: string;
  health_conditions: string[];
  extracted_text: string;
  error?: string;
}

/** Ligne de la table `analyses` (Supabase). */
export interface AnalysisRow {
  id: string;
  user_id: string;
  product_name: string;
  image_url: string | null;
  grade: string;
  confidence: number;
  impact: string | null;
  food_type: string | null;
  usage: UsageInfo;
  risks: { list: string[]; details: RiskDetail[] };
  allergens: { list: string[]; details: AllergenDetail[] };
  recommendations: Recommendations;
  ai_explanation: string | null;
  extracted_text: string | null;
  created_at: string;
}

/** Ligne de la table `profiles`. */
export interface Profile {
  id: string;
  full_name: string | null;
  age: number | null;
  sex: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  health_conditions: string[] | null;
  avatar_url: string | null;
  language: string | null;
  dark_mode: boolean | null;
  notifications_enabled: boolean | null;
  onboarded: boolean | null;
  created_at: string;
  updated_at: string;
}
