package com.sportlink.backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SportPostResponse {
    Long postId;

    // Thông tin người đăng
    Long userId;
    String userFullName;
    String userAvatarUrl;
    Double userTrustScore;
    Integer userTotalRating;

    // Thông tin bài đăng
    String teamName;
    String sportType;
    String postType;
    LocalDateTime playTime;
    String skillLevel;
    String locationName;
    Double locationLat;
    Double locationLng;
    Integer slotsTotal;
    Integer slotsFilled;
    String playFormat;
    String note;
    String status;
    LocalDateTime createdAt;

    // Tính toán từ GPS — null nếu user không gửi tọa độ
    Double distanceKm;
}
