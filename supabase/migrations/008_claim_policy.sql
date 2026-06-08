-- Allow authenticated business users to claim unclaimed listings
CREATE POLICY "Business users can claim unclaimed listings" ON public.business_listings
  FOR UPDATE
  USING (is_claimed = false AND owner_id IS NULL)
  WITH CHECK (owner_id = auth.uid() AND is_claimed = true);
