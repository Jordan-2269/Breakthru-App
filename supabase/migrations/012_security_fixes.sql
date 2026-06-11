-- ============================================================
-- SECURITY FIXES: Function search_path + REVOKE from public
-- ============================================================

-- 1. handle_new_user (trigger only — revoke public execute)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- 2. update_conversation_on_message (trigger only — revoke public execute)
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message          = NEW.body,
    last_message_at       = NEW.created_at,
    parent_unread_count   = CASE WHEN NEW.sender_role = 'business' THEN parent_unread_count + 1 ELSE parent_unread_count END,
    business_unread_count = CASE WHEN NEW.sender_role = 'parent' THEN business_unread_count + 1 ELSE business_unread_count END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.update_conversation_on_message() FROM PUBLIC;

-- 3. update_listing_rating (trigger only — revoke public execute)
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.update_listing_rating() FROM PUBLIC;

-- 4. delete_own_account (authenticated users only)
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN DELETE FROM auth.users WHERE id = auth.uid(); END; $$;

REVOKE EXECUTE ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

-- 5. search_listings_near (anon + authenticated need this for search)
CREATE OR REPLACE FUNCTION public.search_listings_near(
  user_lat          FLOAT,
  user_lng          FLOAT,
  radius_km         FLOAT DEFAULT 25,
  service_type_ids  UUID[] DEFAULT NULL
)
RETURNS TABLE (
  id              UUID,
  name            TEXT,
  address_city    TEXT,
  address_state   TEXT,
  logo_url        TEXT,
  cover_image_url TEXT,
  avg_rating      NUMERIC,
  review_count    INT,
  price_range     TEXT,
  is_claimed      BOOLEAN,
  accepting_new_clients BOOLEAN,
  distance_km     FLOAT
) LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    bl.id, bl.name, bl.address_city, bl.address_state,
    bl.logo_url, bl.cover_image_url, bl.avg_rating, bl.review_count,
    bl.price_range, bl.is_claimed, bl.accepting_new_clients,
    ST_Distance(
      bl.location::geography,
      ST_MakePoint(user_lng, user_lat)::geography
    ) / 1000.0 AS distance_km
  FROM public.business_listings bl
  WHERE
    bl.is_active = TRUE
    AND bl.location IS NOT NULL
    AND ST_DWithin(
      bl.location::geography,
      ST_MakePoint(user_lng, user_lat)::geography,
      radius_km * 1000
    )
    AND (
      service_type_ids IS NULL
      OR EXISTS (
        SELECT 1 FROM public.business_services bs
        WHERE bs.listing_id = bl.id AND bs.service_type_id = ANY(service_type_ids)
      )
    )
  ORDER BY distance_km ASC;
$$;

REVOKE EXECUTE ON FUNCTION public.search_listings_near(FLOAT, FLOAT, FLOAT, UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_listings_near(FLOAT, FLOAT, FLOAT, UUID[]) TO anon, authenticated;
