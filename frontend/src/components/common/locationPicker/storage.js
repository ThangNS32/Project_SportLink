const NEARBY_CACHE_KEY = "sportlink_nearby_venues";                                                                                                                  
const NEARBY_TTL = 6 * 60 * 60 * 1000; // 6 giờ

function nearbyKey(lat, lng) {          
    return `${NEARBY_CACHE_KEY}_${lat.toFixed(2)}_${lng.toFixed(2)}`;                                                                                                  
}                                       

export function loadNearbyCache(lat, lng) {                                                                                                                          
    try {
        const raw = localStorage.getItem(nearbyKey(lat, lng));                                                                                                           
        if (!raw) return null;              
        const { venues, ts } = JSON.parse(raw);
        return Date.now() - ts > NEARBY_TTL ? null : venues;
    } catch {                                                                                                                                                          
        return null;
    }                                                                                                                                                                  
}                                       

export function saveNearbyCache(lat, lng, venues) {
    try {
        localStorage.setItem(nearbyKey(lat, lng), JSON.stringify({ venues, ts: Date.now() }));
    } catch {}                                                                                                                                                         
}