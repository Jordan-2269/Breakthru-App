export const SERVICE_CATEGORIES = [
  {
    category: 'Behavioral',
    services: [
      { id: 'aba', name: 'ABA Therapy', icon: 'brain-circuit' },
      { id: 'applied-behavior', name: 'Applied Behavior Analysis', icon: 'brain-circuit' },
      { id: 'social-skills', name: 'Social Skills Training', icon: 'users' },
    ],
  },
  {
    category: 'Communication',
    services: [
      { id: 'speech', name: 'Speech Therapy', icon: 'message-circle' },
      { id: 'social-stories', name: 'Social Stories', icon: 'book-open' },
    ],
  },
  {
    category: 'Sensory & Motor',
    services: [
      { id: 'ot', name: 'Occupational Therapy', icon: 'hand' },
      { id: 'sensory', name: 'Sensory Integration', icon: 'sparkles' },
      { id: 'pt', name: 'Physical Therapy', icon: 'activity' },
      { id: 'feeding', name: 'Feeding Therapy', icon: 'utensils' },
    ],
  },
  {
    category: 'Developmental',
    services: [
      { id: 'early-intervention', name: 'Early Intervention', icon: 'seedling' },
      { id: 'dir-floortime', name: 'DIR/Floortime', icon: 'child' },
      { id: 'rdi', name: 'RDI Therapy', icon: 'compass' },
    ],
  },
  {
    category: 'Creative',
    services: [
      { id: 'music', name: 'Music Therapy', icon: 'music' },
      { id: 'art', name: 'Art Therapy', icon: 'palette' },
    ],
  },
  {
    category: 'Support',
    services: [
      { id: 'parent-training', name: 'Parent Training', icon: 'users' },
    ],
  },
];

export const ALL_SERVICES = SERVICE_CATEGORIES.flatMap((c) => c.services);

export const AUTISM_DIAGNOSES = [
  'ASD Level 1 (High Functioning)',
  'ASD Level 2',
  'ASD Level 3 (Severe)',
  'Asperger Syndrome',
  'PDD-NOS',
  'Childhood Disintegrative Disorder',
  'Other / Not Yet Diagnosed',
];

export const PRICE_RANGE_LABELS: Record<string, string> = {
  $: 'Low Cost',
  $$: 'Moderate',
  $$$: 'Premium',
  insurance: 'Insurance Accepted',
};

export const MAX_SEARCH_RADIUS_KM = 100;
export const DEFAULT_SEARCH_RADIUS_KM = 25;
