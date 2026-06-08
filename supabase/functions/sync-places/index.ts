import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PLACES_QUERIES = [
  'autism therapy services',
  'ABA therapy autism',
  'speech therapy autism',
  'occupational therapy autism',
];

interface PlaceResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  photos?: Array<{ name: string }>;
}

Deno.serve(async (req: Request) => {
  const { lat, lng, radius = 25 } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY_SERVER')!;
  let totalUpserted = 0;

  for (const query of PLACES_QUERIES) {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.internationalPhoneNumber,places.websiteUri,places.rating,places.photos',
      },
      body: JSON.stringify({
        textQuery: query,
        locationBias: lat && lng ? {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radius * 1000,
          },
        } : undefined,
        maxResultCount: 20,
      }),
    });

    const json = await response.json();
    const places: PlaceResult[] = json.places ?? [];

    for (const place of places) {
      if (!place.location) continue;

      // Build a direct photo URL from the first photo reference
      const photoUrl = place.photos?.[0]?.name
        ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxWidthPx=800&key=${apiKey}`
        : null;

      const { error } = await supabase.from('business_listings').upsert(
        {
          google_place_id: place.id,
          name: place.displayName?.text ?? 'Unnamed',
          address_line1: place.formattedAddress ?? null,
          phone: place.internationalPhoneNumber ?? null,
          website_url: place.websiteUri ?? null,
          is_claimed: false,
          is_active: true,
          avg_rating: place.rating ?? 0,
          cover_image_url: photoUrl,
          location: `SRID=4326;POINT(${place.location.longitude} ${place.location.latitude})`,
        },
        // ignoreDuplicates: false so existing records get their photos updated
        { onConflict: 'google_place_id', ignoreDuplicates: false },
      );

      if (!error) totalUpserted++;
    }
  }

  return new Response(JSON.stringify({ upserted: totalUpserted }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
