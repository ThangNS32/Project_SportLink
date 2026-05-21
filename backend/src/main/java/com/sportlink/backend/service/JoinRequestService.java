package com.sportlink.backend.service;

import com.sportlink.backend.dto.request.CreateJoinRequestRequest;
import com.sportlink.backend.dto.response.JoinRequestResponse;
import com.sportlink.backend.entity.*;
import com.sportlink.backend.exception.AppException;
import com.sportlink.backend.exception.ErrorCode;
import com.sportlink.backend.repository.JoinRequestRepository;
import com.sportlink.backend.repository.SportPostRepository;
import com.sportlink.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JoinRequestService {

    JoinRequestRepository joinRequestRepository;
    SportPostRepository sportPostRepository;
    UserRepository userRepository;
    NotificationService notificationService;

    // @Transactional: nếu có lỗi giữa chừng thì rollback tất cả
    // Ví dụ: tạo JoinRequest xong nhưng tạo Notification lỗi
    // → @Transactional đảm bảo cả 2 đều bị hủy, không bị dữ liệu thừa
    @Transactional
    public JoinRequestResponse createJoinRequest(CreateJoinRequestRequest request) {
        User currentUser = getCurrentUser();

        if (currentUser.getBanUntil() != null &&
                currentUser.getBanUntil().isAfter(LocalDateTime.now())) {
            throw new AppException(ErrorCode.ACCOUNT_BANNED);
        }

        SportPost post = sportPostRepository.findById(request.getPostId())
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        // Luật 1: không cho tham gia bài của chính mình
        if (post.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.CANNOT_JOIN_OWN_POST);
        }

        // Luật 2: chỉ tham gia bài đang "open"
        if (post.getStatus() != PostStatus.open) {
            throw new AppException(ErrorCode.POST_NOT_AVAILABLE);
        }

        // Luật 3: không cho gửi request 2 lần cho cùng 1 bài
        if (joinRequestRepository.existsByPost_PostIdAndRequester_UserId(
                post.getPostId(), currentUser.getUserId())) {
            throw new AppException(ErrorCode.REQUEST_ALREADY_SENT);
        }

        // Xác định requestType từ postType:
        // find_team → join → "Tôi muốn tham gia"
        // find_rival → challenge → "Tôi muốn giao hữu"
        RequestType requestType = post.getPostType() == PostType.find_team
                ? RequestType.join : RequestType.challenge;
        String defaultMessage = requestType == RequestType.join
                ? "Tôi muốn tham gia" : "Tôi muốn giao hữu";

        JoinRequest joinRequest = JoinRequest.builder()
                .post(post)
                .requester(currentUser)
                .requestType(requestType)
                .message(defaultMessage)
                .build();

        JoinRequest saved = joinRequestRepository.save(joinRequest);

        // Tạo thông báo cho chủ bài — NotificationService lo phần này
        notificationService.createJoinNotification(saved);

        return toResponse(saved);
    }

    @Transactional
    public JoinRequestResponse acceptJoinRequest(Long requestId) {
        User currentUser = getCurrentUser();

        // findByRequestIdAndPost_User_UserId tự kiểm tra quyền:
        // nếu request này không thuộc bài của currentUser → empty → throw lỗi
        JoinRequest joinRequest = joinRequestRepository
                .findByRequestIdAndPost_User_UserId(requestId, currentUser.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.REQUEST_NOT_FOUND));

        if (joinRequest.getStatus() != RequestStatus.pending) {
            throw new AppException(ErrorCode.REQUEST_NOT_PENDING);
        }

        joinRequest.setStatus(RequestStatus.accepted);
        joinRequest.setRespondedAt(LocalDateTime.now());
        joinRequestRepository.save(joinRequest);

        // Tăng slotsFilled — đây là business logic cốt lõi
        SportPost post = joinRequest.getPost();
        post.setSlotsFilled(post.getSlotsFilled() + 1);

        // Nếu đã đủ người → đổi trạng thái bài
        // find_rival đủ 1 đối thủ → "matched"
        // find_team đủ người → "full"
        if (post.getSlotsFilled() >= post.getSlotsTotal()) {
            PostStatus newStatus = post.getPostType() == PostType.find_rival
                    ? PostStatus.matched : PostStatus.full;
            post.setStatus(newStatus);
        }
        sportPostRepository.save(post);

        // Báo cho người gửi request biết họ được chấp nhận
        notificationService.createResponseNotification(joinRequest, true);

        return toResponse(joinRequest);
    }

    @Transactional
    public JoinRequestResponse rejectJoinRequest(Long requestId) {
        User currentUser = getCurrentUser();

        JoinRequest joinRequest = joinRequestRepository
                .findByRequestIdAndPost_User_UserId(requestId, currentUser.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.REQUEST_NOT_FOUND));

        if (joinRequest.getStatus() != RequestStatus.pending) {
            throw new AppException(ErrorCode.REQUEST_NOT_PENDING);
        }

        joinRequest.setStatus(RequestStatus.rejected);
        joinRequest.setRespondedAt(LocalDateTime.now());
        joinRequestRepository.save(joinRequest);

        // Không tăng slots — chỉ báo cho người gửi biết bị từ chối
        notificationService.createResponseNotification(joinRequest, false);

        return toResponse(joinRequest);
    }

    // Lấy tất cả conversations của tôi (là requester hoặc chủ bài)
    // Dùng cho ConversationList ở sidebar chat
    public List<JoinRequestResponse> getMyConversations() {
        Long userId = getCurrentUser().getUserId();
        return joinRequestRepository.findMyConversations(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Map entity → DTO — lấy đúng field cần thiết cho frontend
    private JoinRequestResponse toResponse(JoinRequest r) {
        return JoinRequestResponse.builder()
                .requestId(r.getRequestId())
                .postId(r.getPost().getPostId())
                .postTitle(r.getPost().getTeamName())
                .postType(r.getPost().getPostType().name())
                .postPlayTime(r.getPost().getPlayTime())
                .requesterId(r.getRequester().getUserId())
                .requesterName(r.getRequester().getFullName())
                .requesterAvatar(r.getRequester().getAvatarUrl())
                .ownerId(r.getPost().getUser().getUserId())
                .ownerName(r.getPost().getUser().getFullName())
                .ownerAvatar(r.getPost().getUser().getAvatarUrl())
                .requestType(r.getRequestType())
                .status(r.getStatus())
                .message(r.getMessage())
                .createdAt(r.getCreatedAt())
                .build();
    }

    // Lấy user đang đăng nhập từ JWT token
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
    }
}