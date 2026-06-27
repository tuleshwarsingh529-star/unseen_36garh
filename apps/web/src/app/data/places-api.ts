/**
 * places-api.ts
 *
 * Static data layer — all destination data is served directly from
 * the bundled TypeScript constant `DESTINATIONS`. No network round-trip
 * to the backend is needed for public read operations, eliminating
 * latency and removing the hard dependency on localhost:4000 being online.
 *
 * Write operations (admin content submission, moderation) still go through
 * the NestJS backend via their own dedicated page-level fetch calls.
 */

import { DESTINATIONS, Destination } from './destinations';

export async function fetchAllPlaces(
  categorySlug?: string,
  district?: string,
): Promise<Destination[]> {
  return DESTINATIONS.filter(item => {
    const matchCategory = !categorySlug || item.category === categorySlug;
    const matchDistrict  = !district   || item.district  === district;
    return matchCategory && matchDistrict;
  });
}

export async function fetchPlaceBySlug(slug: string): Promise<Destination> {
  const place = DESTINATIONS.find(
    item => item.id === slug || item.id.replace('-falls', '') === slug.replace('-falls', '')
  );
  if (!place) {
    throw new Error(`Destination '${slug}' not found.`);
  }
  return place;
}

export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  radiusKm: number = 50,
): Promise<Record<string, unknown>[]> {
  return DESTINATIONS
    .map(place => {
      const dist = haversine(lat, lng, place.coordinates.lat, place.coordinates.lng);
      return {
        id:           place.id,
        name:         place.name,
        slug:         place.id,
        tagline:      place.tagline,
        distance_km:  dist,
        coordinates:  place.coordinates,
      };
    })
    .filter(item => item.distance_km <= radiusKm)
    .sort((a, b) => (a.distance_km as number) - (b.distance_km as number));
}

// Haversine great-circle distance (km)
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R    = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
