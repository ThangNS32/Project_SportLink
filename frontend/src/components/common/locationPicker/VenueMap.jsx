import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { venueIcon, selectedIcon, userIcon } from "./icons";

function MapController({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 16, { duration: 0.8 });
  }, [target, map]);
  return null;
}

function VenueMap({
  center,
  userPos,
  mapMarkers,
  selected,
  selectedIds,
  onSelectVenue,
  flyTarget,
}) {
  return (
    <div className="lp-map">
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapController target={flyTarget} />

        {userPos && <Marker position={userPos} icon={userIcon} />}

        {mapMarkers.map((venue) => {
          const isSelected = selectedIds
            ? selectedIds.has(venue.id)
            : selected?.id === venue.id;
          return (
            <Marker
              key={venue.id}
              position={[venue.lat, venue.lng]}
              icon={isSelected ? selectedIcon : venueIcon}
              eventHandlers={{ click: () => onSelectVenue(venue) }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}

export default VenueMap;
