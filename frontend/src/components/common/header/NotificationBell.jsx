export default function NotificationBell({
  notifications,
  unreadCount,
  showNotifs,
  setShowNotifs,
  onClickNotif,
}) {
  return (
    <div style={{ position: "relative" }}>
      <button
        className="home-icon-btn"
        title="Thông báo"
        onClick={() => setShowNotifs((v) => !v)}
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
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
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifs && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "110%",
            width: "300px",
            background: "#1e293b",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            zIndex: 999,
            maxHeight: "320px",
            overflowY: "auto",
          }}
        >
          {notifications.length === 0 ? (
            <div
              style={{
                padding: "16px",
                color: "#64748b",
                textAlign: "center",
                fontSize: "13px",
              }}
            >
              Không có thông báo mới
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.notifId}
                onClick={() => onClickNotif(n)}
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.85)",
                  lineHeight: 1.5,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {n.content}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
