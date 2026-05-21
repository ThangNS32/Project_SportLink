import "../../styles/profile.css";

const ALL_SPORTS = [
  { sportType: "bong_da", label: "Bóng đá" },
  { sportType: "cau_long", label: "Cầu lông" },
  { sportType: "pickleball", label: "Pickleball" },
];

const SKILL_OPTIONS = [
  { value: "beginner", label: "Mới bắt đầu" },
  { value: "intermediate", label: "Trung bình" },
  { value: "advanced", label: "Nâng cao" },
];

function getAvatarSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `http://localhost:8080/sportlink${url}`;
}

function EditProfileModal({
  profile,
  editData,
  setEditData,
  editSports,
  toggleSport,
  updateSkillLevel,
  avatarFile,
  avatarPreview,
  onAvatarChange,
  editLoading,
  editError,
  onSave,
  onClose,
}) {
  return (
    <div
      className="pf-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="pf-modal">
        <div className="pf-modal-title">Chỉnh sửa hồ sơ</div>

        {editError && <div className="pf-modal-error">{editError}</div>}

        {/* Avatar */}
        <div className="pf-modal-field">
          <label>Ảnh đại diện</label>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {avatarPreview || getAvatarSrc(profile.avatarUrl) ? (
              <img
                src={avatarPreview || getAvatarSrc(profile.avatarUrl)}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
                alt="avatar"
              />
            ) : (
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#3b82f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                {(profile.fullName || "?")[0].toUpperCase()}
              </div>
            )}
            <label
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)",
                borderRadius: 8,
                padding: "7px 14px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Chọn ảnh
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={onAvatarChange}
              />
            </label>
          </div>
        </div>

        {/* Tên */}
        <div className="pf-modal-field">
          <label>Họ và tên</label>
          <input
            type="text"
            value={editData.fullName}
            onChange={(e) =>
              setEditData({ ...editData, fullName: e.target.value })
            }
            placeholder="Họ và tên"
          />
        </div>

        {/* Tuổi */}
        <div className="pf-modal-field">
          <label>Tuổi</label>
          <input
            type="number"
            value={editData.age}
            onChange={(e) => setEditData({ ...editData, age: e.target.value })}
            placeholder="Tuổi"
            min={1}
            max={100}
          />
        </div>

        {/* Môn yêu thích */}
        <div className="pf-modal-field">
          <label>Môn thể thao yêu thích</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ALL_SPORTS.map((s) => {
              const selected = editSports.find(
                (es) => es.sportType === s.sportType,
              );
              return (
                <div
                  key={s.sportType}
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <button
                    onClick={() => toggleSport(s.sportType)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 14px",
                      borderRadius: 10,
                      border: selected
                        ? "1px solid #3b82f6"
                        : "1px solid rgba(255,255,255,0.1)",
                      background: selected
                        ? "rgba(59,130,246,0.15)"
                        : "rgba(255,255,255,0.04)",
                      color: selected ? "#60a5fa" : "rgba(255,255,255,0.6)",
                      fontSize: 13,
                      fontWeight: selected ? 600 : 400,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span>{s.label}</span>
                    {selected && (
                      <span style={{ marginLeft: "auto", fontSize: 11 }}>
                        ✓
                      </span>
                    )}
                  </button>
                  {selected && (
                    <select
                      value={selected.skillLevel}
                      onChange={(e) =>
                        updateSkillLevel(s.sportType, e.target.value)
                      }
                      style={{
                        background: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        padding: "7px 12px",
                        color: "#fff",
                        fontSize: 13,
                        marginLeft: 8,
                      }}
                    >
                      {SKILL_OPTIONS.map((sk) => (
                        <option key={sk.value} value={sk.value}>
                          {sk.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pf-modal-actions">
          <button className="pf-btn-cancel" onClick={onClose}>
            Huỷ
          </button>
          <button
            className="pf-btn-save"
            onClick={onSave}
            disabled={editLoading}
          >
            {editLoading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
