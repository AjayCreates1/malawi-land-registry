-- Create storage bucket for land documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('land-documents', 'land-documents', false);

-- RLS policies for land documents bucket
CREATE POLICY "Land owners can upload their documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'land-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Land owners can view their documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'land-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all land documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'land-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Add document_url column to land_registrations table
ALTER TABLE public.land_registrations
ADD COLUMN document_url text;

-- Add document_url column to lands table
ALTER TABLE public.lands
ADD COLUMN document_url text;