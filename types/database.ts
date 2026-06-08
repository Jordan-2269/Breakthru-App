export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'parent' | 'business';
          display_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      child_profiles: {
        Row: {
          id: string;
          parent_id: string;
          name: string;
          date_of_birth: string | null;
          autism_diagnosis: string | null;
          diagnosis_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['child_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['child_profiles']['Insert']>;
      };
      service_types: {
        Row: {
          id: string;
          name: string;
          category: string | null;
          icon_name: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['service_types']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['service_types']['Insert']>;
      };
      child_service_needs: {
        Row: {
          child_id: string;
          service_type_id: string;
          priority: number;
        };
        Insert: Database['public']['Tables']['child_service_needs']['Row'];
        Update: Partial<Database['public']['Tables']['child_service_needs']['Row']>;
      };
      business_listings: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          slug: string | null;
          description: string | null;
          phone: string | null;
          email: string | null;
          website_url: string | null;
          address_line1: string | null;
          address_city: string | null;
          address_state: string | null;
          address_zip: string | null;
          address_country: string;
          google_place_id: string | null;
          is_claimed: boolean;
          logo_url: string | null;
          cover_image_url: string | null;
          accepting_new_clients: boolean;
          price_range: '$' | '$$' | '$$$' | 'insurance' | null;
          avg_rating: number;
          review_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['business_listings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['business_listings']['Insert']>;
      };
      business_photos: {
        Row: {
          id: string;
          listing_id: string;
          storage_path: string;
          url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['business_photos']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['business_photos']['Insert']>;
      };
      business_services: {
        Row: {
          listing_id: string;
          service_type_id: string;
          description: string | null;
          price_from: number | null;
          price_to: number | null;
          price_unit: string;
        };
        Insert: Database['public']['Tables']['business_services']['Row'];
        Update: Partial<Database['public']['Tables']['business_services']['Row']>;
      };
      therapists: {
        Row: {
          id: string;
          listing_id: string;
          name: string;
          title: string | null;
          bio: string | null;
          avatar_url: string | null;
          years_experience: number | null;
          avg_rating: number;
          review_count: number;
          is_accepting_clients: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['therapists']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['therapists']['Insert']>;
      };
      therapist_specializations: {
        Row: {
          therapist_id: string;
          service_type_id: string;
        };
        Insert: Database['public']['Tables']['therapist_specializations']['Row'];
        Update: Partial<Database['public']['Tables']['therapist_specializations']['Row']>;
      };
      reviews: {
        Row: {
          id: string;
          reviewer_id: string;
          listing_id: string | null;
          therapist_id: string | null;
          rating: number;
          title: string | null;
          body: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      saved_listings: {
        Row: {
          parent_id: string;
          listing_id: string;
          saved_at: string;
        };
        Insert: Omit<Database['public']['Tables']['saved_listings']['Row'], 'saved_at'>;
        Update: never;
      };
      conversations: {
        Row: {
          id: string;
          parent_id: string;
          listing_id: string;
          child_id: string | null;
          last_message: string | null;
          last_message_at: string | null;
          parent_unread_count: number;
          business_unread_count: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          sender_role: 'parent' | 'business';
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
    };
    Functions: {
      search_listings_near: {
        Args: {
          user_lat: number;
          user_lng: number;
          radius_km?: number;
          service_type_ids?: string[];
        };
        Returns: Array<{
          id: string;
          name: string;
          address_city: string | null;
          address_state: string | null;
          logo_url: string | null;
          avg_rating: number;
          review_count: number;
          price_range: string | null;
          is_claimed: boolean;
          distance_km: number;
        }>;
      };
    };
  };
};
