package com.sportlink.backend.dto.response;

import com.sportlink.backend.entity.SkillLevel;
import com.sportlink.backend.entity.SportType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserSportResponse {
    SportType sportType;
    SkillLevel skillLevel;
}

