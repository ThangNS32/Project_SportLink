import api from "./axiosConfig";

  const postApi = {
                                                                                                                                                                                   
    // Bài đăng của bản thân
    getMyPosts: () => api.get("/api/posts/me"),                                                                                                                                    
                                                                                                                                                                                   
    // Feed trang chủ
    // params: { userLat, userLng }                                                                                                                                                
    getHomeFeed: (userLat, userLng) =>                                                                                                                                             
      api.get("/api/posts/home", { params: { userLat, userLng } }),
                                                                                                                                                                                   
    // Tìm kiếm nâng cao                                                                                                                                                           
    // params: { sportType, postType, skillLevel, playDate, timeFrom, userLat, userLng, radiusKm }
    searchPosts: (params) => api.get("/api/posts/search", { params }),
                                                                                                                                                                                   
    // Tạo bài đăng mới
    createPost: (data) => api.post("/api/posts", data),                                                                                                                            
                  
    // Cập nhật bài đăng                                                                                                                                                           
    updatePost: (postId, data) => api.put(`/api/posts/${postId}`, data),
                                                                                                                                                                                   
    // Xoá bài đăng                                                                                                                                                                
    deletePost: (postId) => api.delete(`/api/posts/${postId}`),

    // Tìm đồng đội (có filter lat/lng/radius)                                                                                                                
    getTeamPosts: (params) => api.get("/api/posts/find-team", { params }),                                                                                    
                                                                                                                                                            
    // Tìm đối thủ (có filter lat/lng/radius)                                                                                                                 
    getRivalPosts: (params) => api.get("/api/posts/find-rival", { params }),

    getUserPosts: (userId, params) => api.get(`/api/posts/user/${userId}`, { params }), 
};                                                                                                                                                                               
                  
export default postApi;