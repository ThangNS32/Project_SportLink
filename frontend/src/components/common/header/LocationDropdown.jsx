import { useState, useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";

const LOCATIONS = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng"];

const CITY_COORDS = {
  "Hà Nội": { lat: 21.0285, lng: 105.8542 },
  "TP. Hồ Chí Minh": { lat: 10.7769, lng: 106.7009 },
  "Đà Nẵng": { lat: 16.0544, lng: 108.2022 },
};

function LocationDropdown({ location, onSelect }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(false);
    if (show) document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [show]);

  return (
    <div style={{ position: "relative" }}>
      <button
        className="home-nav-btn sp-loc-btn"
        onClick={(e) => {
          e.stopPropagation();
          setShow((v) => !v);
        }}
      >
        <MapPin size={15} />
        {location}
        <ChevronDown size={13} opacity={0.6} />
      </button>

      {show && (
        <div className="hd-loc-dropdown">
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              className={`hd-loc-item${loc === location ? " hd-loc-item--active" : ""}`}
              onClick={() => {
                const coords = CITY_COORDS[loc];
                if (coords) {
                  localStorage.setItem("userLat", coords.lat);
                  localStorage.setItem("userLng", coords.lng);
                }
                onSelect(loc);
                setShow(false);
              }}
            >
              {loc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocationDropdown;
