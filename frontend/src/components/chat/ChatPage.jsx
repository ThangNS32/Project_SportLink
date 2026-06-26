import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { getMyConversations } from "./joinRequestApi";
import "./chat.css";

export default function ChatPage() {
  // conversationId lấy từ URL — ví dụ URL là /chat/req_123 thì conversationId = "req_123"
  const { conversationId } = useParams();

  // location.state chứa joinRequest do PostCard truyền sang khi navigate
  // Chỉ có khi user vừa bấm "Tham gia" — nếu user vào thẳng /chat thì state = null
  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chạy 1 lần khi ChatPage mở — nếu có joinRequest từ PostCard thì tạo Firestore document
  useEffect(() => {
    const jr = location.state?.joinRequest;
    if (jr && conversationId) {
      initFirestoreConversation(jr);
    }
  }, []);

  // Tạo conversation document trên Firestore + ghi tin nhắn đầu tiên
  // Tại sao dùng setDoc với merge:true?
  // → Vì nếu user bấm "Tham gia" 2 lần (lỗi mạng), document đã tồn tại thì không ghi đè
  const initFirestoreConversation = async (jr) => {
    const convRef = doc(db, "conversations", `req_${jr.requestId}`);
    await setDoc(
      convRef,
      {
        requestId: jr.requestId,
        postId: jr.postId,
        postTitle: jr.postTitle,
        postType: jr.postType,
        requesterId: jr.requesterId,
        requesterName: jr.requesterName,
        requesterAvatar: jr.requesterAvatar || null,
        ownerId: jr.ownerId,
        ownerName: jr.ownerName,
        ownerAvatar: jr.ownerAvatar || null,
        status: "pending",
        playDate: jr.postPlayTime || null,
        ratedByRequester: false,
        ratedByOwner: false,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );

    const firstMsgRef = doc(
      db,
      "conversations",
      `req_${jr.requestId}`,
      "messages",
      "initial",
    );
    await setDoc(firstMsgRef, {
      senderId: jr.requesterId,
      senderName: jr.requesterName,
      senderAvatar: jr.requesterAvatar || null,
      content: jr.message,
      createdAt: Timestamp.fromDate(new Date()),
    });
  };

  const fetchConversations = async () => {
    const userId = JSON.parse(localStorage.getItem("user") || "{}").userId;

    // Đọc hidden list từ Firestore thay vì localStorage
    // Firestore persist qua mọi thiết bị và lần đăng nhập
    let hidden = [];
    try {
      const settingsSnap = await getDoc(
        doc(db, "userSettings", String(userId)),
      );
      hidden = settingsSnap.data()?.hiddenConvs || [];
    } catch (_) {}
    getMyConversations()
      .then((res) => {
        const filtered = res.data.result.filter(
          (c) => !hidden.includes(`req_${c.requestId}`),
        );
        setConversations(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className="chat-page">
      {/* Cột trái — danh sách conversations */}
      <div className="chat-sidebar">
        {/* ← Thêm phần header gồm nút quay về + tiêu đề */}
        <div className="chat-sidebar__header">
          <button className="chat-back-btn" onClick={() => navigate("/feed")}>
            ← Trang chủ
          </button>
          <h3 className="chat-sidebar__title">Tin nhắn</h3>
        </div>

        <ConversationList
          conversations={conversations}
          loading={loading}
          activeId={conversationId}
          onDelete={(deletedConvId) =>
            setConversations((prev) =>
              prev.filter((c) => `req_${c.requestId}` !== deletedConvId),
            )
          }
        />
      </div>

      {/* Cột phải — cửa sổ chat hoặc placeholder */}
      <div className="chat-main">
        {conversationId ? (
          <ChatWindow
            conversationId={conversationId}
            onStatusChange={fetchConversations}
          />
        ) : (
          <div className="chat-empty">Chọn một cuộc trò chuyện để bắt đầu</div>
        )}
      </div>
    </div>
  );
}
