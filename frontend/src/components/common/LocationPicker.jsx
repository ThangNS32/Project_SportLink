import { useState, useRef, useEffect } from "react";
import "../../styles/location-picker.css";
import { DEFAULT_CENTER } from "./locationPicker/utils";
import {
  fetchNearbyVenues,
  searchNominatim,
  searchOverpass,
} from "./locationPicker/api";
import { loadNearbyCache, saveNearbyCache } from "./locationPicker/storage";
import VenueList from "./locationPicker/VenueList";
import VenueMap from "./locationPicker/VenueMap";

function LocationPicker({ onSelect, onClose, multiSelect = false }) {
  const getInitialCenter = () => {                                                                                                                                                                                                   
      const lat = parseFloat(localStorage.getItem("userLat")) || null;                                                                                                                                                                 
      const lng = parseFloat(localStorage.getItem("userLng")) || null;                                                                                                                                                                 
      return lat && lng ? [lat, lng] : DEFAULT_CENTER;                                                                                                                                                                                 
    };
                                                                                                                                                                                                                                       
  const [center, setCenter] = useState(getInitialCenter);

  const [nearbyVenues, setNearbyVenues] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedList, setSelectedList] = useState([]); // multi mode
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  
  const searchTimeout = useRef(null);

  useEffect(() => {                                                                                                                                                                                                                    
    if (!navigator.geolocation) return;                                                                                                                                                                                              
    navigator.geolocation.getCurrentPosition(                                                                                                                                                                                          
      ({ coords }) => {
        const { latitude, longitude } = coords;                                                                                                                                                                                        
        localStorage.setItem("userLat", latitude);                                                                                                                                                                                     
        localStorage.setItem("userLng", longitude);
        setCenter([latitude, longitude]);                                                                                                                                                                                              
      },                                                                                                                                                                                                                             
      () => {} 
    );                                                                                                                                                                                                                                 
  }, []);

  useEffect(() => {                                                                                                                                                    
    const [lat, lng] = center;                                                                                                                                         
                                          
    const cached = loadNearbyCache(lat, lng);
    if (cached && cached.length > 0) {                                                                                                                                 
      setNearbyVenues(cached);            
      setIsLoadingNearby(false);
      fetchNearbyVenues(center).then((fresh) => {                                                                                                                      
        if (fresh.length > 0) {
          setNearbyVenues(fresh);                                                                                                                                      
          saveNearbyCache(lat, lng, fresh);
        }                                                                                                                                                              
      });
      return;                                                                                                                                                          
    }                                     

    setIsLoadingNearby(true);
    fetchNearbyVenues(center)                                                                                                                                          
      .then((venues) => {
        setNearbyVenues(venues);                                                                                                                                       
        if (venues.length > 0) saveNearbyCache(lat, lng, venues);
      })
      .finally(() => setIsLoadingNearby(false));                                                                                                                       
  }, [center]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchText(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const nominatimResults = await searchNominatim(val, center, userPos);
        if (nominatimResults.length > 0) {
          setSearchResults(nominatimResults);
          return;
        }
        const overpassResults = await searchOverpass(val, center, userPos);
        setSearchResults(overpassResults);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 700);
  };

  const handleSelectVenue = (venue) => {
    setFlyTarget([venue.lat, venue.lng]);
    if (multiSelect) {
      setSelectedList((prev) =>
        prev.find((v) => v.id === venue.id)
          ? prev.filter((v) => v.id !== venue.id)
          : [...prev, venue],
      );
    } else {
      setSelected(venue);
    }
  };

  const handleConfirm = () => {
    if (multiSelect) {
      if (selectedList.length === 0) return;
      onSelect(selectedList);
    } else {
      if (!selected) return;
      onSelect({
        locationName: selected.name,
        locationLat: selected.lat,
        locationLng: selected.lng,
      });
    }
    onClose();
  };

  const selectedIds = multiSelect ? new Set(selectedList.map((v) => v.id)) : null; 

  const isSearchMode = searchText.trim().length > 0;
  const isLoading = isSearchMode ? isSearching : isLoadingNearby;

  const allVenues = nearbyVenues;

  const mapMarkers = [
    ...allVenues,
    ...searchResults.filter((sr) => !allVenues.find((v) => v.id === sr.id)),
  ];

  const clientMatches = isSearchMode
    ? nearbyVenues.filter((v) =>
        v.name?.toLowerCase().includes(searchText.trim().toLowerCase()),
      )
    : [];                                                                                                                                                            
   
  const mergedDisplayList = [                                                                                                                                          
    ...clientMatches,                     
    ...(isSearchMode
      ? searchResults.filter((sr) => !clientMatches.find((v) => v.id === sr.id))
      : nearbyVenues),                                                                                                                                                 
  ];

  const sortedDisplayList =
    !multiSelect && selected
      ? [selected, ...mergedDisplayList.filter((v) => v.id !== selected.id)]
      : mergedDisplayList;

  return (
    <div className="lp-overlay">
      <div className="lp-modal">
        <div className="lp-header">
          <div className="lp-header-left">
            <span className="lp-header-icon">📍</span>
            <div>
              <div className="lp-header-title">
                {multiSelect ? "Lọc theo sân" : "Chọn sân"}
              </div>
              <div className="lp-header-desc">
                {multiSelect
                  ? "Chọn một hoặc nhiều sân ở danh sách hoặc trên bản đồ, sau đó bấm Áp dụng."
                  : "Chọn sân ở danh sách bên trái hoặc trên bản đồ bên phải, sau đó bấm lưu."}
              </div>
            </div>
          </div>
          <button className="lp-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="lp-search-row">
          <div className="lp-search-wrap">
            <svg className="lp-search-icon" viewBox="0 0 20 20" fill="none">
              <circle
                cx="8.5"
                cy="8.5"
                r="5.5"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M13 13l3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              placeholder="Tìm theo tên sân, địa chỉ, quận..."
              className="lp-search-input"
              autoFocus
            />
          </div>
        </div>

        <div className="lp-body">
          <VenueList
            venues={sortedDisplayList}
            selected={selected}
            selectedIds={selectedIds}
            multiSelect={multiSelect}
            onSelect={handleSelectVenue}
            isLoading={isLoading}
            isSearchMode={isSearchMode}
          />
          <VenueMap
            center={center}
            userPos={userPos}
            mapMarkers={mapMarkers}
            selected={selected}
            selectedIds={selectedIds}
            onSelectVenue={handleSelectVenue}
            flyTarget={flyTarget}
          />
        </div>

        <div className="lp-footer">
          <button
            className="lp-btn-deselect"
            onClick={() =>
              multiSelect ? setSelectedList([]) : setSelected(null)
            }
          >
            {multiSelect ? "Bỏ chọn tất cả" : "Bỏ chọn"}
          </button>
          <div className="lp-footer-right">
            <button className="lp-btn-cancel" onClick={onClose}>
              Huỷ
            </button>
            <button
              className="lp-btn-confirm"
              onClick={handleConfirm}
              disabled={multiSelect ? selectedList.length === 0 : !selected}
            >
              {multiSelect
                ? `Áp dụng${selectedList.length > 0 ? ` (${selectedList.length} sân)` : ""}`
                : "Lưu chọn sân"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationPicker;
