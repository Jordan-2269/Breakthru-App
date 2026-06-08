-- ============================================================
-- LISTING PHOTOS STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read listing photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-photos');

CREATE POLICY "Authenticated upload listing photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listing-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated update listing photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'listing-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated delete listing photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'listing-photos' AND auth.uid() IS NOT NULL);

-- ============================================================
-- REVIEWS RLS
-- ============================================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Parents can insert reviews"
ON public.reviews FOR INSERT
WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Parents can update own reviews"
ON public.reviews FOR UPDATE
USING (reviewer_id = auth.uid());

CREATE POLICY "Parents can delete own reviews"
ON public.reviews FOR DELETE
USING (reviewer_id = auth.uid());

-- ============================================================
-- TRIGGER: keep avg_rating + review_count in sync
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_listing_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_id UUID;
BEGIN
  target_id := COALESCE(NEW.listing_id, OLD.listing_id);
  UPDATE public.business_listings
  SET
    avg_rating   = COALESCE((SELECT AVG(rating)::NUMERIC(3,2) FROM public.reviews WHERE listing_id = target_id), 0),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE listing_id = target_id)
  WHERE id = target_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER reviews_update_listing_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_listing_rating();
