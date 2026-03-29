package com.sportlink.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminCreateUserRequest {

    @NotBlank(message = "Tên không được để trống")
    String fullName;

    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    String email;

    @Size(min = 6, message = "Mật khẩu phải ít nhất 6 ký tự")
    @NotBlank(message = "Mật khẩu không được để trống")
    String password;

    // Admin có thể chỉ định role khi tạo
    String role; // "user" hoặc "admin"
}
