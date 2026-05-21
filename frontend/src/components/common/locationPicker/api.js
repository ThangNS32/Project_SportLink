import { haversineKm, formatAddress } from "./utils";

const OVERPASS_ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

const SPORT_ALIASES = {
  "cầu lông": ["badminton"],
  "bóng đá": ["football", "soccer"],
  "bong da": ["football", "soccer"],
  "cau long": ["badminton"],
};

//Hàm gửi query đến Overpass API 
async function fetchOverpass(query, timeoutMs = 10000) {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(endpoint, { method: "POST", body: query, signal: controller.signal });
      clearTimeout(timer);
      if (res.status === 429 || res.status >= 500) continue;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      clearTimeout(timer);
      if (e.name === "AbortError") continue;
      if (endpoint === OVERPASS_ENDPOINTS.at(-1)) throw e;
    }
  }
  throw new Error("Không thể kết nối Overpass API");
}

export async function fetchNearbyVenues(center) {
  const [lat, lng] = center;
  const query = `[out:json][timeout:10];
  (                                                                                                                                                                    
    node["sport"="football"](around:10000,${lat},${lng});
    way["sport"="football"](around:10000,${lat},${lng});                                                                                                               
    node["sport"="soccer"](around:10000,${lat},${lng});                                                                                                                
    way["sport"="soccer"](around:10000,${lat},${lng});                                                                                                                 
    node["sport"="badminton"](around:10000,${lat},${lng});                                                                                                             
    way["sport"="badminton"](around:10000,${lat},${lng});
    node["sport"="pickleball"](around:10000,${lat},${lng});                                                                                                            
    way["sport"="pickleball"](around:10000,${lat},${lng});                                                                                                             
    node["leisure"="sports_centre"](around:10000,${lat},${lng});
    way["leisure"="sports_centre"](around:10000,${lat},${lng});                                                                                                        
    node["leisure"="pitch"](around:10000,${lat},${lng});
    way["leisure"="pitch"](around:10000,${lat},${lng});                                                                                                                
  );              
  out center;`;

  try {
    const data = await fetchOverpass(query, 8000); // timeout 8s
    const results = data.elements
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
    return results;
  } catch {
    return []; 
  }
}

export async function searchNominatim(val, center, userPos) {
  const [lat, lng] = center;
  const [uLat, uLng] = userPos || center;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&countrycodes=vn&limit=10&addressdetails=1&viewbox=${lng - 0.3},${lat +
    0.3},${lng + 0.3},${lat - 0.3}&bounded=0`,
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
  const lowerVal = val.toLowerCase();

  const matchedTags = Object.entries(SPORT_ALIASES)
    .filter(([key]) => lowerVal.includes(key))
    .flatMap(([, tags]) => tags);

  const sportTagLines = matchedTags
    .flatMap((tag) => [
      `node["sport"="${tag}"](around:10000,${lat},${lng});`,
      `way["sport"="${tag}"](around:10000,${lat},${lng});`,
    ])
    .join("\n  ");

  const escaped = val.replace(/[.+*?^${}()|[\]\\]/g, "\\$&");
  const query = `[out:json][timeout:10];
  (                                                                                                                                                                    
    node["name"~"${escaped}",i]["sport"](around:10000,${lat},${lng});
    way["name"~"${escaped}",i]["sport"](around:10000,${lat},${lng});                                                                                                   
    node["name"~"${escaped}",i]["leisure"~"sports_centre|pitch"](around:10000,${lat},${lng});
    way["name"~"${escaped}",i]["leisure"~"sports_centre|pitch"](around:10000,${lat},${lng});                                                                           
    ${sportTagLines}                                                                                                                                                   
  );                                                                                                                                                                   
  out center;`;

  const data = await fetchOverpass(query);
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
}