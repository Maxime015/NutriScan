import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

import { supabase } from './supabase';

/**
 * Téléverse une image locale (file://) vers un bucket public et renvoie l'URL publique.
 * Non bloquant : renvoie `null` en cas d'échec (l'analyse reste enregistrée sans image).
 */
export async function uploadImage(
  bucket: 'analysis-images' | 'avatars',
  userId: string,
  uri: string
): Promise<string | null> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const path = `${userId}/${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, decode(base64), {
        contentType: 'image/jpeg',
        upsert: true,
      });
    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.warn('[storage] Échec du téléversement :', e);
    return null;
  }
}
