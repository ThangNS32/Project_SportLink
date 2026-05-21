package com.sportlink.backend.scheduler;

import com.sportlink.backend.entity.Rating;
import com.sportlink.backend.repository.RatingRepository;
import com.sportlink.backend.service.RatingService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RatingScheduler {
    RatingRepository ratingRepository;
    RatingService ratingService;

    // Chạy mỗi ngày lúc 2 giờ sáng
    // Cron: "0 0 2 * * *" = giây phút giờ ngày tháng thứ
    @Scheduled(cron = "0 0 2 * * *")
    public void revealExpiredRatings() {
        // cutoff = 3 ngày trước lúc 00:00:00
        // Ví dụ: hôm nay 14/05 → cutoff = 11/05 00:00:00
        // Bất kể playTime là 8h sáng hay 10h tối đều reveal đúng sau 3 ngày
        LocalDateTime cutoff = LocalDate.now().minusDays(3).atStartOfDay();

        List<Rating> expiredRatings = ratingRepository
                .findRevealableRatings(cutoff);

        if (expiredRatings.isEmpty()) return;

        ratingService.revealRatings(expiredRatings);
    }
}