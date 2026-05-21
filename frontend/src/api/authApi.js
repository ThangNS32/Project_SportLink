import api from "./axiosConfig";

const authApi = {

  // Đăng ký
  register: (data) => api.post("/api/auth/register", data),

  // Đăng nhập
  login: (data) => api.post("/api/auth/login", data),

  // Đăng nhập Google
  loginWithGoogle: (code) => api.post("/api/auth/google", { code }),

  // Logout
  logout: (token) => api.post("/api/auth/logout", { token }),
};

export default authApi;