-- Enable PostGIS for geo queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- USER PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('parent', 'business')),
  display_name  TEXT,
  avatar_url    TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile row when a user signs up
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SERVICE TYPE TAXONOMY
-- ============================================================
CREATE TABLE public.service_types (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL UNIQUE,
  category     TEXT,
  icon_name    TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHILD PROFILES
-- ============================================================
CREATE TABLE public.child_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  date_of_birth     DATE,
  autism_diagnosis  TEXT,
  diagnosis_date    DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.child_service_needs (
  child_id         UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  service_type_id  UUID REFERENCES public.service_types(id) ON DELETE CASCADE,
  priority         INT DEFAULT 1 CHECK (priority BETWEEN 1 AND 3),
  PRIMARY KEY (child_id, service_type_id)
);

-- ============================================================
-- BUSINESS LISTINGS
-- ============================================================
CREATE TABLE public.business_listings (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id               UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name                   TEXT NOT NULL,
  slug                   TEXT UNIQUE,
  description            TEXT,
  phone                  TEXT,
  email                  TEXT,
  website_url            TEXT,
  address_line1          TEXT,
  address_city           TEXT,
  address_state          TEXT,
  address_zip            TEXT,
  address_country        TEXT DEFAULT 'US',
  location               GEOGRAPHY(POINT, 4326),
  google_place_id        TEXT UNIQUE,
  is_claimed             BOOLEAN DEFAULT FALSE,
  logo_url               TEXT,
  cover_image_url        TEXT,
  accepting_new_clients  BOOLEAN DEFAULT TRUE,
  price_range            TEXT CHECK (price_range IN ('$', '$$', '$$$', 'insurance')),
  avg_rating             NUMERIC(3,2) DEFAULT 0,
  review_count           INT DEFAULT 0,
  is_active              BOOLEAN DEFAULT TRUE,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_business_listings_location ON public.business_listings USING GIST (location);
CREATE INDEX idx_business_listings_google_place_id ON public.business_listings (google_place_id);

CREATE TABLE public.business_photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID NOT NULL REFERENCES public.business_listings(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  url           TEXT NOT NULL,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.business_services (
  listing_id       UUID REFERENCES public.business_listings(id) ON DELETE CASCADE,
  service_type_id  UUID REFERENCES public.service_types(id) ON DELETE CASCADE,
  description      TEXT,
  price_from       NUMERIC(10,2),
  price_to         NUMERIC(10,2),
  price_unit       TEXT DEFAULT 'session',
  PRIMARY KEY (listing_id, service_type_id)
);

-- ============================================================
-- THERAPISTS
-- ============================================================
CREATE TABLE public.therapists (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id            UUID NOT NULL REFERENCES public.business_listings(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  title                 TEXT,
  bio                   TEXT,
  avatar_url            TEXT,
  years_experience      INT,
  avg_rating            NUMERIC(3,2) DEFAULT 0,
  review_count          INT DEFAULT 0,
  is_accepting_clients  BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.therapist_specializations (
  therapist_id     UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
  service_type_id  UUID REFERENCES public.service_types(id) ON DELETE CASCADE,
  PRIMARY KEY (therapist_id, service_type_id)
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE public.reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id   UUID NOT NULL REFERENCES public.profiles(id),
  listing_id    UUID REFERENCES public.business_listings(id) ON DELETE CASCADE,
  therapist_id  UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
  rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title         TEXT,
  body          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT review_target CHECK (listing_id IS NOT NULL OR therapist_id IS NOT NULL)
);

-- Trigger to recalculate avg_rating on business_listings after review change
CREATE OR REPLACE FUNCTION update_listing_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.business_listings
  SET
    avg_rating   = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE listing_id = COALESCE(NEW.listing_id, OLD.listing_id)),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE listing_id = COALESCE(NEW.listing_id, OLD.listing_id))
  WHERE id = COALESCE(NEW.listing_id, OLD.listing_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_listing_rating();

-- ============================================================
-- SAVED LISTINGS
-- ============================================================
CREATE TABLE public.saved_listings (
  parent_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id  UUID REFERENCES public.business_listings(id) ON DELETE CASCADE,
  saved_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (parent_id, listing_id)
);

-- ============================================================
-- MESSAGING
-- ============================================================
CREATE TABLE public.conversations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id             UUID NOT NULL REFERENCES public.profiles(id),
  listing_id            UUID NOT NULL REFERENCES public.business_listings(id),
  child_id              UUID REFERENCES public.child_profiles(id),
  last_message          TEXT,
  last_message_at       TIMESTAMPTZ,
  parent_unread_count   INT DEFAULT 0,
  business_unread_count INT DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (parent_id, listing_id)
);

CREATE TABLE public.messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id        UUID NOT NULL REFERENCES public.profiles(id),
  sender_role      TEXT NOT NULL CHECK (sender_role IN ('parent', 'business')),
  body             TEXT NOT NULL,
  read_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON public.messages (conversation_id, created_at DESC);
CREATE INDEX idx_conversations_parent_id ON public.conversations (parent_id);
CREATE INDEX idx_conversations_listing_id ON public.conversations (listing_id);

-- Trigger to update conversation metadata on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_message_insert
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();
