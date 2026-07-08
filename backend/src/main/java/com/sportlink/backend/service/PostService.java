package com.sportlink.backend.service;

import com.sportlink.backend.dto.request.CreatePostRequest;
import com.sportlink.backend.dto.request.UpdatePostRequest;
import com.sportlink.backend.dto.response.SportPostResponse;
import com.sportlink.backend.entity.*;
import com.sportlink.backend.exception.AppException;
import com.sportlink.backend.exception.ErrorCode;
import com.sportlink.backend.mapper.SportPostMapper;
import com.sportlink.backend.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import java.time.LocalDate;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PostService {

    SportPostRepository postRepository;
    UserRepository userRepository;
    SportPostMapper postMapper;
    SportRepository sportRepository;
    RatingRepository ratingRepository;
    JoinRequestRepository joinRequestRepository;

    // ── Lấy bài đăng của mình ─────────────────────────────
    @Transactional(readOnly = true)
    public List<SportPostResponse> getMyPosts() {
        User user = getCurrentUser();
        return postRepository.findByUser(user)
                .stream()
                .map(postMapper::toResponse)
                .collect(Collectors.toList());
    }

    //Lấy bài đăng còn hạn của người dùng khác
    public List<SportPostResponse> getUserActivePosts(Long userId, Double userLat, Double userLng) {
        if (!userRepository.existsById(userId))
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        return postRepository.findByUser_UserIdAndStatus(userId, PostStatus.open)
                .stream()
                .map(post -> {
                    SportPostResponse response = postMapper.toResponse(post);
                    if (userLat != null && userLng != null
                            && post.getLocationLat() != null && post.getLocationLng() != null) {
                        double dist = calculateDistance(
                                userLat, userLng,
                                post.getLocationLat().doubleValue(),
                                post.getLocationLng().doubleValue()
                        );
                        response.setDistanceKm(Math.round(dist * 10.0) / 10.0);
                    }
                    return response;
                })
                .collect(Collectors.toList());
    }

    // ── Tạo bài đăng ──────────────────────────────────────
    @Transactional
    public SportPostResponse createPost(CreatePostRequest request) {
        User user = getCurrentUser();

        if (user.getBanUntil() != null &&
                user.getBanUntil().isAfter(LocalDateTime.now())) {
            throw new AppException(ErrorCode.ACCOUNT_BANNED);
        }

        SportPost post = SportPost.builder()
                .user(user)
                .teamName(request.getTeamName())
                .sportType(request.getSportType())
                .postType(request.getPostType())
                .playTime(request.getPlayTime())
                .skillLevel(request.getSkillLevel())
                .locationName(request.getLocationName())
                .locationLat(request.getLocationLat())
                .locationLng(request.getLocationLng())
                .slotsTotal(request.getSlotsTotal())
                .playFormat(request.getPlayFormat())
                .note(request.getNote())
                .build();

        post = postRepository.save(post);
        log.info("Post created by {}: {}", user.getEmail(), post.getPostId());
        return postMapper.toResponse(post);
    }

    // ── Sửa bài đăng (chỉ chủ bài, chỉ khi còn open) ────
    @Transactional
    public SportPostResponse updatePost(Long postId, UpdatePostRequest request) {
        User user = getCurrentUser();
        SportPost post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        if (!post.getUser().getUserId().equals(user.getUserId()))
            throw new AppException(ErrorCode.NOT_POST_OWNER);

        if (post.getStatus() != PostStatus.open)
            throw new AppException(ErrorCode.POST_EXPIRED);

        if (request.getTeamName() != null)     post.setTeamName(request.getTeamName());
        if (request.getPlayTime() != null)     post.setPlayTime(request.getPlayTime());
        if (request.getSkillLevel() != null)   post.setSkillLevel(request.getSkillLevel());
        if (request.getLocationName() != null) post.setLocationName(request.getLocationName());
        if (request.getLocationLat() != null)  post.setLocationLat(request.getLocationLat());
        if (request.getLocationLng() != null)  post.setLocationLng(request.getLocationLng());
        if (request.getSlotsTotal() != null)   post.setSlotsTotal(request.getSlotsTotal());
        if (request.getPlayFormat() != null)   post.setPlayFormat(request.getPlayFormat());
        if (request.getNote() != null)         post.setNote(request.getNote());

        post = postRepository.save(post);
        log.info("Post {} updated by {}", postId, user.getEmail());
        return postMapper.toResponse(post);
    }

    @Transactional
    public void deletePost(Long postId) {
        User user = getCurrentUser();
        SportPost post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        if (!post.getUser().getUserId().equals(user.getUserId()))
            throw new AppException(ErrorCode.NOT_POST_OWNER);

        List<Long> requestIds = joinRequestRepository.findByPost_PostId(postId)
                .stream()
                .map(JoinRequest::getRequestId)
                .toList();
        if (!requestIds.isEmpty()) {
            ratingRepository.deleteByRequest_RequestIdIn(requestIds);
        }

        joinRequestRepository.deleteByPost_PostId(postId);

        postRepository.delete(post);
        log.info("Post {} deleted by {}", postId, user.getEmail());
    }

    // ── Haversine — tính khoảng cách 2 tọa độ (km) ───────
    private double calculateDistance(double lat1, double lng1,
                                     double lat2, double lng2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // ── Private helper ─────────────────────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private double getRadiusKm(DistanceRange distanceRange) {
        if (distanceRange == null) return Double.MAX_VALUE;
        return switch (distanceRange) {
            case under_1  -> 1.0;
            case under_3  -> 3.0;
            case under_5  -> 5.0;
            case under_10 -> 10.0;
            case under_20 -> 20.0;
        };
    }

    @Transactional(readOnly = true)
    public List<SportPostResponse> getHomeFeed(Double userLat, Double userLng) {
        User user = getCurrentUser();

        // Lấy danh sách môn yêu thích của user
        List<SportType> favoriteSports = sportRepository.findByUser(user)
                .stream()
                .map(Sport::getSportType)
                .collect(Collectors.toList());

        // Không có môn yêu thích → trả về tất cả
        if (favoriteSports.isEmpty()) {
            favoriteSports = List.of(SportType.bong_da, SportType.cau_long, SportType.pickleball);
        }

        // Lấy tất cả bài open thuộc môn yêu thích
        List<SportPost> posts = postRepository.findByStatusAndSportTypeIn(
                PostStatus.open, favoriteSports);

        return posts.stream()
                .map(post -> {
                    SportPostResponse response = postMapper.toResponse(post);
                    if (userLat != null && userLng != null && post.getLocationLat() != null && post.getLocationLng() != null) {
                        double dist = calculateDistance(
                                userLat, userLng,
                                post.getLocationLat().doubleValue(),
                                post.getLocationLng().doubleValue()
                        );
                        response.setDistanceKm(Math.round(dist * 10.0) / 10.0);
                    }
                    return response;
                })
                .sorted(Comparator.comparingDouble(
                        r -> r.getDistanceKm() != null ? r.getDistanceKm() : Double.MAX_VALUE))
                .collect(Collectors.toList());
    }


    // ── Tìm kiếm / lọc bài đăng ──────────────────────────
    @Transactional(readOnly = true)
    public List<SportPostResponse> searchPosts(
            SportType sportType,
            PostType postType,
            SkillLevel skillLevel,
            LocalDate playDate,
            LocalTime timeFrom,
            Double userLat,
            Double userLng,
            PlayFormat playFormat,
            SlotsRange slotsRange,
            DistanceRange distanceRange) {

        // Bước 1: Fetch từ DB với filter cơ bản nhất
        List<SportPost> posts;
        if (sportType != null && postType != null) {
            posts = postRepository.findByStatusAndSportTypeAndPostType(
                    PostStatus.open, sportType, postType);
        } else if (sportType != null) {
            posts = postRepository.findByStatusAndSportType(PostStatus.open, sportType);
        } else if (postType != null) {                                          // ← thêm case này
            posts = postRepository.findByStatusAndPostType(PostStatus.open, postType);
        } else {
            posts = postRepository.findByStatus(PostStatus.open);
        }

        // Bước 2: Áp thêm các filter còn lại trong Java
        return posts.stream()

                // Lọc trình độ
                .filter(p -> skillLevel == null || p.getSkillLevel() == skillLevel)

                // Lọc ngày chơi
                .filter(p -> playDate == null
                        || p.getPlayTime().toLocalDate().equals(playDate))

                // Lọc giờ bắt đầu (>= timeFrom)
                .filter(p -> timeFrom == null
                        || !p.getPlayTime().toLocalTime().isBefore(timeFrom))

                .filter(p -> playFormat == null || p.getPlayFormat() == playFormat)

                .filter(p -> {
                    if (slotsRange == null) return true;
                    int remaining = p.getSlotsTotal() - p.getSlotsFilled();
                    return switch (slotsRange) {
                        case one_to_two    -> remaining >= 1 && remaining <= 2;
                        case three_to_four -> remaining >= 3 && remaining <= 4;
                        case five_plus     -> remaining >= 5;
                    };
                })

                // Gắn distanceKm nếu có tọa độ
                .map(post -> {
                    SportPostResponse response = postMapper.toResponse(post);
                    if (userLat != null && userLng != null && post.getLocationLat() != null && post.getLocationLng() != null) {
                        double dist = calculateDistance(
                                userLat, userLng,
                                post.getLocationLat().doubleValue(),
                                post.getLocationLng().doubleValue()
                        );
                        response.setDistanceKm(Math.round(dist * 10.0) / 10.0);
                    }
                    return response;
                })

                .filter(r -> userLat == null || userLng == null
                        || r.getDistanceKm() == null
                        || r.getDistanceKm() <= getRadiusKm(distanceRange))

                // Sort: gần nhất trước
                .sorted(Comparator.comparingDouble(
                        r -> r.getDistanceKm() != null ? r.getDistanceKm() : Double.MAX_VALUE))

                .collect(Collectors.toList());
    }

    // ── Lấy tất cả bài tìm đồng đội ──────────────────────
    @Transactional(readOnly = true)
    public List<SportPostResponse> getTeamPosts(
            Double userLat, Double userLng, Double radiusKm) {

        List<SportPost> posts = postRepository
                .findByStatusAndPostType(PostStatus.open, PostType.find_team);

        return posts.stream()
                .map(post -> {
                    SportPostResponse response = postMapper.toResponse(post);
                    if (userLat != null && userLng != null && post.getLocationLat() != null && post.getLocationLng() != null) {
                        double dist = calculateDistance(
                                userLat, userLng,
                                post.getLocationLat().doubleValue(),
                                post.getLocationLng().doubleValue()
                        );
                        response.setDistanceKm(Math.round(dist * 10.0) / 10.0);
                    }
                    return response;
                })
                .sorted(Comparator.comparingDouble(
                        r -> r.getDistanceKm() != null ? r.getDistanceKm() : Double.MAX_VALUE))
                .collect(Collectors.toList());
    }

    // ── Lấy tất cả bài tìm đối thủ ───────────────────────
    @Transactional(readOnly = true)
    public List<SportPostResponse> getRivalPosts(
            Double userLat, Double userLng, Double radiusKm) {

        List<SportPost> posts = postRepository
                .findByStatusAndPostType(PostStatus.open, PostType.find_rival);

        return posts.stream()
                .map(post -> {
                    SportPostResponse response = postMapper.toResponse(post);
                    if (userLat != null && userLng != null && post.getLocationLat() != null && post.getLocationLng() != null) {
                        double dist = calculateDistance(
                                userLat, userLng,
                                post.getLocationLat().doubleValue(),
                                post.getLocationLng().doubleValue()
                        );
                        response.setDistanceKm(Math.round(dist * 10.0) / 10.0);
                    }
                    return response;
                })
                .sorted(Comparator.comparingDouble(
                        r -> r.getDistanceKm() != null ? r.getDistanceKm() : Double.MAX_VALUE))
                .collect(Collectors.toList());
    }


}