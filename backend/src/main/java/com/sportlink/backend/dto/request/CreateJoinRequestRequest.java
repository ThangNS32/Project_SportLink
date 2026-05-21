package com.sportlink.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateJoinRequestRequest {

    // Frontend chỉ cần gửi postId — Spring Boot tự tìm user từ JWT token
    // @NotNull để Spring tự validate, trả lỗi nếu thiếu field này
    @NotNull(message = "postId không được để trống")
    Long postId;
}