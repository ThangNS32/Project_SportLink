export const DEFAULT_CENTER = [21.028, 105.834];
                                                                                                                                                                       
  export function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;                                                                                                                                                    
    const dLat = ((lat2 - lat1) * Math.PI) / 180;                                                                                                                      
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =                                                                                                                                                          
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *                                                                                                                               
        Math.cos((lat2 * Math.PI) / 180) *                                                                                                                             
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));                                                                                                         
  }                                                                                                                                                                    
   
  export function formatDist(km) {                                                                                                                                     
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;                                                                                                                                      
  }
                                                                                                                                                                       
  export function formatAddress(tags) {                                                                                                                                
    const parts = [
      tags?.["addr:housenumber"],                                                                                                                                      
      tags?.["addr:street"],                                                                                                                                           
      tags?.["addr:quarter"],
      tags?.["addr:suburb"],                                                                                                                                           
      tags?.["addr:district"],
      tags?.["addr:city"],                                                                                                                                             
    ].filter(Boolean);
    return parts.join(", ") || null;                                                                                                                                   
  }               
               