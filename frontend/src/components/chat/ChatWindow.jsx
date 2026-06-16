import { useState, useEffect, useRef } from "react";
import {
  doc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { acceptRequest, rejectRequest } from "./joinRequestApi";
import { submitRating } from "../../api/ratingApi";
import "./chat.css";

const RATING_TAGS = [
  { value: "uy_tin", label: "✓ Uy tín" },
  { value: "thai_do_tot", label: "✓ Thái độ tốt" },
  { value: "khong_uy_tin", label: "✗ Không uy tín" },
  { value: "thai_do_khong_dep", label: "✗ Thái độ không đẹp" },
  { value: "khong_dung_hen", label: "✗ Không đúng hẹn" },
];

const getAvatarSrc = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `http://localhost:8080/sportlink${url}`;
};

export default function ChatWindow({ conversationId, onStatusChange }) {
  const [conv, setConv] = useState(null); // metadata conversation
  const [messages, setMessages] = useState([]); // danh sách tin nhắn
  const [text, setText] = useState(""); // nội dung đang gõ
  const [sending, setSending] = useState(false);
  const [responding, setResponding] = useState(false); // đang xử lý accept/reject
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingTags, setRatingTags] = useState([]);
  const [submittingRating, setSubmittingRating] = useState(false);
  const messagesEndRef = useRef(null); // để auto scroll xuống cuối

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const convRef = doc(db, "conversations", conversationId);
  const isBanned = () => {
    const b = localStorage.getItem("banUntil");
    return b && new Date(b) > new Date();
  };

  useEffect(() => {
    const convRef = doc(db, "conversations", conversationId);
    const unsub = onSnapshot(convRef, (snap) => {
      if (snap.exists()) setConv(snap.data());
    });
    return () => unsub();
  }, [conversationId]);

  useEffect(() => {
    const msgsRef = collection(db, "conversations", conversationId, "messages");
    const q = query(msgsRef, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!conversationId) return;
    localStorage.setItem(
      `lastRead_${currentUser.userId}_${conversationId}`,
      Date.now().toString(),
    );
  }, [conversationId, messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const msgsRef = collection(
        db,
        "conversations",
        conversationId,
        "messages",
      );
      await addDoc(msgsRef, {
        senderId: currentUser.userId,
        senderName: currentUser.fullName,
        senderAvatar: currentUser.avatarUrl || null,
        content: text.trim(),
        createdAt: serverTimestamp(), // Firebase tự điền timestamp server
      });
      setText(""); // xóa ô nhập sau khi gửi
    } finally {
      setSending(false);
    }
  };

  const handleRespond = async (action) => {
    if (!conv || responding) return;
    setResponding(true);
    try {
      if (action === "accept") await acceptRequest(conv.requestId);
      else await rejectRequest(conv.requestId);
      await updateDoc(convRef, {
        status: action === "accept" ? "accepted" : "rejected",
      });
      onStatusChange?.();
    } catch (err) {
      if (err.response?.data?.code === 3003) {
        await updateDoc(convRef, {
          status: action === "accept" ? "accepted" : "rejected",
        }).catch(() => {});
        onStatusChange?.();
      } else {
        alert(err.response?.data?.message || "Có lỗi xảy ra");
      }
    } finally {
      setResponding(false);
    }
  };

  const toggleTag = (tag) => {
    setRatingTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmitRating = async () => {
    if (ratingStars === 0) {
      alert("Vui lòng chọn số sao");
      return;
    }
    setSubmittingRating(true);
    try {
      await submitRating({
        requestId: conv.requestId,
        stars: ratingStars,
        tags: ratingTags,
      });
      if (isOwner) {
        await updateDoc(convRef, { ratedByOwner: true });
      } else {
        await updateDoc(convRef, { ratedByRequester: true });
      }
      setShowRatingModal(false);
      setRatingStars(0);
      setRatingTags([]);
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmittingRating(false);
    }
  };

  if (!conv) return <div className="chat-window-loading">Đang tải...</div>;

  const isOwner = conv.ownerId === currentUser.userId;
  const otherName = isOwner ? conv.requesterName : conv.ownerName;
  const actionLabel = conv.postType === "find_rival" ? "thách đấu" : "tham gia";
  const playDatePassed = conv.playDate && new Date(conv.playDate) < new Date();
  const ratingDeadline = conv.playDate
    ? new Date(new Date(conv.playDate).getTime() + 3 * 24 * 60 * 60 * 1000)
    : null;
  const withinRatingWindow = ratingDeadline && new Date() < ratingDeadline;
  const alreadyRated = isOwner ? conv.ratedByOwner : conv.ratedByRequester;
  const canRate =
    conv.status === "accepted" &&
    playDatePassed &&
    withinRatingWindow &&
    !alreadyRated;
  const ratingExpired =
    conv.status === "accepted" &&
    playDatePassed &&
    !withinRatingWindow &&
    !alreadyRated;

  return (
    <div className="chat-window">
      {/* Header — tên người kia + tên bài + trạng thái */}
      <div className="chat-window__header">
        <div>
          <strong>{otherName}</strong>
          <span className="chat-window__post"> · {conv.postTitle}</span>
        </div>
        <span className={`chat-status chat-status--${conv.status}`}>
          {conv.status === "pending" && "Đang chờ"}
          {conv.status === "accepted" && "Đã chấp nhận ✓"}
          {conv.status === "rejected" && "Đã từ chối"}
        </span>
      </div>

      {/* Nút Accept/Reject — chỉ hiện cho chủ bài, khi status còn pending */}
      {isOwner && conv.status === "pending" && (
        <div className="chat-window__actions">
          <button
            className="chat-btn chat-btn--accept"
            onClick={() => handleRespond("accept")}
            disabled={responding}
          >
            Chấp nhận lời {actionLabel} từ {conv.requesterName} cho bài "
            {conv.postTitle}"
          </button>
          <button
            className="chat-btn chat-btn--reject"
            onClick={() => handleRespond("reject")}
            disabled={responding}
          >
            Từ chối
          </button>
        </div>
      )}

      {/* Rating banner — hiện khi trận đã qua và status=accepted */}
      {conv.status === "accepted" && playDatePassed && (
        <div className="chat-window__rating-banner">
          {canRate && (
            <button
              className="chat-btn chat-btn--rate"
              onClick={() => setShowRatingModal(true)}
            >
              ⭐ Đánh giá {otherName}
            </button>
          )}
          {ratingExpired && (
            <span className="chat-rating-expired">
              Đã hết thời hạn đánh giá
            </span>
          )}
          {!canRate &&
            alreadyRated &&
            (conv.ratedByOwner && conv.ratedByRequester ? (
              <span className="chat-rating-done">
                ✓ Cả hai đã đánh giá · Điểm uy tín đã được cập nhật
              </span>
            ) : (
              <span className="chat-rating-waiting">
                ✓ Đã gửi đánh giá · Điểm uy tín sẽ được cập nhật sau
              </span>
            ))}
        </div>
      )}

      {/* Rating modal */}
      {showRatingModal && (
        <div
          className="chat-modal-overlay"
          onClick={() => setShowRatingModal(false)}
        >
          <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Đánh giá {otherName}</h3>

            <div className="chat-modal__stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={`chat-modal__star${s <= ratingStars ? " chat-modal__star--active" : ""}`}
                  onClick={() => setRatingStars(s)}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="chat-modal__tags">
              {RATING_TAGS.map((t) => (
                <button
                  key={t.value}
                  className={`chat-modal__tag${ratingTags.includes(t.value) ? " chat-modal__tag--active" : ""}`}
                  onClick={() => toggleTag(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="chat-modal__actions">
              <button
                className="chat-btn chat-btn--accept"
                onClick={handleSubmitRating}
                disabled={submittingRating || ratingStars === 0}
              >
                {submittingRating ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
              <button
                className="chat-btn chat-btn--reject"
                onClick={() => setShowRatingModal(false)}
              >
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách tin nhắn */}
      <div className="chat-window__messages">
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUser.userId;
          return (
            <div
              key={msg.id}
              className={`chat-msg ${isMine ? "chat-msg--mine" : "chat-msg--other"}`}
            >
              {/* Chỉ hiện avatar của người kia, không hiện avatar của mình */}
              {!isMine && (
                <div className="chat-msg__avatar">
                  {getAvatarSrc(msg.senderAvatar) ? (
                    <img src={getAvatarSrc(msg.senderAvatar)} alt="" />
                  ) : (
                    <div className="chat-msg__avatar-placeholder">
                      {msg.senderName?.[0]}
                    </div>
                  )}
                </div>
              )}
              <div className="chat-msg__bubble">{msg.content}</div>
            </div>
          );
        })}
        {/* Div rỗng ở cuối để scroll tới */}
        <div ref={messagesEndRef} />
      </div>

      {/* Ô nhập tin nhắn */}
      <div className="chat-window__input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={isBanned() ? "Tài khoản bị tạm khóa" : "Nhắn tin..."}
          className="chat-input"
          disabled={isBanned()}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={sending || !text.trim() || isBanned()}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
