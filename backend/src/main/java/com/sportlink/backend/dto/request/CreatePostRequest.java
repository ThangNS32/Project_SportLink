package com.sportlink.backend.dto.request;

import com.sportlink.backend.entity.PlayFormat;
import com.sportlink.backend.entity.PostType;
import com.sportlink.backend.entity.SkillLevel;
import com.sportlink.backend.entity.SportType;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreatePostRequest {

    @NotBlank(message = "Tên đội không được để trống")
    @Size(max = 100)
    String teamName;

    @NotNull(message = "Môn thể thao không được để trống")
    SportType sportType;

    @NotNull(message = "Loại bài đăng không được để trống")
    PostType postType;

    @NotNull(message = "Thời gian thi đấu không được để trống")
    @Future(message = "Thời gian phải ở tương lai")
    LocalDateTime playTime;

    SkillLevel skillLevel;

    @NotBlank(message = "Địa điểm không được để trống")
    String locationName;

    @NotNull(message = "Tọa độ lat không được để trống")
    BigDecimal locationLat;

    @NotNull(message = "Tọa độ lng không được để trống")
    BigDecimal locationLng;

    @NotNull
    @Min(value = 1, message = "Số người ít nhất là 1")
    Integer slotsTotal;

    PlayFormat playFormat;

    String note;
}
