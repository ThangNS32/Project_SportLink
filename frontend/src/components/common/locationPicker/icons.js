import L from "leaflet";
                                                                                                                                                                       
  delete L.Icon.Default.prototype._getIconUrl;                                                                                                                         
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",                                                                                   
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",                                                                                            
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });                                                                                                                                                                  
                  
  const PIN_SVG = (color) =>                                                                                                                                           
    `<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20C24 5.373 18.627 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>                      
      <circle cx="12" cy="12" r="4" fill="#fff"/>                                                                                                                      
    </svg>`;
                                                                                                                                                                       
  export const venueIcon = L.divIcon({                                                                                                                                 
    className: "",
    html: PIN_SVG("#3b82f6"),                                                                                                                                          
    iconSize: [24, 32],
    iconAnchor: [12, 32],                                                                                                                                              
    popupAnchor: [0, -34],
  });                                                                                                                                                                  
                  
  export const selectedIcon = L.divIcon({
    className: "",
    html: PIN_SVG("#f97316"),                                                                                                                                          
    iconSize: [28, 37],
    iconAnchor: [14, 37],                                                                                                                                              
    popupAnchor: [0, -38],                                                                                                                                             
  });
                                                                                                                                                                       
  export const userIcon = L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;background:#22c55e;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(34,197,94,0.3)"></div>`,
    iconSize: [16, 16],                                                                                                                                                
    iconAnchor: [8, 8],
  });                                                                                                                                                                  
       