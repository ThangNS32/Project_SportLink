package com.sportlink.backend.dto.response;

import com.sportlink.backend.entity.RatingTag;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class RatingResponse {

    private Long ratingId;
    private Long requestId;
    private Long ratedUserId;
    private Integer stars;
    private List<RatingTag> tags;
    private Boolean isRevealed;
    private LocalDateTime createdAt;
    private String message;
}