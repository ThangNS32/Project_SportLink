import { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import Header from "../components/common/Header";
  import AuthModal from "../components/common/AuthModal";
  import "../styles/home.css";

  function HomePage() {
    const navigate = useNavigate();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingPath, setPendingPath] = useState(null);

    const isLoggedIn = !!localStorage.getItem("token");

    const requireAuth = (path) => {
      if (!isLoggedIn) {
        setPendingPath(path);
        setShowAuthModal(true);
      } else {
        navigate(path);
      }
    };

    return (
      <div className="home-page">
        {/* Header dùng chung */}
        <Header onLoginClick={() => setShowAuthModal(true)} />

        {/* HERO */}
        <main className="home-hero">
          <div className="home-hero-content">
            <h1 className="home-hero-title">
              <span className="hero-line-1">SPORTLINK</span>
              <span className="hero-line-2">KẾT NỐI THỂ THAO</span>
              <span className="hero-line-3">CÙNG VUI CÙNG KHOẺ</span>
            </h1>
            <button
              className="home-cta-btn"
              onClick={() => requireAuth("/feed")}
            >
              Tìm kèo Ngay →
            </button>
          </div>
        </main>

        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onLoginSuccess={() => {
              if (pendingPath) navigate(pendingPath);
            }}
          />
        )}
      </div>
    );
  }

  export default HomePage;