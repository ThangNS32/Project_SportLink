import axiosInstance from "../../api/axiosConfig";

export const createJoinRequest = (postId) =>
    axiosInstance.post("/api/join-requests", { postId });

export const acceptRequest = (requestId) =>
    axiosInstance.patch(`/api/join-requests/${requestId}/accept`);

export const rejectRequest = (requestId) =>
    axiosInstance.patch(`/api/join-requests/${requestId}/reject`);

export const getMyConversations = () =>
    axiosInstance.get("/api/join-requests/conversations");