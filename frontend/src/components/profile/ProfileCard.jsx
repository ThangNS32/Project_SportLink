import "../../styles/profile.css";
import { useState } from "react";
import { getUserRatingTags } from "../../api/ratingApi";

const SPORT_LABEL = {
  bong_da: { label: "Bóng đá" },
  cau_long: { label: "Cầu lông" },
  pickleball: { label: "Pickleball" },
};

const SKILL_LABEL = {
  beginner: "Mới bắt đầu",
  intermediate: "Trung bình",
  advanced: "Nâng cao",
};

const TAG_META = {
  uy_tin: { label: "Uy tín", positive: true },
  thai_do_tot: { label: "Thái độ tốt", positive: true },
  khong_uy_tin: { label: "Không uy tín", positive: false },
  thai_do_khong_dep: { label: "Thái độ không đẹp", positive: false },
  khong_dung_hen: { label: "Không đúng hẹn", positive: false },
};

function getAvatarSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `http://localhost:8080/sportlink${url}`;
}

function ProfileCard({ profile, sports, isMe, onEditClick }) {
  const [tags, setTags] = useState(null);

  const handleTagClick = async () => {
    if (tags !== null) {
      setTags(null);
      return;
    }
    const res = await getUserRatingTags(profile.userId);
    setTags(res.data.result);
  };

  return (
    <div className="pf-card">
      <div className="pf-card-top">
        {getAvatarSrc(profile.avatarUrl) ? (
          <img
            src={getAvatarSrc(profile.avatarUrl)}
            className="pf-avatar"
            alt={profile.fullName}
          />
        ) : (
          <div className="pf-avatar pf-avatar--placeholder">
            {(profile.fullName || "?")[0].toUpperCase()}
          </div>
        )}
        <div className="pf-name-block">
          <div className="pf-name">{profile.fullName}</div>
          <div className="pf-role">
            {profile.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
          </div>
        </div>
        {isMe && (
          <button className="pf-edit-btn" onClick={onEditClick}>
            Chỉnh sửa hồ sơ
          </button>
        )}
      </div>

      <div className="pf-divider" />

      <div className="pf-info-grid">
        <div className="pf-info-item">
          <span className="pf-info-label">Email</span>
          <span className="pf-info-value">{profile.email}</span>
        </div>
        <div className="pf-info-item">
          <span className="pf-info-label">Tuổi</span>
          <span className="pf-info-value">{profile.age ?? "—"}</span>
        </div>
        <div className="pf-info-item">
          <span className="pf-info-label">Điểm uy tín</span>
          <span className="pf-info-value pf-trust">
            {profile.trustScore != null ? (
              <>
                ★ {profile.trustScore.toFixed(1)}
                {profile.totalRating > 0 && (
                  <span
                    className="pf-trust-count pf-trust-clickable"
                    onClick={handleTagClick}
                  >
                    ({profile.totalRating} đánh giá)
                  </span>
                )}
              </>
            ) : (
              "—"
            )}
          </span>
        </div>

        {tags && (
          <div className="pf-tags-popup">
            {Object.keys(tags).length === 0 ? (
              <span className="pf-tags-empty">Chưa có nhận xét</span>
            ) : (
              Object.entries(tags)
                .sort((a, b) => b[1] - a[1])
                .map(([tag, count]) => {
                  const meta = TAG_META[tag];
                  if (!meta) return null;
                  return (
                    <span
                      key={tag}
                      className={`pf-rtag ${meta.positive ? "pf-rtag--pos" : "pf-rtag--neg"}`}
                    >
                      {meta.positive ? "✓" : "✗"} {meta.label} x{count}
                    </span>
                  );
                })
            )}
          </div>
        )}
      </div>

      {sports.length > 0 && (
        <>
          <div className="pf-divider" />
          <div className="pf-sports-section">
            <div className="pf-section-title">Môn thể thao yêu thích</div>
            <div className="pf-sports-list">
              {sports.map((s) => {
                const info = SPORT_LABEL[s.sportType] || { label: s.sportType };
                return (
                  <div key={s.sportType} className="pf-sport-chip">
                    <span>{info.label}</span>
                    <span className="pf-sport-skill">
                      {SKILL_LABEL[s.skillLevel] || s.skillLevel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfileCard;
