import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const SPORT_LABEL = {
  bong_da: "Bóng đá",
  cau_long: "Cầu lông",
  pickleball: "Pickleball",
};

function getAvatarSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `http://localhost:8080/sportlink${url}`;
}

function UserDropdown({
  user,
  userDetail,
  avatarUrl,
  favoriteSports,
  onLogout,
  onProfile,
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(false);
    if (show) document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [show]);

  return (
    <div style={{ position: "relative" }}>
      <button
        className="home-user-btn"
        onClick={(e) => {
          e.stopPropagation();
          setShow((v) => !v);
        }}
      >
        {avatarUrl ? (
          <img
            src={getAvatarSrc(avatarUrl)}
            className="home-user-avatar"
            alt={user.fullName}
          />
        ) : (
          <div className="home-user-avatar home-user-avatar--placeholder">
            {(user.fullName || "?")[0].toUpperCase()}
          </div>
        )}
        <span className="home-user-name">{user.fullName}</span>
        <ChevronDown size={13} opacity={0.6} />
      </button>

      {show && (
        <div className="home-user-dropdown">
          <div className="home-user-dropdown-header">
            {avatarUrl ? (
              <img
                src={getAvatarSrc(avatarUrl)}
                className="home-user-avatar"
                alt={user.fullName}
              />
            ) : (
              <div className="home-user-dropdown-avatar home-user-avatar--placeholder">
                {(user.fullName || "?")[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="home-user-dropdown-name">{user.fullName}</div>
              <div className="home-user-dropdown-role">
                {user.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
              </div>
            </div>
          </div>

          {favoriteSports.length > 0 && (
            <div className="hd-sports-section">
              <div className="hd-sports-label">Môn yêu thích</div>
              <div className="hd-sports-chips">
                {favoriteSports.map((s) => (
                  <span key={s.sportType} className="hd-sport-chip">
                    {SPORT_LABEL[s.sportType] || s.sportType}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            className="home-user-profile-btn"
            onClick={() => {
              setShow(false);
              onProfile();
            }}
          >
            <svg
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Hồ sơ của tôi
          </button>

          <div className="home-user-dropdown-divider" />

          <div className="home-user-dropdown-info">
            <span className="home-user-info-label">Email</span>
            <span className="home-user-info-value">{user.email}</span>
          </div>
          <div className="home-user-dropdown-info">
            <span className="home-user-info-label">Tuổi</span>
            <span className="home-user-info-value">
              {userDetail?.age ?? "—"}
            </span>
          </div>
          <div className="home-user-dropdown-info">
            <span className="home-user-info-label">Điểm uy tín</span>
            <span className="home-user-info-value home-user-info-credit">
              ⭐ {userDetail?.trustScore ?? "—"}
            </span>
          </div>

          <div className="home-user-dropdown-divider" />

          <button className="home-user-logout-btn" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

export default UserDropdown;
