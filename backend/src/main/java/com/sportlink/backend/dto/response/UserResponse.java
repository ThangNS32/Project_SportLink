package com.sportlink.backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {

    Long userId;
    String fullName;
    String email;
    String avatarUrl;
    Integer age;
    String role;
    Double trustScore;
    Integer totalRating;
    Boolean isActive;
    String createdAt;
}
