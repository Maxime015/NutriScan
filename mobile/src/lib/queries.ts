import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from './supabase';
import { uploadImage } from './storage';
import type { AnalysisRow, AnalyzeResponse, Profile } from './types';

export const keys = {
  analyses: ['analyses'] as const,
  analysis: (id: string) => ['analyses', id] as const,
  stats: ['stats'] as const,
  profile: ['profile'] as const,
};

// ---------------------------------------------------------------------------
// Lecture
// ---------------------------------------------------------------------------
export function useAnalyses() {
  return useQuery({
    queryKey: keys.analyses,
    queryFn: async (): Promise<AnalysisRow[]> => {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as AnalysisRow[];
    },
  });
}

export function useAnalysis(id?: string) {
  return useQuery({
    queryKey: keys.analysis(id ?? ''),
    enabled: Boolean(id),
    queryFn: async (): Promise<AnalysisRow | null> => {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return (data as AnalysisRow) ?? null;
    },
  });
}

export interface Stats {
  total: number;
  activeWeeks: number;
  goalsReached: number;
  streak: number;
}

export function useStats() {
  const { data: analyses = [], ...rest } = useAnalyses();

  const stats: Stats = deriveStats(analyses);
  return { stats, ...rest };
}

function deriveStats(rows: AnalysisRow[]): Stats {
  const total = rows.length;

  const weeks = new Set(
    rows.map((r) => {
      const d = new Date(r.created_at);
      const onejan = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
      return `${d.getFullYear()}-${week}`;
    })
  );

  // "Objectifs atteints" = analyses avec un bon grade (A/B).
  const goalsReached = rows.filter((r) => ['A', 'B'].includes(r.grade?.toUpperCase())).length;

  // Série de jours consécutifs avec au moins une analyse (jusqu'à aujourd'hui).
  const days = new Set(rows.map((r) => new Date(r.created_at).toDateString()));
  let streak = 0;
  const cursor = new Date();
  // Tolère de ne pas avoir scanné aujourd'hui.
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { total, activeWeeks: weeks.size, goalsReached, streak };
}

// ---------------------------------------------------------------------------
// Écriture : enregistrer une analyse
// ---------------------------------------------------------------------------
function guessFoodType(text: string): 'Aliment' | 'Boisson' {
  const t = text.toLowerCase();
  const beverage = ['boisson', 'beverage', 'jus', 'juice', 'soda', 'eau', 'water', 'drink', 'lait', 'milk'];
  return beverage.some((w) => t.includes(w)) ? 'Boisson' : 'Aliment';
}

function guessProductName(text: string): string {
  const firstLine = text
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length >= 3 && /[a-zA-ZÀ-ÿ]/.test(l));
  if (!firstLine) return 'Aliment analysé';
  return firstLine.length > 40 ? `${firstLine.slice(0, 40)}…` : firstLine;
}

interface SaveArgs {
  userId: string;
  uri: string;
  result: AnalyzeResponse;
  productName?: string;
}

export function useSaveAnalysis() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, uri, result, productName }: SaveArgs): Promise<AnalysisRow> => {
      const imageUrl = await uploadImage('analysis-images', userId, uri);

      const row = {
        user_id: userId,
        product_name: productName?.trim() || guessProductName(result.extracted_text ?? ''),
        image_url: imageUrl,
        grade: result.analysis.grade,
        confidence: result.analysis.confidence,
        impact: result.analysis.impact ?? result.usage?.impact ?? null,
        food_type: guessFoodType(result.extracted_text ?? ''),
        usage: result.usage ?? {},
        risks: result.risks ?? { list: [], details: [] },
        allergens: result.allergens ?? { list: [], details: [] },
        recommendations: result.recommendations ?? {},
        ai_explanation: result.ai_explanation ?? null,
        extracted_text: result.extracted_text ?? null,
      };

      const { data, error } = await supabase
        .from('analyses')
        .insert(row)
        .select('*')
        .single();
      if (error) throw error;
      return data as AnalysisRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.analyses });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}

export function useDeleteAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('analyses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.analyses });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}

// ---------------------------------------------------------------------------
// Suppression de compte (définitive)
// ---------------------------------------------------------------------------
/**
 * Supprime les fichiers de l'utilisateur dans un bucket (best-effort).
 * Le stockage n'est pas couvert par le cascade FK côté base : on le nettoie
 * ici, tant que le JWT est encore valide (avant la suppression du compte).
 */
async function removeUserStorage(bucket: 'analysis-images' | 'avatars', userId: string) {
  try {
    const { data: files } = await supabase.storage.from(bucket).list(userId);
    if (files?.length) {
      await supabase.storage.from(bucket).remove(files.map((f) => `${userId}/${f.name}`));
    }
  } catch {
    // Non bloquant : la suppression du compte prime.
  }
}

/**
 * Supprime définitivement le compte de l'utilisateur connecté.
 * 1) Nettoie ses images de stockage (best-effort).
 * 2) Appelle la RPC `delete_account` qui supprime la ligne `auth.users` ;
 *    profil et historique sont alors supprimés en cascade (FK on delete cascade).
 * L'appelant doit ensuite se déconnecter localement (le JWT est invalidé).
 */
export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await removeUserStorage('analysis-images', userId);
      await removeUserStorage('avatars', userId);

      const { error } = await supabase.rpc('delete_account');
      if (error) throw error;
    },
    onSuccess: () => {
      // Vide tout le cache : plus aucune donnée de ce compte ne doit subsister.
      qc.clear();
    },
  });
}

// ---------------------------------------------------------------------------
// Profil
// ---------------------------------------------------------------------------
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Profile> }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.profile }),
  });
}
