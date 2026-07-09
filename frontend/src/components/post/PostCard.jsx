import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/post-card.css";
import { createJoinRequest } from "../chat/joinRequestApi";

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatRelative(dateStr) {
  if (!dateStr) return "";
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

function getAvatarSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `http://localhost:8080/sportlink${url}`;
}

function getDirectionsUrl(venueLat, venueLng) {
  const userLat = localStorage.getItem("userLat");
  const userLng = localStorage.getItem("userLng");
  if (userLat && userLng) {
    return `https://www.google.com/maps/dir/${userLat},${userLng}/${venueLat},${venueLng}`;
  }
  // Không có GPS user → chỉ hiện vị trí sân
  return `https://www.google.com/maps?q=${venueLat},${venueLng}`;
}

const SKILL_LABEL = {
  beginner: "Mới bắt đầu",
  intermediate: "Trung bình",
  advanced: "Nâng cao",
};

const FORMAT_LABEL = {
  don_nam: "Đơn Nam",
  don_nu: "Đơn Nữ",
  doi_nam: "Đôi Nam",
  doi_nu: "Đôi Nữ",
  doi_nam_nu: "Đôi Nam Nữ",
};

const TYPE_LABEL = {
  find_team: "Tìm đồng đội",
  find_rival: "Tìm đối thủ",
};

const SPORT_LABEL = {
  bong_da: "Bóng đá",
  cau_long: "Cầu lông",
  pickleball: "Pickleball",
};

function PostCard({ post, isOwner, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();
  const handleAuthorClick = () => {
    if (!post.userId) return;
    const stored = localStorage.getItem("user");
    const me = stored ? JSON.parse(stored) : null;
    if (me && me.userId === post.userId) {
      navigate("/profile/me");
    } else {
      navigate(`/profile/${post.userId}`);
    }
  };

  const slotsLeft = (post.slotsTotal ?? 0) - (post.slotsFilled ?? 0);
  const skillLabel = SKILL_LABEL[post.skillLevel] || post.skillLevel;
  const sportLabel = SPORT_LABEL[post.sportType] || post.sportType;
  const formatLabel = FORMAT_LABEL[post.playFormat] || post.playFormat;
  const typeLabel = TYPE_LABEL[post.postType] || post.postType;
  const avatarSrc = getAvatarSrc(post.userAvatarUrl);
  const isExpired = post.status === "expired" || post.status === "EXPIRED";

  const handleJoin = async () => {
    setJoining(true);
    try {
      // Gọi Spring Boot tạo join_request trong MySQL
      const res = await createJoinRequest(post.postId);
      const joinRequest = res.data.result;

      // Navigate sang trang chat, truyền joinRequest qua state
      // ChatPage sẽ dùng joinRequest này để tạo Firestore document
      navigate(`/chat/req_${joinRequest.requestId}`, {
        state: { joinRequest },
      });
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="pc-card">
      {/* ── TOP ROW: thời gian + địa điểm + nút tham gia ── */}
      <div className="pc-top">
        <div className="pc-top-left">
          {post.playTime && (
            <span className="pc-time">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path strokeLinecap="round" strokeWidth="2" d="M12 6v6l4 2" />
              </svg>
              {formatDate(post.playTime)} · {formatTime(post.playTime)}
            </span>
          )}
          {post.locationName && (
            <a
              className="pc-location pc-location--link"
              href={
                post.locationLat && post.locationLng
                  ? getDirectionsUrl(post.locationLat, post.locationLng)
                  : undefined
              }
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {post.locationName}
              {post.distanceKm != null && (
                <span className="pc-dist">{post.distanceKm.toFixed(1)} km</span>
              )}
            </a>
          )}
        </div>

        {!isOwner && post.status === "open" && (
          <button
            className="pc-join-btn"
            onClick={handleJoin}
            disabled={joining}
          >
            {joining
              ? "Đang gửi..."
              : post.postType === "find_rival"
                ? "Giao hữu"
                : "Tham gia"}
          </button>
        )}
      </div>

      {/* ── TAGS ROW ── */}
      <div className="pc-tags">
        {sportLabel && (
          <span className="pc-tag pc-tag--sport">{sportLabel}</span>
        )}
        {skillLabel && (
          <span className="pc-tag pc-tag--skill">{skillLabel}</span>
        )}
        {typeLabel && <span className="pc-tag pc-tag--type">{typeLabel}</span>}
        {formatLabel && (
          <span className="pc-tag pc-tag--format">{formatLabel}</span>
        )}
        {slotsLeft > 0 && (
          <span className="pc-tag pc-tag--slots">Còn {slotsLeft} slot</span>
        )}
        {isExpired && <span className="pc-tag pc-tag--expired">Hết hạn</span>}
      </div>

      {/* ── TITLE ── */}
      {post.teamName && <div className="pc-title">{post.teamName}</div>}

      {/* ── NOTE ── */}
      {post.note && (
        <p className={`pc-note${expanded ? " pc-note--expanded" : ""}`}>
          {post.note}
        </p>
      )}
      {post.note && post.note.length > 120 && (
        <button
          className="pc-expand-btn"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}

      {/* ── FOOTER: tác giả + thời gian ── */}
      <div className="pc-footer">
        <div
          className="pc-author"
          onClick={handleAuthorClick}
          style={{ cursor: post.userId ? "pointer" : "default" }}
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              className="pc-avatar"
              alt={post.userFullName}
            />
          ) : (
            <div className="pc-avatar pc-avatar--placeholder">
              {(post.userFullName || "?")[0].toUpperCase()}
            </div>
          )}
          <span className="pc-author-name">{post.userFullName}</span>
          {post.userTrustScore != null && (
            <span className="pc-trust">
              ★ {post.userTrustScore.toFixed(1)}
              {post.userTotalRating > 0 && (
                <span className="pc-trust-count">({post.userTotalRating})</span>
              )}
            </span>
          )}
          {post.createdAt && (
            <span className="pc-time-ago">
              · {formatRelative(post.createdAt)}
            </span>
          )}
        </div>
      </div>
      {/* ── OWNER ACTIONS ── */}
      {isOwner && (
        <div className="pc-actions">
          {!isExpired && (
            <button
              className="pc-action-btn pc-action-btn--edit"
              onClick={() => onEdit?.(post)}
            >
              Chỉnh sửa
            </button>
          )}
          <button
            className="pc-action-btn pc-action-btn--delete"
            onClick={() => onDelete?.(post.postId)}
          >
            Xoá
          </button>
        </div>
      )}
    </div>
  );
}

export default PostCard;
