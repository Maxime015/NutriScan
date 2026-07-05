import {
  uploadAsync,
  FileSystemUploadType,
  type FileSystemUploadResult,
} from 'expo-file-system/legacy';

import type { AnalyzeResponse } from './types';

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export const isApiConfigured = Boolean(API_URL);

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function guessMime(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'heic') return 'image/heic';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

interface AnalyzeArgs {
  uri: string;
  healthConditions: string[];
  accessToken: string | null;
}

/**
 * Envoie l'image de l'étiquette à l'API Flask (`POST /analyze`).
 * Multipart : `image` + `health_conditions` (CSV) ; JWT Supabase en Bearer.
 */
export async function analyzeImage({
  uri,
  healthConditions,
  accessToken,
}: AnalyzeArgs): Promise<AnalyzeResponse> {
  if (!API_URL) {
    throw new ApiError(
      "L'URL de l'API n'est pas configurée (EXPO_PUBLIC_API_URL).",
      0
    );
  }

  const name = uri.split('/').pop() ?? 'label.jpg';

  // RN 0.86 / SDK 57 : `fetch` + FormData rejette l'objet fichier RN
  // { uri, name, type } (« Unsupported FormDataPart implementation »).
  // On passe par l'uploader multipart d'Expo, conçu pour envoyer un fichier
  // depuis un URI local.
  let res: FileSystemUploadResult;
  try {
    res = await uploadAsync(`${API_URL}/analyze`, uri, {
      httpMethod: 'POST',
      uploadType: FileSystemUploadType.MULTIPART,
      fieldName: 'image',
      mimeType: guessMime(name),
      parameters: { health_conditions: healthConditions.join(',') },
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
  } catch {
    throw new ApiError(
      'Impossible de contacter le serveur d’analyse. Vérifiez votre connexion.',
      0
    );
  }

  let data: AnalyzeResponse;
  try {
    data = JSON.parse(res.body) as AnalyzeResponse;
  } catch {
    throw new ApiError(
      `Réponse invalide du serveur (HTTP ${res.status}).`,
      res.status
    );
  }

  if (res.status < 200 || res.status >= 300 || data.error) {
    throw new ApiError(data.error ?? 'Échec de l’analyse.', res.status);
  }

  return data;
}

/** Ping de disponibilité du backend. */
export async function apiHealth(): Promise<boolean> {
  if (!API_URL) return false;
  try {
    const res = await fetch(`${API_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
