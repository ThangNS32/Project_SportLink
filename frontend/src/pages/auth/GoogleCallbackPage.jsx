import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";

function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Đang xử lý đăng nhập Google...");
  const called = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (called.current) return;
      called.current = true;
      // Lấy code từ URL
      const code = new URLSearchParams(window.location.search).get("code");

      if (!code) {
        setStatus("Không tìm thấy code từ Google!");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      try {
        const response = await authApi.loginWithGoogle(code);
        const data = response.data;

        if (data.result?.token) {
          // Lưu token và thông tin user
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
            })
          );

          setStatus("Đăng nhập thành công! Đang chuyển trang...");
          setTimeout(() => navigate("/"), 1000);
        }
      } catch (err) {
        const message = err.response?.data?.message;
        if (message === "Tài khoản đang bị khoá") {
          setStatus("Tài khoản của bạn đang bị khoá!");
        } else {
          setStatus("Đăng nhập Google thất bại, vui lòng thử lại!");
        }
        setTimeout(() => navigate("/"), 2000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Loading spinner */}
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid #e8ecf1",
          borderTop: "4px solid #1d6fd8",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />

      <style>{`
        @keyframes spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <p style={{ color: "#374151", fontSize: "15px" }}>{status}</p>
    </div>
  );
}

export default GoogleCallbackPage;
