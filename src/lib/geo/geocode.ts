import "server-only";

/**
 * Calls the Google Maps Geocoding API when GOOGLE_MAPS_API_KEY is
 * configured; returns null otherwise (callers should fall back to
 * requiring the user's own geolocation, as salon registration already
 * does). Add the env var later and address-based geocoding activates with
 * no code change — matches the pattern used for email/SMS providers.
 */
export async function geocodeAddress(input: {
  address: string;
  suburb: string;
  state: string;
  postcode: string;
}): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.log(`[geocode:dev-mode] No GOOGLE_MAPS_API_KEY configured, skipping lookup for: ${input.address}, ${input.suburb}`);
    return null;
  }

  const fullAddress = `${input.address}, ${input.suburb} ${input.state} ${input.postcode}, Australia`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const location = data?.results?.[0]?.geometry?.location;
    if (!location) return null;
    return { lat: location.lat, lng: location.lng };
  } catch (e) {
    console.error("Geocoding request failed", e);
    return null;
  }
}
