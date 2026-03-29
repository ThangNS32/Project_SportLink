package com.sportlink.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateLocationRequest {

    @NotNull(message = "Vĩ độ không được để trống")
    Double lat;

    @NotNull(message = "Kinh độ không được để trống")
    Double lng;
}
