import api from "./axiosConfig";

  const sportApi = {
    // Môn thể thao của bản thân
    getMyFavoriteSports: () => api.get("/api/users/me/sports"),                                                                                                                    
   
    // Môn thể thao của người khác                                                                                                                                                 
    getUserSports: (userId) => api.get(`/api/users/${userId}/sports`),
    
    replaceAllSports: (sports) =>
    api.put("/api/users/me/sports", { sports }),

};              

export default sportApi;                                                                                                                                                         
   