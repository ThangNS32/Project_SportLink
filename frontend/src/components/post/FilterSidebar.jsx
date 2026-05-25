import {
  SPORT_CONFIG,
  SKILL_LEVELS,
  PLAY_FORMATS,
} from "../constants/filterConfig";
import { useState } from "react";
import { createPortal } from "react-dom";
import LocationPicker from "../common/LocationPicker";
import "../../styles/filter-sidebar.css";

function FilterSidebar({
  selectedSportSlug,
  setSelectedSportSlug,
  playDate,
  setPlayDate,
  timeFrom,
  setTimeFrom,
  skillLevel,
  setSkillLevel,
  slotsRange,
  setSlotsRange,
  distanceRange,
  setDistanceRange,
  playFormat,
  setPlayFormat,
  hasPlayFormat,
  onSearch,
  onReset,
  selectedVenues,
  setSelectedVenues,
}) {
  const [showVenuePicker, setShowVenuePicker] = useState(false);

  return (
    <aside className="sp-sidebar">
      <div className="sp-filter-card">
        <div className="sp-filter-title">⚙ Bộ lọc</div>

        {/* 1. Môn thể thao */}
        <div className="sp-filter-section">
          <label className="sp-filter-label">Môn thể thao</label>
          <div className="sp-chip-group">
            <button
              className={`sp-chip${selectedSportSlug === "" ? " sp-chip--active" : ""}`}
              onClick={() => setSelectedSportSlug("")}
            >
              Tất cả
            </button>
            {Object.entries(SPORT_CONFIG)
              .filter(([slug]) => slug !== "default")
              .map(([slug, cfg]) => (
                <button
                  key={slug}
                  className={`sp-chip${selectedSportSlug === slug ? " sp-chip--active" : ""}`}
                  onClick={() => setSelectedSportSlug(slug)}
                >
                  {cfg.label}
                </button>
              ))}
          </div>
        </div>

        {/* 2. Vị trí sân chơi */}
        <div className="sp-filter-section">
          <button
            className="sp-venue-btn"
            onClick={() => setShowVenuePicker(true)}
          >
            📍{" "}
            {selectedVenues.length > 0
              ? `${selectedVenues.length} sân đã chọn`
              : "Chọn sân..."}
          </button>
          {selectedVenues.length > 0 && (
            <div className="sp-venue-chips">
              {selectedVenues.map((v) => (
                <span key={v.id} className="sp-venue-chip">
                  {v.name}
                  <button
                    className="sp-venue-chip-x"
                    onClick={() =>
                      setSelectedVenues(
                        selectedVenues.filter((x) => x.id !== v.id),
                      )
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. Ngày chơi */}
        <div className="sp-filter-section">
          <label className="sp-filter-label">Ngày chơi</label>
          <input
            type="date"
            className="sp-date-input"
            value={playDate}
            onChange={(e) => setPlayDate(e.target.value)}
          />
        </div>

        {/* 4. Giờ bắt đầu */}
        <div className="sp-filter-section">
          <label className="sp-filter-label">Giờ bắt đầu (từ)</label>
          <input
            type="time"
            className="sp-date-input"
            value={timeFrom}
            onChange={(e) => setTimeFrom(e.target.value)}
          />
        </div>

        {/* 5. Trình độ */}
        <div className="sp-filter-section">
          <label className="sp-filter-label">Trình độ</label>
          <div className="sp-chip-group">
            {SKILL_LEVELS.map((s) => (
              <button
                key={s.value}
                className={`sp-chip${skillLevel === s.value ? " sp-chip--active" : ""}`}
                onClick={() => setSkillLevel(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Số slots cần thêm */}
        <div className="sp-filter-section">
          <label className="sp-filter-label">Số slots cần thêm</label>
          <select
            className="sp-select"
            value={slotsRange}
            onChange={(e) => setSlotsRange(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="one_to_two">1 - 2 người</option>
            <option value="three_to_four">3 - 4 người</option>
            <option value="five_plus">5+ người</option>
          </select>
        </div>

        {/* 7. Hình thức */}
        {hasPlayFormat && (
          <div className="sp-filter-section">
            <label className="sp-filter-label">Hình thức</label>
            <select
              className="sp-select"
              value={playFormat}
              onChange={(e) => setPlayFormat(e.target.value)}
            >
              {PLAY_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 8. Khoảng cách tối đa */}
        <div className="sp-filter-section">
          <label className="sp-filter-label">Khoảng cách tối đa</label>
          <select
            className="sp-select"
            value={distanceRange}
            onChange={(e) => setDistanceRange(e.target.value)}
          >
            <option value="">Không giới hạn</option>
            <option value="under_1">Dưới 1 km</option>
            <option value="under_3">Dưới 3 km</option>
            <option value="under_5">Dưới 5 km</option>
            <option value="under_10">Dưới 10 km</option>
            <option value="under_20">Dưới 20 km</option>
          </select>
        </div>

        <button
          className="sp-search-btn"
          onClick={() => {
            const b = localStorage.getItem("banUntil");
            if (b && new Date(b) > new Date()) {
              alert("Tài khoản bị tạm khóa, bạn không thể tìm kiếm.");
              return;
            }
            onSearch();
          }}
        >
          Tìm kiếm
        </button>
        <button className="sp-reset-btn" onClick={onReset}>
          Đặt lại bộ lọc
        </button>
      </div>

      {showVenuePicker && createPortal(
        <LocationPicker
          multiSelect
          onSelect={(venues) => {
            setSelectedVenues(venues);
            setShowVenuePicker(false);
          }}
          onClose={() => setShowVenuePicker(false)}
        />,
        document.body
      )}
    </aside>
  );
}

export default FilterSidebar;
