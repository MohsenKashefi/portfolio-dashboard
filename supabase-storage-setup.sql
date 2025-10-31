-- Supabase Storage Setup for Project Images
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- 1. Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up storage policies to allow public read and authenticated write

-- Allow public users to read/view images
CREATE POLICY "Public users can view project images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-images');

-- Allow authenticated users (admin) to upload images
CREATE POLICY "Authenticated users can upload project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-images');

-- Allow authenticated users (admin) to update images
CREATE POLICY "Authenticated users can update project images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-images');

-- Allow authenticated users (admin) to delete images
CREATE POLICY "Authenticated users can delete project images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-images');

-- Success message
SELECT 'Storage bucket "project-images" created successfully! 🎉' as status;

-- Verify bucket was created
SELECT * FROM storage.buckets WHERE id = 'project-images';
