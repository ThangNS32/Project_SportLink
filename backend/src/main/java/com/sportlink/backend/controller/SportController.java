package com.sportlink.backend.controller;

import com.sportlink.backend.dto.request.AddUserSportRequest;
import com.sportlink.backend.dto.request.UpdateFavoriteSportsRequest;
import com.sportlink.backend.dto.response.ApiResponse;
import com.sportlink.backend.dto.response.UserSportResponse;
import com.sportlink.backend.entity.SkillLevel;
import com.sportlink.backend.entity.SportType;
import com.sportlink.backend.service.SportService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SportController {

    SportService sportService;

    // ── GET /api/users/me/sports ───────────────────────────
    // Lấy danh sách môn thể thao của tôi
    @GetMapping("/me/sports")
    public ResponseEntity<ApiResponse<List<UserSportResponse>>> getMyFavoriteSports() {
        return ResponseEntity.ok(
                ApiResponse.<List<UserSportResponse>>builder()
                        .result(sportService.getMyFavoriteSports())
                        .build()
        );
    }

    // ── GET /api/users/{userId}/sports ─────────────────────
    // Xem môn thể thao của user khác
    @GetMapping("/{userId}/sports")
    public ResponseEntity<ApiResponse<List<UserSportResponse>>> getUserSports(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                ApiResponse.<List<UserSportResponse>>builder()
                        .result(sportService.getUserSports(userId))
                        .build()
        );
    }

    // ── POST /api/users/me/sports ──────────────────────────
    // Thêm môn thể thao yêu thích
    @PostMapping("/me/sports")
    public ResponseEntity<ApiResponse<UserSportResponse>> addFavoriteSport(
            @RequestBody @Valid AddUserSportRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<UserSportResponse>builder()
                        .message("Đã thêm môn thể thao yêu thích")
                        .result(sportService.addFavoriteSport(request))
                        .build()
        );
    }

    // ── PUT /api/users/me/sports/{sportType} ───────────────
    // Cập nhật trình độ của một môn
    @PutMapping("/me/sports/{sportType}")
    public ResponseEntity<ApiResponse<UserSportResponse>> updateSkillLevel(
            @PathVariable SportType sportType,
            @RequestParam SkillLevel skillLevel) {
        return ResponseEntity.ok(
                ApiResponse.<UserSportResponse>builder()
                        .message("Đã cập nhật trình độ")
                        .result(sportService.updateSkillLevel(sportType, skillLevel))
                        .build()
        );
    }

    // ── DELETE /api/users/me/sports/{sportType} ────────────
    // Xoá môn thể thao yêu thích
    @DeleteMapping("/me/sports/{sportType}")
    public ResponseEntity<ApiResponse<Void>> removeFavoriteSport(
            @PathVariable SportType sportType) {
        sportService.removeFavoriteSport(sportType);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .message("Đã xoá môn thể thao yêu thích")
                        .build()
        );
    }

    // ── PUT /api/users/me/sports ───────────────────────────
    // Thay thế toàn bộ môn yêu thích (popup chọn lần đầu + chỉnh sửa profile)
    @PutMapping("/me/sports")
    public ResponseEntity<ApiResponse<List<UserSportResponse>>> replaceAllSports(
            @RequestBody @Valid UpdateFavoriteSportsRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<List<UserSportResponse>>builder()
                        .message("Cập nhật môn thể thao yêu thích thành công")
                        .result(sportService.replaceAllSports(request))
                        .build()
        );
    }

}
