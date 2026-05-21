                                                                                                                                                                                   
  import api from "./axiosConfig";                                                                                                                                                 
                                                                                                                                                                                   
  const userApi = {
    // Lấy thông tin bản thân
    getMyInfo: () => api.get("/api/users/me"),                                                                                                                                     
   
    // Xem profile người khác                                                                                                                                                      
    getUserById: (userId) => api.get(`/api/users/${userId}`),
                                                                                                                                                                                   
    // Cập nhật profile
    updateProfile: (data) => api.put("/api/users/me", data),
                                                                                                                                                                                   
    // Cập nhật vị trí GPS
    updateLocation: (lat, lng) => api.put("/api/users/me/location", { lat, lng }),                                                                                                 
                  
    // Upload avatar (multipart/form-data)                                                                                                                                         
    uploadAvatar: (file) => {
      const formData = new FormData();                                                                                                                                             
      formData.append("file", file);
      return api.post("/api/users/me/avatar", formData, {                                                                                                                          
        headers: { "Content-Type": "multipart/form-data" },
      });                                                                                                                                                                          
    },            

  };              

  export default userApi; 