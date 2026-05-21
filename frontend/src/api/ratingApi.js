import api from "./axiosConfig";

export const submitRating = (data) => api.post("/api/ratings", data); 

export const getUserRatingTags = (userId) => api.get(`/api/ratings/user/${userId}`);