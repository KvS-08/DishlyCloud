/*
  # Create storage bucket for business logos

  1. New Storage
    - Create 'business-logos' bucket for storing business logo images
    - Set up proper policies for authenticated users to upload and view logos

  2. Security
    - Allow authenticated users to upload logos for their own business
    - Allow public read access to logo images
*/

-- Create storage bucket for business logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-logos', 'business-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload logos for their business
CREATE POLICY "Users can upload logos for their business"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-logos' AND
  (storage.foldername(name))[1] = (
    SELECT business_id::text 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Policy to allow authenticated users to update logos for their business
CREATE POLICY "Users can update logos for their business"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business-logos' AND
  (storage.foldername(name))[1] = (
    SELECT business_id::text 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Policy to allow public read access to business logos
CREATE POLICY "Public can view business logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'business-logos');

-- Policy to allow authenticated users to delete logos for their business
CREATE POLICY "Users can delete logos for their business"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-logos' AND
  (storage.foldername(name))[1] = (
    SELECT business_id::text 
    FROM users 
    WHERE id = auth.uid()
  )
);