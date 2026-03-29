package com.sportlink.backend.controller;


import com.sportlink.backend.dto.request.AdminCreateUserRequest;
import com.sportlink.backend.dto.request.UpdateProfileRequest;
import com.sportlink.backend.dto.request.UpdateLocationRequest;
import com.sportlink.backend.dto.response.ApiResponse;
import com.sportlink.backend.dto.response.UserResponse;
import com.sportlink.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {

    UserService userService;

    // ── GET /api/users/me ──────────────────────────────────
    // Lấy thông tin user đang đăng nhập
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyInfo() {
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .result(userService.getMyInfo())
                        .build()
        );
    }

    // ── GET /api/users/{userId} ────────────────────────────
    // Xem profile người khác
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .result(userService.getUserById(userId))
                        .build()
        );
    }

    // ── PUT /api/users/me ──────────────────────────────────
    // Cập nhật profile của mình
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @RequestBody @Valid UpdateProfileRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .message("Cập nhật profile thành công")
                        .result(userService.updateProfile(request))
                        .build()
        );
    }

    // ── PUT /api/users/me/location ─────────────────────────
    // Cập nhật vị trí GPS
    @PutMapping("/me/location")
    public ResponseEntity<ApiResponse<Void>> updateLocation(
            @RequestBody @Valid UpdateLocationRequest request) {
        userService.updateLocation(request.getLat(), request.getLng());
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .message("Cập nhật vị trí thành công")
                        .build()
        );
    }

    // ── GET /api/users/admin/all ───────────────────────────
    // ADMIN: Lấy danh sách tất cả user
    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(
                ApiResponse.<List<UserResponse>>builder()
                        .result(userService.getAllUsers())
                        .build()
        );
    }

    // ── GET /api/users/admin/search ────────────────────────
    // ADMIN: Tìm kiếm user theo tên
    @GetMapping("/admin/search")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(
            @RequestParam String fullName) {
        return ResponseEntity.ok(
                ApiResponse.<List<UserResponse>>builder()
                        .result(userService.searchUsers(fullName))
                        .build()
        );
    }

    // ── PUT /api/users/admin/{userId}/disable ──────────────
    // ADMIN: Khoá tài khoản vĩnh viễn
    @PutMapping("/admin/{userId}/disable")
    public ResponseEntity<ApiResponse<Void>> disableUser(
            @PathVariable Long userId) {
        userService.disableUser(userId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .message("Đã khoá tài khoản người dùng")
                        .build()
        );
    }

    // ── PUT /api/users/admin/{userId}/enable ───────────────
    // ADMIN: Mở khoá tài khoản
    @PutMapping("/admin/{userId}/enable")
    public ResponseEntity<ApiResponse<Void>> enableUser(
            @PathVariable Long userId) {
        userService.enableUser(userId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .message("Đã mở khoá tài khoản người dùng")
                        .build()
        );
    }

    // ── DELETE /api/users/admin/{userId} ───────────────────
    // ADMIN: Xoá tài khoản
    @DeleteMapping("/admin/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .message("Đã xoá tài khoản người dùng")
                        .build()
        );
    }

    // POST /api/users/admin/create
    @PostMapping("/admin/create")
    public ResponseEntity<ApiResponse<UserResponse>> adminCreateUser(
            @RequestBody @Valid AdminCreateUserRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .message("Tạo tài khoản thành công")
                        .result(userService.adminCreateUser(request))
                        .build()
        );
    }
}
