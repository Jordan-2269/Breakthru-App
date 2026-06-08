import type { ChildNeed, ListingSearchResult, MatchedListing } from '@/types/app';
import { DEFAULT_SEARCH_RADIUS_KM } from './constants';

type ListingWithServices = ListingSearchResult & {
  service_type_ids?: string[];
};

export function computeMatchScore(
  listing: ListingWithServices,
  childNeeds: ChildNeed[],
  maxRadiusKm: number = DEFAULT_SEARCH_RADIUS_KM,
): MatchedListing {
  const serviceScore = computeServiceScore(listing.service_type_ids ?? [], childNeeds);
  const proximityScore = computeProximityScore(listing.distance_km, maxRadiusKm);
  const qualityScore = (listing.avg_rating / 5) * 100;

  const matchedServiceIds = (listing.service_type_ids ?? []).filter((id) =>
    childNeeds.some((n) => n.service_type_id === id),
  );

  const matchScore = Math.round(
    serviceScore * 0.5 + proximityScore * 0.3 + qualityScore * 0.2,
  );

  return {
    ...listing,
    matchScore,
    serviceMatchScore: Math.round(serviceScore),
    proximityScore: Math.round(proximityScore),
    qualityScore: Math.round(qualityScore),
    matchedServiceIds,
  };
}

function computeServiceScore(listingServiceIds: string[], childNeeds: ChildNeed[]): number {
  if (childNeeds.length === 0) return 50;

  const totalPriority = childNeeds.reduce((sum, n) => sum + n.priority, 0);
  const matchedPriority = childNeeds
    .filter((n) => listingServiceIds.includes(n.service_type_id))
    .reduce((sum, n) => sum + n.priority, 0);

  return totalPriority === 0 ? 0 : (matchedPriority / totalPriority) * 100;
}

function computeProximityScore(distanceKm: number, maxRadiusKm: number): number {
  return Math.max(0, (1 - distanceKm / maxRadiusKm) * 100);
}

export function sortByMatchScore(listings: MatchedListing[]): MatchedListing[] {
  return [...listings].sort((a, b) => b.matchScore - a.matchScore);
}

export function getMatchColor(score: number): string {
  if (score >= 80) return '#0D9E5C';
  if (score >= 60) return '#0A66C2';
  if (score >= 40) return '#E07B00';
  return '#999999';
}

export function getMatchLabel(score: number): string {
  if (score >= 80) return 'Top Match';
  if (score >= 60) return 'Good Match';
  if (score >= 40) return 'Fair Match';
  return 'Low Match';
}
