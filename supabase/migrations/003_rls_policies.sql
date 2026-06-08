-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- service_types (public read)
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read service types" ON public.service_types FOR SELECT USING (TRUE);

-- child_profiles (parent only)
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents manage own children" ON public.child_profiles
  USING (parent_id = auth.uid());
CREATE POLICY "Parents insert children" ON public.child_profiles
  FOR INSERT WITH CHECK (parent_id = auth.uid());

-- child_service_needs
ALTER TABLE public.child_service_needs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents manage child needs" ON public.child_service_needs
  USING (
    EXISTS (
      SELECT 1 FROM public.child_profiles cp
      WHERE cp.id = child_id AND cp.parent_id = auth.uid()
    )
  );
CREATE POLICY "Parents insert child needs" ON public.child_service_needs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.child_profiles cp
      WHERE cp.id = child_id AND cp.parent_id = auth.uid()
    )
  );

-- business_listings (public read, owner write)
ALTER TABLE public.business_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active listings" ON public.business_listings
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Owners manage own listings" ON public.business_listings
  FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Owners insert listings" ON public.business_listings
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- business_photos
ALTER TABLE public.business_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view photos" ON public.business_photos FOR SELECT USING (TRUE);
CREATE POLICY "Owners manage photos" ON public.business_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.business_listings bl
      WHERE bl.id = listing_id AND bl.owner_id = auth.uid()
    )
  );

-- business_services
ALTER TABLE public.business_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view services" ON public.business_services FOR SELECT USING (TRUE);
CREATE POLICY "Owners manage services" ON public.business_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.business_listings bl
      WHERE bl.id = listing_id AND bl.owner_id = auth.uid()
    )
  );

-- therapists
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view therapists" ON public.therapists FOR SELECT USING (TRUE);
CREATE POLICY "Owners manage therapists" ON public.therapists
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.business_listings bl
      WHERE bl.id = listing_id AND bl.owner_id = auth.uid()
    )
  );

-- therapist_specializations
ALTER TABLE public.therapist_specializations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view specializations" ON public.therapist_specializations FOR SELECT USING (TRUE);
CREATE POLICY "Owners manage specializations" ON public.therapist_specializations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.therapists t
      JOIN public.business_listings bl ON bl.id = t.listing_id
      WHERE t.id = therapist_id AND bl.owner_id = auth.uid()
    )
  );

-- reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can write reviews" ON public.reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- saved_listings
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents manage own saved" ON public.saved_listings
  USING (parent_id = auth.uid());
CREATE POLICY "Parents insert saved" ON public.saved_listings
  FOR INSERT WITH CHECK (parent_id = auth.uid());

-- conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view conversations" ON public.conversations
  FOR SELECT USING (
    parent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.business_listings bl
      WHERE bl.id = listing_id AND bl.owner_id = auth.uid()
    )
  );
CREATE POLICY "Parents can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (parent_id = auth.uid());
CREATE POLICY "Participants can update conversations" ON public.conversations
  FOR UPDATE USING (
    parent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.business_listings bl
      WHERE bl.id = listing_id AND bl.owner_id = auth.uid()
    )
  );

-- messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can read messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (
          c.parent_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.business_listings bl
            WHERE bl.id = c.listing_id AND bl.owner_id = auth.uid()
          )
        )
    )
  );
CREATE POLICY "Participants can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (
          c.parent_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.business_listings bl
            WHERE bl.id = c.listing_id AND bl.owner_id = auth.uid()
          )
        )
    )
  );
