import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import "../../styles/auth.css";
import "../../styles/home.css";

function AuthModal({ onClose, defaultTab = "login", onLoginSuccess }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState(defaultTab);

  // ---- Login state ----
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // ---- Register state ----
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  // ---- Login handlers ----
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setLoginError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setLoginError("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    setLoginLoading(true);
    setLoginError("");
    try {
      const response = await authApi.login(loginData);
      const data = response.data;
      if (data.result?.token) {
        localStorage.setItem("token", data.result.token);
        window.dispatchEvent(new Event("userLogin"));
        localStorage.setItem(
          "user",
          JSON.stringify({
            userId: data.result.userId,
            fullName: data.result.fullName,
            email: data.result.email,
            avatarUrl: data.result.avatarUrl,
            role: data.result.role,
          }),
        );
        onClose();
        if (onLoginSuccess) onLoginSuccess();
        else navigate("/home");
      }
    } catch (err) {
      const message = err.response?.data?.message;
      if (message === "Mật khẩu không đúng")
        setLoginError("Mật khẩu không đúng!");
      else if (message === "Không tìm thấy người dùng")
        setLoginError("Email không tồn tại!");
      else if (message === "Tài khoản đang bị khoá")
        setLoginError("Tài khoản của bạn đang bị khoá 7 ngày!");
      else setLoginError("Đăng nhập thất bại, vui lòng thử lại!");
    } finally {
      setLoginLoading(false);
    }
  };

  // ---- Register handlers ----
  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    setRegisterError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (
      !registerData.fullName ||
      !registerData.email ||
      !registerData.password
    ) {
      setRegisterError("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (registerData.password.length < 6) {
      setRegisterError("Mật khẩu phải ít nhất 6 ký tự!");
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Mật khẩu xác nhận không khớp!");
      return;
    }
    setRegisterLoading(true);
    setRegisterError("");
    try {
      const response = await authApi.register({
        fullName: registerData.fullName,
        email: registerData.email,
        password: registerData.password,
      });
      const data = response.data;
      if (data.result?.token) {
        localStorage.setItem("token", data.result.token);
        window.dispatchEvent(new Event("userLogin"));
        localStorage.setItem(
          "user",
          JSON.stringify({
            userId: data.result.userId,
            fullName: data.result.fullName,
            email: data.result.email,
            avatarUrl: data.result.avatarUrl,
            role: data.result.role,
          }),
        );
        setRegisterSuccess("Đăng ký thành công! Đang chuyển trang...");
        setTimeout(() => {
          onClose();
          if (onLoginSuccess) onLoginSuccess();
          else navigate("/home");
        }, 1000);
      }
    } catch (err) {
      const message = err.response?.data?.message;
      if (message === "Email đã tồn tại")
        setRegisterError("Email này đã được đăng ký!");
      else setRegisterError("Đăng ký thất bại, vui lòng thử lại!");
    } finally {
      setRegisterLoading(false);
    }
  };

  // ---- Google login ----
  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = "http://localhost:5173/auth/google/callback";
    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=openid email profile`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div
      className="auth-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="auth-modal-wrapper">
        {/* Nút đóng */}
        <button className="auth-modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="auth-container">
          {/* Panel trái */}
          <div className="auth-left">
            <div className="auth-logo">
              Sport<span>Link</span>
            </div>
            <div className="auth-tagline">
              Kết nối đam mê thể thao
              <br />
              Tìm đội trong tích tắc
            </div>
            <div className="auth-pills">
              <span className="auth-pill">Bóng đá</span>
              <span className="auth-pill">Cầu lông</span>
              <span className="auth-pill">Pickleball</span>
            </div>
          </div>

          {/* Panel phải */}
          <div className="auth-right">
            {/* Tabs */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${tab === "login" ? "active" : ""}`}
                onClick={() => setTab("login")}
              >
                Đăng nhập
              </button>
              <button
                className={`auth-tab ${tab === "register" ? "active" : ""}`}
                onClick={() => setTab("register")}
              >
                Đăng ký
              </button>
            </div>

            {/* ===== FORM ĐĂNG NHẬP ===== */}
            {tab === "login" && (
              <>
                {loginError && (
                  <div className="error-message">{loginError}</div>
                )}
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="abc@email.com"
                      value={loginData.email}
                      onChange={handleLoginChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mật khẩu</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={handleLoginChange}
                    />
                  </div>
                  <div className="forgot-password">
                    <a href="#">Quên mật khẩu?</a>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loginLoading}
                  >
                    {loginLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </button>
                </form>
                <div className="auth-divider">
                  <div className="auth-divider-line" />
                  <span className="auth-divider-text">hoặc</span>
                  <div className="auth-divider-line" />
                </div>
                <button className="btn-google" onClick={handleGoogleLogin}>
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13.1 17.7 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.5 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.9-4.6l-7.9-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2.1 1.4-4.7 2.3-7.7 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"
                    />
                  </svg>
                  Tiếp tục với Google
                </button>
                <div className="auth-switch">
                  Chưa có tài khoản?{" "}
                  <button
                    className="auth-switch-link"
                    onClick={() => setTab("register")}
                  >
                    Đăng ký ngay
                  </button>
                </div>
              </>
            )}

            {/* ===== FORM ĐĂNG KÝ ===== */}
            {tab === "register" && (
              <>
                {registerError && (
                  <div className="error-message">{registerError}</div>
                )}
                {registerSuccess && (
                  <div className="success-message">{registerSuccess}</div>
                )}
                <form onSubmit={handleRegister}>
                  <div className="form-group">
                    <label>Họ và tên</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={registerData.fullName}
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="abc@email.com"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mật khẩu</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Ít nhất 6 ký tự"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Nhập lại mật khẩu"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={registerLoading}
                  >
                    {registerLoading ? "Đang đăng ký..." : "Tạo tài khoản"}
                  </button>
                </form>
                <div className="auth-divider">
                  <div className="auth-divider-line" />
                  <span className="auth-divider-text">hoặc</span>
                  <div className="auth-divider-line" />
                </div>
                <button className="btn-google" onClick={handleGoogleLogin}>
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13.1 17.7 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.5 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.9-4.6l-7.9-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2.1 1.4-4.7 2.3-7.7 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"
                    />
                  </svg>
                  Tiếp tục với Google
                </button>
                <div className="auth-switch">
                  Đã có tài khoản?{" "}
                  <button
                    className="auth-switch-link"
                    onClick={() => setTab("login")}
                  >
                    Đăng nhập
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
