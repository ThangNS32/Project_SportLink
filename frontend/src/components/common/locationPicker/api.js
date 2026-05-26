import { haversineKm, formatAddress } from "./utils";

const BACKEND = import.meta.env.VITE_API_URL || "http://localhost:8080/sportlink";

export async function fetchNearbyVenues(center) {
  const [lat, lng] = center;
  try {
    const res = await fetch(`${BACKEND}/api/overpass/nearby?lat=${lat}&lng=${lng}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.elements
      .map((el) => ({
        id: `${el.type}-${el.id}`,
        name: el.tags?.["name:vi"] || el.tags?.name || null,
        address: formatAddress(el.tags),
        lat: el.lat ?? el.center?.lat,
        lng: el.lon ?? el.center?.lon,
      }))
      .filter((v) => v.lat && v.lng && v.name)
      .map((v) => ({ ...v, dist: haversineKm(lat, lng, v.lat, v.lng) }))
      .sort((a, b) => a.dist - b.dist);
  } catch {
    return [];
  }
}

export async function searchNominatim(val, center, userPos) {
  const [lat, lng] = center;
  const [uLat, uLng] = userPos || center;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&countrycodes=vn&limit=10&addressdetails=1&viewbox=${lng - 0.3},${lat + 0.3},${lng +
    0.3},${lat - 0.3}&bounded=0`,
    { headers: { "Accept-Language": "vi" } },
  );
  const data = await res.json();
  return data
    .map((place) => ({
      id: `nom-${place.place_id}`,
      name: place.display_name.split(",")[0],
      address: place.display_name.split(",").slice(1, 4).join(",").trim(),
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      dist: haversineKm(uLat, uLng, parseFloat(place.lat), parseFloat(place.lon)),
    }))
    .sort((a, b) => a.dist - b.dist);
}

export async function searchOverpass(val, center, userPos) {
  const [lat, lng] = center;
  const [uLat, uLng] = userPos || center;
  try {
    const res = await fetch(
      `${BACKEND}/api/overpass/search?lat=${lat}&lng=${lng}&q=${encodeURIComponent(val)}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.elements
      .map((el) => ({
        id: `srch-${el.type}-${el.id}`,
        name: el.tags?.name || el.tags?.["name:vi"] || null,
        address: formatAddress(el.tags),
        lat: el.lat ?? el.center?.lat,
        lng: el.lon ?? el.center?.lon,
      }))
      .filter((v) => v.lat && v.lng && v.name)
      .map((v) => ({ ...v, dist: haversineKm(uLat, uLng, v.lat, v.lng) }))
      .sort((a, b) => a.dist - b.dist);
  } catch {
    return [];
  }
}