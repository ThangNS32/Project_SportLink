package com.sportlink.backend.dto.request;

import com.sportlink.backend.entity.SkillLevel;
import com.sportlink.backend.entity.SportType;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddUserSportRequest {

    @NotNull(message = "Vui lòng chọn môn thể thao")
    SportType sportType;

    @NotNull(message = "Vui lòng chọn trình độ")
    SkillLevel skillLevel;
}

