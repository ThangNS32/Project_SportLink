import { useState } from "react";
import LocationPicker from "../common/LocationPicker";
import postApi from "../../api/postApi";
import "../../styles/create-post-modal.css";

const SPORT_OPTIONS = [
  { value: "bong_da", label: "Bóng đá" },
  { value: "cau_long", label: "Cầu lông" },
  { value: "pickleball", label: "Pickleball" },
];

const SKILL_OPTIONS = [
  { value: "beginner", label: "Mới bắt đầu" },
  { value: "intermediate", label: "Trung bình" },
  { value: "advanced", label: "Nâng cao" },
];

const PLAY_FORMAT_OPTIONS = [
  { value: "don_nam", label: "Đơn nam" },
  { value: "don_nu", label: "Đơn nữ" },
  { value: "doi_nam", label: "Đôi nam" },
  { value: "doi_nu", label: "Đôi nữ" },
  { value: "doi_nam_nu", label: "Đôi nam nữ" },
];

const HAS_PLAY_FORMAT = ["cau_long", "pickleball"];

const DEFAULT_FORM = {
  teamName: "",
  sportType: "bong_da",
  postType: "find_rival",
  playDate: "",
  playTime: "",
  skillLevel: "",
  locationName: "",
  locationLat: null,
  locationLng: null,
  slotsTotal: "",
  playFormat: "",
  note: "",
};

function CreatePostModal({ onClose, onCreated }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasPlayFormat = HAS_PLAY_FORMAT.includes(form.sportType);

  const set = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    // Validate
    if (!form.teamName.trim()) return setError("Vui lòng nhập tên bài đăng.");
    if (!form.locationName) return setError("Vui lòng chọn địa điểm.");
    if (!form.playDate || !form.playTime)
      return setError("Vui lòng chọn ngày và giờ chơi.");
    if (!form.slotsTotal) return setError("Vui lòng nhập số người cần thêm.");

    // Ghép date + time → LocalDateTime format
    const playTime = `${form.playDate}T${form.playTime}:00`;

    setLoading(true);
    setError("");
    try {
      const res = await postApi.createPost({
        teamName: form.teamName,
        sportType: form.sportType,
        postType: form.postType,
        playTime,
        skillLevel: form.skillLevel || null,
        locationName: form.locationName,
        locationLat: form.locationLat,
        locationLng: form.locationLng,
        slotsTotal: parseInt(form.slotsTotal),
        playFormat: hasPlayFormat && form.playFormat ? form.playFormat : null,
        note: form.note || null,
      });
      onCreated?.(res.data?.result); // Trả bài mới về SportPage để cập nhật list
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Tạo bài đăng thất bại, thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          style={{
            background: "#1e293b",
            borderRadius: 16,
            width: "min(600px, 95vw)",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* ── HEADER ── */}
          <div
            style={{
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
                Tạo bài đăng
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.75)",
                  marginTop: 4,
                }}
              >
                Tìm đồng đội hoặc đối thủ chơi thể thao cùng bạn
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "#fff",
                borderRadius: 8,
                width: 32,
                height: 32,
                cursor: "pointer",
                fontSize: 18,
                lineHeight: "32px",
                textAlign: "center",
              }}
            >
              ×
            </button>
          </div>

          {/* ── BODY ── */}
          <div
            style={{
              overflowY: "auto",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {/* Lỗi */}
            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#f87171",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            {/* Tên bài đăng */}
            <div>
              <label className="cp-label">Tên bài đăng *</label>
              <input
                type="text"
                value={form.teamName}
                onChange={(e) => set("teamName", e.target.value)}
                placeholder="VD: Tìm 2 người đánh cầu lông chiều nay"
                maxLength={100}
                className="cp-input"
              />
            </div>

            {/* Loại bài */}
            <div>
              <label className="cp-label">Loại bài *</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { value: "find_rival", label: "Tìm đối thủ" },
                  { value: "find_team", label: "Tìm đồng đội" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => set("postType", opt.value)}
                    className={`cp-toggle-btn${form.postType === opt.value ? " cp-toggle-btn--active" : ""}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Môn thể thao */}
            <div>
              <label className="cp-label">Môn thể thao *</label>
              <div style={{ display: "flex", gap: 8 }}>
                {SPORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      set("sportType", opt.value);
                      if (!HAS_PLAY_FORMAT.includes(opt.value))
                        set("playFormat", "");
                    }}
                    className={`cp-toggle-btn${form.sportType === opt.value ? " cp-toggle-btn--active" : ""}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Địa điểm */}
            <div>
              <label className="cp-label">Địa điểm *</label>
              <button
                onClick={() => setShowMap(true)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  textAlign: "left",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)",
                  color: form.locationName ? "#fff" : "rgba(255,255,255,0.4)",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {form.locationName || "Chọn sân..."}
              </button>
            </div>

            {/* Ngày & Giờ */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <label className="cp-label">Ngày chơi *</label>
                <input
                  type="date"
                  value={form.playDate}
                  onChange={(e) => set("playDate", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="cp-input"
                />
              </div>
              <div>
                <label className="cp-label">Giờ bắt đầu *</label>
                <input
                  type="time"
                  value={form.playTime}
                  onChange={(e) => set("playTime", e.target.value)}
                  className="cp-input"
                />
              </div>
            </div>

            {/* Trình độ */}
            <div>
              <label className="cp-label">Trình độ</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SKILL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      set(
                        "skillLevel",
                        form.skillLevel === opt.value ? "" : opt.value,
                      )
                    }
                    className={`cp-toggle-btn${form.skillLevel === opt.value ? " cp-toggle-btn--active" : ""}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Số người cần thêm */}
            <div>
              <label className="cp-label">Số người cần thêm *</label>
              <input
                type="number"
                value={form.slotsTotal}
                onChange={(e) => set("slotsTotal", e.target.value)}
                min={1}
                max={50}
                placeholder="VD: 3"
                className="cp-slots-input"
              />
            </div>

            {/* Hình thức — chỉ hiện với cầu lông & pickleball */}
            {hasPlayFormat && (
              <div>
                <label className="cp-label">Hình thức</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {PLAY_FORMAT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        set(
                          "playFormat",
                          form.playFormat === opt.value ? "" : opt.value,
                        )
                      }
                      className={`cp-toggle-btn${form.playFormat === opt.value ? " cp-toggle-btn--active" : ""}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ghi chú */}
            <div>
              <label className="cp-label">Ghi chú</label>
              <textarea
                value={form.note}
                onChange={(e) => set("note", e.target.value)}
                placeholder="Thêm thông tin về buổi chơi, yêu cầu, chi phí..."
                rows={3}
                className="cp-note-input"
              />
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Huỷ
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: "10px 24px",
                borderRadius: 8,
                border: "none",
                background: loading ? "rgba(59,130,246,0.5)" : "#3b82f6",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {loading ? "Đang đăng..." : "+ Đăng bài"}
            </button>
          </div>
        </div>
      </div>
      {/* LocationPicker */}
      {showMap && (
        <LocationPicker
          sportType={form.sportType}
          onSelect={(loc) => {
            set("locationName", loc.locationName);
            set("locationLat", loc.locationLat);
            set("locationLng", loc.locationLng);
          }}
          onClose={() => setShowMap(false)}
        />
      )}
    </>
  );
}

export default CreatePostModal;
