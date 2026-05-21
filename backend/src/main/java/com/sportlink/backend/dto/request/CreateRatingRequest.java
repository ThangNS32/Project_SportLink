package com.sportlink.backend.dto.request;

import com.sportlink.backend.entity.RatingTag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CreateRatingRequest {

    @NotNull
    private Long requestId;

    @NotNull
    @Min(1) @Max(5)
    private Integer stars;

    private List<RatingTag> tags;
}