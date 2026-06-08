import type { Database } from './database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ChildProfile = Database['public']['Tables']['child_profiles']['Row'];
export type ServiceType = Database['public']['Tables']['service_types']['Row'];
export type ChildServiceNeed = Database['public']['Tables']['child_service_needs']['Row'];
export type BusinessListing = Database['public']['Tables']['business_listings']['Row'];
export type BusinessPhoto = Database['public']['Tables']['business_photos']['Row'];
export type BusinessService = Database['public']['Tables']['business_services']['Row'];
export type Therapist = Database['public']['Tables']['therapists']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];

export type ListingSearchResult = {
  id: string;
  name: string;
  address_city: string | null;
  address_state: string | null;
  logo_url: string | null;
  cover_image_url?: string | null;
  avg_rating: number;
  review_count: number;
  price_range: string | null;
  is_claimed: boolean;
  accepting_new_clients: boolean | null;
  distance_km: number;
  latitude: number | null;
  longitude: number | null;
  service_type_ids?: string[];
};

export type MatchedListing = ListingSearchResult & {
  matchScore: number;
  serviceMatchScore: number;
  proximityScore: number;
  qualityScore: number;
  matchedServiceIds: string[];
};

export type ChildNeed = {
  service_type_id: string;
  service_name: string;
  priority: 1 | 2 | 3;
};

export type BusinessListingDetail = BusinessListing & {
  photos: BusinessPhoto[];
  services: Array<BusinessService & { service_type: ServiceType }>;
  therapists: Array<Therapist & { specializations: ServiceType[] }>;
  reviews: Array<Review & { reviewer: Pick<Profile, 'display_name' | 'avatar_url'> }>;
};

export type ConversationWithMeta = Conversation & {
  listing: Pick<BusinessListing, 'name' | 'logo_url'>;
  last_message_preview: string | null;
};

export type UserRole = 'parent' | 'business';

export type ViewMode = 'list' | 'map';

export type SearchFilters = {
  radiusKm: number;
  serviceTypeIds: string[];
  minRating: number;
  acceptingOnly: boolean;
};

export const DEFAULT_FILTERS: SearchFilters = {
  radiusKm: 25,
  serviceTypeIds: [],
  minRating: 0,
  acceptingOnly: false,
};
