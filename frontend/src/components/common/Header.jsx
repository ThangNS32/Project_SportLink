import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import userApi from "../../api/userApi";
import sportApi from "../../api/sportApi";
import UserDropdown from "./header/UserDropdown";
import NotificationBell from "./header/NotificationBell";
import { useNotifications } from "./header/useNotifications";
import { useChatUnread } from "./header/useChatUnread";
import "../../styles/home.css";
import "../../styles/header.css";

const NAV_ITEMS = [
  { label: "Tìm đối thủ", path: "/tim-doi-thu" },
  { label: "Tìm đồng đội", path: "/tim-dong-doi" },
];

function Header({ onLoginClick }) {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [userDetail, setUserDetail] = useState(null);
  const [favoriteSports, setFavoriteSports] = useState([]);
  const avatarUrl = userDetail?.avatarUrl || user.avatarUrl;
  const isBanned = () => {
      const b = localStorage.getItem("banUntil");                                                                                                                      
      return b && new Date(b) > new Date();                                                                                                                          
  };

  const {
    unreadCount,
    notifications,
    showNotifs,
    setShowNotifs,
    handleClickNotif,
    banMessage,
    setBanMessage,
  } = useNotifications(isLoggedIn);
  const chatUnreadCount = useChatUnread(isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) return;
    userApi
      .getMyInfo()
      .then((res) => {
        const detail = res.data?.result;
        setUserDetail(detail);
        if (detail?.banUntil) localStorage.setItem("banUntil", detail.banUntil);
        else localStorage.removeItem("banUntil");
      })
      .catch(() => {});
    sportApi
      .getMyFavoriteSports()
      .then((res) => setFavoriteSports(res.data?.result || []))
      .catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && !localStorage.getItem("geoAsked")) {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          localStorage.setItem("userLat", latitude);
          localStorage.setItem("userLng", longitude);
        },
        () => {},
      );
      localStorage.setItem("geoAsked", "1");
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await authApi.logout(token);
    } finally {
      [
        "token",
        "user",
        "userLocation",
        "userLat",
        "userLng",
        "geoAsked",
        "banUntil"
      ].forEach((k) => localStorage.removeItem(k));
      window.location.href = "/";
    }
  };


  return (
    <>
      {banMessage && (
        <div className="ban-overlay">
          <div className="ban-modal">
            <b>Tài khoản bị tạm khóa</b>
            <p className="ban-modal__desc">{banMessage}</p>
            <p className="ban-modal__note">
              Bạn không thể đăng bài, nhắn tin và tìm kiếm bài. Do số sao sau 3
              lượt đánh giá ít hơn 2 sao.
            </p>
            <button
              className="ban-modal__btn"
              onClick={() => setBanMessage(null)}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
      <header className="home-header">
        <div className="home-header-inner">
          <div
            className="home-logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            Sport<span>Link</span>
          </div>

          <nav className="home-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                className="home-nav-btn"
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="home-header-actions">

            {isLoggedIn && (
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                showNotifs={showNotifs}
                setShowNotifs={setShowNotifs}
                onClickNotif={handleClickNotif}
              />
            )}

            {/* Chat icon + badge */}
            {isLoggedIn && (
              <div style={{ position: "relative" }}>
                <button
                  className="home-icon-btn"
                  title="Tin nhắn"
                  onClick={() => { if (isBanned()) { setBanMessage("Tài khoản bị tạm khóa, bạn không thể nhắn tin."); return; } navigate("/chat"); }}
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {chatUnreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-4px",
                        background: "#ef4444",
                        color: "white",
                        borderRadius: "50%",
                        width: "18px",
                        height: "18px",
                        fontSize: "11px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {chatUnreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {isLoggedIn ? (
              <UserDropdown
                user={user}
                userDetail={userDetail}
                avatarUrl={avatarUrl}
                favoriteSports={favoriteSports}
                onLogout={handleLogout}
                onProfile={() => navigate("/profile/me")}
              />
            ) : (
              <button
                className="home-login-btn"
                onClick={onLoginClick || (() => navigate("/"))}
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
