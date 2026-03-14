import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';

const IMAGE_MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
  heif: 'image/heif',
};

export const uploadImage = async (
  fileUri: string,
  pathName: string,
): Promise<string> => {
  const uriExt = fileUri.split('.').pop()?.toLowerCase()?.split('?')[0];
  const pathExt = pathName.split('.').pop()?.toLowerCase();
  const ext = uriExt && uriExt in IMAGE_MIME_MAP ? uriExt : (pathExt ?? 'jpg');

  if (!(ext in IMAGE_MIME_MAP)) throw new Error(`Unsupported file type: .${ext}`);

  let uploadPath = pathName;
  let contentType: string;
  let base64: string;

  if (ext === 'heic' || ext === 'heif') {
    // Convert HEIC/HEIF to JPEG
    const manipulated = await ImageManipulator.manipulateAsync(
      fileUri,
      [],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG, base64: true },
    );
    if (!manipulated.base64) throw new Error('Failed to convert HEIC/HEIF to JPEG.');
    base64 = manipulated.base64;
    contentType = 'image/jpeg';
    uploadPath = uploadPath.endsWith('.jpg') ? uploadPath : `${uploadPath}.jpg`;
  } else {
    base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
    contentType = IMAGE_MIME_MAP[ext] ?? 'image/jpeg';
    if (!uploadPath.endsWith(`.${ext}`)) uploadPath = `${uploadPath}.${ext}`;
  }

  const { data, error } = await supabase.storage
    .from('pfp')
    .upload(uploadPath, decode(base64), { contentType, upsert: true });

  if (error) throw new Error(error.message);

  return data.path;
};

export const getSignedUrl = async (
  path: string,
  expiresInSeconds = 60,
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('pfp')
    .createSignedUrl(path, expiresInSeconds);

  if (error) throw new Error(error.message);

  return data.signedUrl;
};
