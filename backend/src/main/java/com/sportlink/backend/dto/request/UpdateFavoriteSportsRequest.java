package com.sportlink.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateFavoriteSportsRequest {

    @NotNull
    List<AddUserSportRequest> sports; // Danh sách môn mới (thay thế toàn bộ)
}
