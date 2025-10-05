-- Allow authenticated users to insert their own non-admin role
DO $$ BEGIN
  -- Create policy only if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Users can insert own non-admin role'
  ) THEN
    CREATE POLICY "Users can insert own non-admin role"
      ON public.user_roles
      FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() = user_id
        AND role IN ('user', 'landowner'::app_role)
      );
  END IF;
END $$;

-- Ensure land documents bucket exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'land-documents'
  ) THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('land-documents', 'land-documents', false);
  END IF;
END $$;

-- Storage policies for land documents
DO $$ BEGIN
  -- Allow users to upload documents to their own folder in land-documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Landowners can upload own documents'
  ) THEN
    CREATE POLICY "Landowners can upload own documents"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'land-documents'
        AND (auth.uid()::text = (storage.foldername(name))[1])
      );
  END IF;

  -- Allow users to view their own uploaded documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can view own documents'
  ) THEN
    CREATE POLICY "Users can view own documents"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'land-documents'
        AND (auth.uid()::text = (storage.foldername(name))[1])
      );
  END IF;

  -- Allow admins to view all land documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can view all land documents'
  ) THEN
    CREATE POLICY "Admins can view all land documents"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'land-documents' AND public.has_role(auth.uid(), 'admin'::app_role)
      );
  END IF;
END $$;