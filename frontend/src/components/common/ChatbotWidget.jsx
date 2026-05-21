import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../../api/chatbotApi";
import "../../styles/chatbot.css";
import PostCard from "../post/PostCard";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await sendMessage(userMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: res.data.message,
          posts: res.data.posts || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Có lỗi xảy ra, thử lại nhé!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

    useEffect(() => {
        const handleLogin = () => setIsLoggedIn(!!localStorage.getItem("token"));
        window.addEventListener("userLogin", handleLogin);
        window.addEventListener("userLogout", handleLogin);
        return () => {
        window.removeEventListener("userLogin", handleLogin);
        window.removeEventListener("userLogout", handleLogin);
        };
    }, []);

    if (!isLoggedIn) return null;

  return (
    <div className="cb-wrap">
      {open && (
        <div className="cb-box">
          <div className="cb-header">
            <span>SportLink Assistant</span>
            <button onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="cb-messages">
            {messages.map((m, i) => (
              <div key={i} className={`cb-msg cb-msg--${m.role}`}>
                {m.text}
                {m.posts && m.posts.length > 0 && (
                  <div className="cb-post-list">
                    {m.posts.map((post) => (
                      <PostCard key={post.postId} post={post} isOwner={false} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="cb-msg cb-msg--bot cb-typing">
                Đang trả lời...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="cb-input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Nhập câu hỏi..."
              className="cb-input"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="cb-send-btn"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
      <button className="cb-toggle-btn" onClick={() => setOpen((v) => !v)}>
        <span className="cb-toggle-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
              fill="white"
            />
            <path
              d="M19 16L19.8 18.2L22 19L19.8 19.8L19 22L18.2 19.8L16 19L18.2 18.2L19 16Z"
              fill="white"
              opacity="0.7"
            />
          </svg>
        </span>
        <span className="cb-toggle-text">
          <span className="cb-toggle-title">Trợ lý AI</span>
          <span className="cb-toggle-sub">Tìm kiếm bằng AI</span>
        </span>
      </button>
    </div>
  );
}
