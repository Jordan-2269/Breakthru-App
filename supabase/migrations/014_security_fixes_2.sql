-- Re-apply REVOKE for search_listings_near (lost when function was recreated in 013)
REVOKE EXECUTE ON FUNCTION public.search_listings_near(FLOAT, FLOAT, FLOAT, UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_listings_near(FLOAT, FLOAT, FLOAT, UUID[]) TO anon, authenticated;

-- Fix storage bucket policies: remove overly broad SELECT that allows listing all files

-- avatars bucket: users can only read their own avatar, businesses can read any
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Authenticated can read avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');

-- listing-photos bucket: anyone can view photos (needed for unclaimed listings)
-- but restrict to reading by path, not listing entire bucket
DROP POLICY IF EXISTS "Public can view listing photos" ON storage.objects;
CREATE POLICY "Anyone can read listing photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'listing-photos');
