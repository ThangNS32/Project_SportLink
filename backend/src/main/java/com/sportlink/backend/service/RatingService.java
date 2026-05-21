package com.sportlink.backend.service;

import com.sportlink.backend.dto.request.CreateRatingRequest;
import com.sportlink.backend.dto.response.RatingResponse;
import com.sportlink.backend.entity.*;
import com.sportlink.backend.exception.AppException;
import com.sportlink.backend.exception.ErrorCode;
import com.sportlink.backend.repository.JoinRequestRepository;
import com.sportlink.backend.repository.RatingRepository;
import com.sportlink.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RatingService {

    RatingRepository ratingRepository;
    JoinRequestRepository joinRequestRepository;
    UserRepository userRepository;
    NotificationService notificationService;

    @Transactional
    public RatingResponse submitRating(CreateRatingRequest request) {
        User currentUser = getCurrentUser();

        JoinRequest joinRequest = joinRequestRepository.findById(request.getRequestId())
                .orElseThrow(() -> new AppException(ErrorCode.REQUEST_NOT_FOUND));

        // Xác định người bị đánh giá (người kia trong cuộc trò chuyện)
        User ratedUser = determineRatedUser(joinRequest, currentUser);

        // Điều kiện 1: request phải được accepted
        if (joinRequest.getStatus() != RequestStatus.accepted) {
            throw new AppException(ErrorCode.RATING_NOT_ALLOWED);
        }

        // Điều kiện 2: playTime phải đã qua
        if (!LocalDateTime.now().isAfter(joinRequest.getPost().getPlayTime())) {
            throw new AppException(ErrorCode.RATING_NOT_ALLOWED);
        }

        // Điều kiện 3: chưa đánh giá request này
        if (ratingRepository.existsByRater_UserIdAndRequest_RequestId(
                currentUser.getUserId(), request.getRequestId())) {
            throw new AppException(ErrorCode.ALREADY_RATED);
        }

        Rating rating = Rating.builder()
                .rater(currentUser)
                .rated(ratedUser)
                .request(joinRequest)
                .stars(request.getStars())
                .tags(request.getTags())
                .build();
        ratingRepository.save(rating);
        notificationService.createRatingNotification(currentUser, ratedUser, request.getStars(), request.getTags());

        // Kiểm tra người kia đã submit chưa → nếu rồi thì reveal cả 2 ngay
        boolean otherAlreadyRated = ratingRepository
                .existsByRater_UserIdAndRequest_RequestId(
                        ratedUser.getUserId(), request.getRequestId());

        if (otherAlreadyRated) {
            List<Rating> toReveal = ratingRepository
                    .findByRequest_RequestIdAndIsRevealedFalse(request.getRequestId());
            revealRatings(toReveal);
            return toResponse(rating, "Đánh giá đã được công khai!");
        }

        return toResponse(rating, "Đánh giá đã được ghi nhận, đang chờ đối phương...");
    }

    // Gọi bởi RatingScheduler — reveal tất cả rating quá 3 ngày
    @Transactional
    public void revealRatings(List<Rating> ratings) {
        for (Rating r : ratings) {
            r.setIsRevealed(true);
        }
        ratingRepository.saveAll(ratings);

        // Tính lại trustScore cho từng người bị đánh giá
        ratings.stream()
                .map(Rating::getRated)
                .distinct()
                .forEach(this::recalculateTrustScore);
    }

    // Tính lại trustScore + totalRating, kiểm tra điều kiện ban
    private void recalculateTrustScore(User user) {
        Optional<Double> avg = ratingRepository
                .findAvgStarsByRatedUserId(user.getUserId());
        long count = ratingRepository
                .countRevealedByRatedUserId(user.getUserId());

        BigDecimal newScore = avg
                .map(a -> BigDecimal.valueOf(a).setScale(1, RoundingMode.HALF_UP))
                .orElse(BigDecimal.valueOf(5.0));

        user.setTrustScore(newScore);
        user.setTotalRating((int) count);

        // Ban 7 ngày nếu điểm ≤ 2 và đủ ≥ 3 lượt
        if (newScore.compareTo(BigDecimal.valueOf(2.0)) <= 0 && count >= 3) {
            user.setBanUntil(LocalDateTime.now().plusDays(7));
            notificationService.createBanNotification(user);
        }

        userRepository.save(user);
    }

    // Xác định ai là người bị đánh giá:
    // current user = requester → rate chủ bài
    // current user = chủ bài  → rate requester
    // không liên quan          → throw lỗi
    private User determineRatedUser(JoinRequest joinRequest, User currentUser) {
        if (joinRequest.getRequester().getUserId().equals(currentUser.getUserId())) {
            return joinRequest.getPost().getUser();
        }
        if (joinRequest.getPost().getUser().getUserId().equals(currentUser.getUserId())) {
            return joinRequest.getRequester();
        }
        throw new AppException(ErrorCode.RATING_NOT_ALLOWED);
    }

    public Map<String, Long> getUserRatingTags(Long userId) {
        return ratingRepository.findByRated_UserIdAndIsRevealedTrue(userId)
                .stream()
                .flatMap(r -> r.getTags().stream())
                .collect(Collectors.groupingBy(RatingTag::name, Collectors.counting()));
    }

    private RatingResponse toResponse(Rating r, String message) {
        return RatingResponse.builder()
                .ratingId(r.getRatingId())
                .requestId(r.getRequest().getRequestId())
                .ratedUserId(r.getRated().getUserId())
                .stars(r.getStars())
                .tags(r.getTags())
                .isRevealed(r.getIsRevealed())
                .createdAt(r.getCreatedAt())
                .message(message)
                .build();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
    }
}

