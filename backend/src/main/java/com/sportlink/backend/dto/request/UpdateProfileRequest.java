package com.sportlink.backend.dto.request;


import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateProfileRequest {
    @Size(min = 2, max = 100, message = "Tên phải từ 2 đến 100 ký tự")
    String fullName;

    String avatarUrl;

    @Min(value = 10, message = "Tuổi phải ít nhất 10")
    @Max(value = 100, message = "Tuổi không được quá 100")
    Integer age;

    @Size(min = 6, message = "Mật khẩu phải ít nhất 6 ký tự")
    String password;       // Null = không đổi mật khẩu
}
