package com.sportlink.backend.service;

import com.sportlink.backend.dto.response.NotificationResponse;
import com.sportlink.backend.entity.*;
import com.sportlink.backend.repository.NotificationRepository;
import com.sportlink.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationService {

    NotificationRepository notificationRepository;
    UserRepository userRepository;

    // Gọi khi user A bấm "Tham gia" → tạo thông báo cho chủ bài (user B)
    public void createJoinNotification(JoinRequest request) {
        // Xác định text action dựa trên loại request
        String action = request.getRequestType() == RequestType.join
                ? "muốn tham gia" : "muốn giao hữu";

        // Format: "Nguyễn A muốn tham gia "Team Cầu Lông""
        String content = String.format("%s %s \"%s\"",
                request.getRequester().getFullName(),
                action,
                request.getPost().getTeamName());

        Notification notif = Notification.builder()
                .user(request.getPost().getUser()) // gửi cho CHỦ BÀI
                .type(NotificationType.join_request)
                .refId(request.getRequestId())     // frontend dùng để mở /chat/req_{refId}
                .content(content)
                .build();

        notificationRepository.save(notif);
    }

    // Gọi khi chủ bài accept/reject → tạo thông báo cho người đã gửi request
    // accepted=true → "đã được chấp nhận", accepted=false → "đã bị từ chối"
    public void createResponseNotification(JoinRequest request, boolean accepted) {
        String content = accepted
                ? String.format("Lời tham gia của bạn cho \"%s\" đã được chấp nhận! Hãy giữ uy tín",
                request.getPost().getTeamName())
                : String.format("Lời tham gia của bạn cho \"%s\" đã bị từ chối.",
                request.getPost().getTeamName());

        Notification notif = Notification.builder()
                .user(request.getRequester()) // gửi cho NGƯỜI GỬI REQUEST
                .type(accepted ? NotificationType.accepted : NotificationType.rejected)
                .refId(request.getRequestId())
                .content(content)
                .build();

        notificationRepository.save(notif);
    }

    // Frontend Header gọi endpoint này mỗi 10s để lấy thông báo chưa đọc
    public List<NotificationResponse> getUnreadNotifications() {
        Long userId = getCurrentUserId();
        return notificationRepository
                .findByUser_UserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Gọi khi user click vào thông báo → đánh dấu đã đọc để badge biến mất
    public void markAsRead(Long notifId) {
        Notification notif = notificationRepository.findById(notifId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));
        notif.setIsRead(true);
        notificationRepository.save(notif);
    }

    public void createRatingNotification(User rater, User rated, int stars, List<RatingTag> tags) {
        String tagText = tags.isEmpty() ? "" : ", lý do: " +
                tags.stream()
                        .map(t -> switch (t) {
                            case uy_tin -> "Uy tín";
                            case thai_do_tot -> "Thái độ tốt";
                            case khong_uy_tin -> "Không uy tín";
                            case thai_do_khong_dep -> "Thái độ không đẹp";
                            case khong_dung_hen -> "Không đúng hẹn";
                        })
                        .collect(Collectors.joining(", "));

        Notification notif = Notification.builder()
                .user(rated)
                .type(NotificationType.rated)
                .refId(null)
                .content(rater.getFullName() + " đã đánh giá bạn " + stars + " sao" + tagText)
                .build();
        notificationRepository.save(notif);
    }

    // Helper: map Notification entity → NotificationResponse DTO
    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .notifId(n.getNotifId())
                .type(n.getType())
                .refId(n.getRefId())
                .content(n.getContent())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }

    // Lấy userId của người đang đăng nhập từ JWT token
    // SecurityContextHolder chứa thông tin auth của request hiện tại
    // getName() trả về email (vì JWT dùng email làm subject)
    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"))
                .getUserId();
    }

    public void createBanNotification(User user) {
        Notification notif = Notification.builder()
                .user(user)
                .type(NotificationType.banned)
                .refId(null)
                .content("Tài khoản của bạn bị khoá 7 ngày do điểm uy tín quá thấp.")
                .build();
        notificationRepository.save(notif);
    }
}