import { formatDist } from "./utils";

function VenueList({
  venues,
  selected,
  selectedIds,
  multiSelect,
  onSelect,
  isLoading,
  isSearchMode,
}) {
  return (
    <div className="lp-list">
      {isLoading && <div className="lp-list-status">Đang tìm kiếm...</div>}
      {!isLoading && venues.length === 0 && (
        <div className="lp-list-status">
          {isSearchMode
            ? "Không tìm thấy địa điểm nào."
            : "Không tìm thấy sân gần bạn."}
        </div>
      )}

      {venues.map((venue) => {
        // THÊM: tính isSelected theo mode
        const isSelected = multiSelect
          ? (selectedIds?.has(venue.id) ?? false)
          : selected?.id === venue.id;
        return (
          <div
            key={venue.id}
            className={`lp-venue-item${isSelected ? " lp-venue-item--selected" : ""}`}
            onClick={() => onSelect(venue)}
          >
            {/* THÊM: checkbox khi multi, radio khi single */}
            {multiSelect ? (
              <div
                className={`lp-checkbox${isSelected ? " lp-checkbox--checked" : ""}`}
              />
            ) : (
              <div
                className={`lp-radio${isSelected ? " lp-radio--checked" : ""}`}
              />
            )}
            <div className="lp-venue-info">
              <div className="lp-venue-name">{venue.name}</div>
              {venue.address && (
                <div className="lp-venue-address">{venue.address}</div>
              )}
            </div>
            {venue.dist != null && (
              <div className="lp-venue-dist">{formatDist(venue.dist)}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default VenueList;
