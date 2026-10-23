import { supabase } from './supabase';

/**
 * Upload an image to Supabase Storage
 * @param file - The image file to upload
 * @param folder - Optional folder name (default: 'projects')
 * @returns The public URL of the uploaded image
 */
export async function uploadProjectImage(file: File, folder = 'projects'): Promise<string> {
  try {
    // Generate unique filename with timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('project-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The full URL or path of the image
 */
export async function deleteProjectImage(imageUrl: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const urlParts = imageUrl.split('/project-images/');
    if (urlParts.length < 2) {
      console.warn('Invalid image URL format:', imageUrl);
      return;
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('project-images')
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - image deletion is not critical
  }
}
