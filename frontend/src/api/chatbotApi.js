import api from "./axiosConfig";

export const sendMessage = (message) => {
    const userLat = parseFloat(localStorage.getItem("userLat")) || null;
    const userLng = parseFloat(localStorage.getItem("userLng")) || null;
    return api.post("/api/chatbot", { message, userLat, userLng });
}; 