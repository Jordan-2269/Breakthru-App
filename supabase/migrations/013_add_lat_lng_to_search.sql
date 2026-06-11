-- Add latitude + longitude to search_listings_near return type for map pins

DROP FUNCTION public.search_listings_near(FLOAT, FLOAT, FLOAT, UUID[]);

CREATE FUNCTION public.search_listings_near(
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
  distance_km     FLOAT,
  latitude        FLOAT,
  longitude       FLOAT
) LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    bl.id, bl.name, bl.address_city, bl.address_state,
    bl.logo_url, bl.cover_image_url, bl.avg_rating, bl.review_count,
    bl.price_range, bl.is_claimed, bl.accepting_new_clients,
    ST_Distance(
      bl.location::geography,
      ST_MakePoint(user_lng, user_lat)::geography
    ) / 1000.0 AS distance_km,
    ST_Y(bl.location::geometry) AS latitude,
    ST_X(bl.location::geometry) AS longitude
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
