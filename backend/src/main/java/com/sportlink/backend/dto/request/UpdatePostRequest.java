package com.sportlink.backend.dto.request;

import com.sportlink.backend.entity.PlayFormat;
import com.sportlink.backend.entity.SkillLevel;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdatePostRequest {
    @Size(max = 100)
    String teamName;

    @Future(message = "Thời gian phải ở tương lai")
    LocalDateTime playTime;

    SkillLevel skillLevel;

    String locationName;
    BigDecimal locationLat;
    BigDecimal locationLng;

    @Min(value = 1)
    Integer slotsTotal;
    PlayFormat playFormat;

    String note;
}
