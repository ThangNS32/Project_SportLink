package com.sportlink.backend.dto.response;


import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private boolean authenticated;
    // Thông tin user trả về luôn sau khi đăng nhập
    private Long userId;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String role;
    private Double trustScore;
}
