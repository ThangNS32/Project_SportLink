import axiosInstance from "../../api/axiosConfig";

export const getUnreadNotifications = () =>
    axiosInstance.get("/api/notifications");

export const markNotificationRead = (notifId) =>
    axiosInstance.patch(`/api/notifications/${notifId}/read`);