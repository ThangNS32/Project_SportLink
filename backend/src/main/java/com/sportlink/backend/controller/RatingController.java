package com.sportlink.backend.controller;

import com.sportlink.backend.dto.request.CreateRatingRequest;
import com.sportlink.backend.dto.response.ApiResponse;
import com.sportlink.backend.dto.response.RatingResponse;
import com.sportlink.backend.service.RatingService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RatingController {

    RatingService ratingService;

    // POST /api/ratings
    // Frontend gọi khi user bấm "Gửi đánh giá" trong modal
    @PostMapping
    public ResponseEntity<ApiResponse<RatingResponse>> submitRating(
            @RequestBody @Valid CreateRatingRequest request) {
        return ResponseEntity.ok(ApiResponse.<RatingResponse>builder()
                .message("Đánh giá thành công")
                .result(ratingService.submitRating(request))
                .build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUserRatingTags(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.<Map<String, Long>>builder()
                .result(ratingService.getUserRatingTags(userId))
                .build());
    }
}