package com.sportlink.backend.controller;

import com.sportlink.backend.dto.request.CreateJoinRequestRequest;
import com.sportlink.backend.dto.response.ApiResponse;
import com.sportlink.backend.dto.response.JoinRequestResponse;
import com.sportlink.backend.service.JoinRequestService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/join-requests")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JoinRequestController {

    JoinRequestService joinRequestService;

    // POST /api/join-requests
    // Frontend gọi khi user bấm "Tham gia" hoặc "Giao hữu"
    // @Valid kích hoạt validation của @NotNull trong CreateJoinRequestRequest
    @PostMapping
    public ResponseEntity<ApiResponse<JoinRequestResponse>> createJoinRequest(
            @RequestBody @Valid CreateJoinRequestRequest request) {
        return ResponseEntity.ok(ApiResponse.<JoinRequestResponse>builder()
                .message("Đã gửi yêu cầu tham gia")
                .result(joinRequestService.createJoinRequest(request))
                .build());
    }

    // PATCH /api/join-requests/123/accept
    // Chủ bài bấm "Chấp nhận" → Spring Boot tăng slotsFilled
    @PatchMapping("/{requestId}/accept")
    public ResponseEntity<ApiResponse<JoinRequestResponse>> accept(
            @PathVariable Long requestId) {
        return ResponseEntity.ok(ApiResponse.<JoinRequestResponse>builder()
                .message("Đã chấp nhận")
                .result(joinRequestService.acceptJoinRequest(requestId))
                .build());
    }

    // PATCH /api/join-requests/123/reject
    // Chủ bài bấm "Từ chối" → không thay đổi slots
    @PatchMapping("/{requestId}/reject")
    public ResponseEntity<ApiResponse<JoinRequestResponse>> reject(
            @PathVariable Long requestId) {
        return ResponseEntity.ok(ApiResponse.<JoinRequestResponse>builder()
                .message("Đã từ chối")
                .result(joinRequestService.rejectJoinRequest(requestId))
                .build());
    }

    // GET /api/join-requests/conversations
    // Lấy danh sách tất cả conversations để hiện ở sidebar chat
    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<JoinRequestResponse>>> getMyConversations() {
        return ResponseEntity.ok(ApiResponse.<List<JoinRequestResponse>>builder()
                .result(joinRequestService.getMyConversations())
                .build());
    }
}