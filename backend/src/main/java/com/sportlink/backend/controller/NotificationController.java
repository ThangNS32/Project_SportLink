package com.sportlink.backend.controller;

import com.sportlink.backend.dto.response.ApiResponse;
import com.sportlink.backend.dto.response.NotificationResponse;
import com.sportlink.backend.service.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {

    NotificationService notificationService;

    // GET /api/notifications
    // Header React gọi endpoint này mỗi 10 giây
    // Trả về danh sách thông báo CHƯA ĐỌC → frontend hiện badge đỏ
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnread() {
        return ResponseEntity.ok(ApiResponse.<List<NotificationResponse>>builder()
                .result(notificationService.getUnreadNotifications())
                .build());
    }

    // PATCH /api/notifications/456/read
    // Gọi khi user click vào thông báo → đánh dấu đã đọc → badge biến mất
    @PatchMapping("/{notifId}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable Long notifId) {
        notificationService.markAsRead(notifId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Đã đánh dấu đọc")
                .build());
    }
}
