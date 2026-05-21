import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import GoogleCallbackPage from "./pages/auth/GoogleCallbackPage";
import SportPage from "./pages/SportPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./components/chat/ChatPage";
import ChatbotWidget from "./components/common/ChatbotWidget";

function App() {
  // Hỏi vị trí mỗi lần vào trang
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        localStorage.setItem("userLat", coords.latitude);
        localStorage.setItem("userLng", coords.longitude);
      },
      () => {
        // User từ chối hoặc lỗi → xóa vị trí cũ
        localStorage.removeItem("userLat");
        localStorage.removeItem("userLng");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 },
    );
  }, []); // [] = chạy 1 lần khi app mount (= mỗi lần F5/mở tab mới)

  return (
    <BrowserRouter>
      <Routes>
        {/* Trang landing page */}
        <Route path="/" element={<HomePage />} />

        {/* Auth pages (vẫn giữ để Google callback hoạt động) */}
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

        {/* Trang chủ sau khi đăng nhập */}
        <Route path="/home" element={<div>Trang chủ</div>} />

        {/* Các trang thể thao (thêm sau) */}
        <Route path="/bong-da" element={<SportPage />} />
        <Route path="/cau-long" element={<SportPage />} />
        <Route path="/pickleball" element={<SportPage />} />

        <Route path="/tim-doi-thu" element={<SportPage />} />
        <Route path="/tim-dong-doi" element={<SportPage />} />
        <Route path="/feed" element={<SportPage />} />

        <Route path="/profile/me" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:conversationId" element={<ChatPage />} />
      </Routes>
      <ChatbotWidget />
    </BrowserRouter>
  );
}

export default App;
