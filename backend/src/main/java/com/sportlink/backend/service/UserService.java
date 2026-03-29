package com.sportlink.backend.service;

import com.sportlink.backend.dto.request.AdminCreateUserRequest;
import com.sportlink.backend.dto.request.UpdateProfileRequest;
import com.sportlink.backend.dto.response.UserResponse;
import com.sportlink.backend.entity.User;
import com.sportlink.backend.exception.AppException;
import com.sportlink.backend.exception.ErrorCode;
import com.sportlink.backend.mapper.UserMapper;
import com.sportlink.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {

    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;

    // ── Lấy thông tin user đang đăng nhập ─────────────────
    public UserResponse getMyInfo() {
        String email = getCurrentEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        log.info("Getting info for user: {}", email);
        return userMapper.toUserResponse(user);
    }

    // ── Lấy thông tin user theo ID ────────────────────────
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return userMapper.toUserResponse(user);
    }

    // ── Cập nhật profile ──────────────────────────────────
    public UserResponse updateProfile(UpdateProfileRequest request) {
        String email = getCurrentEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // MapStruct update các field không null
        userMapper.updateUser(user, request);

        // Nếu có đổi password thì mã hoá lại
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        user = userRepository.save(user);
        log.info("Profile updated for user: {}", email);
        return userMapper.toUserResponse(user);
    }

    // ── Cập nhật vị trí GPS ───────────────────────────────
    public void updateLocation(Double lat, Double lng) {
        String email = getCurrentEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setLocationLat(new java.math.BigDecimal(lat));
        user.setLocationLng(new java.math.BigDecimal(lng));

        userRepository.save(user);
        log.info("Location updated for user: {}", email);
    }

    // ── ADMIN: Lấy danh sách tất cả user ──────────────────
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public List<UserResponse> getAllUsers() {
        log.info("Admin getting all users");
        return userMapper.toUserResponseList(
                userRepository.findByRole(User.Role.user)
        );
    }

    // ── ADMIN: Tìm kiếm user theo tên ─────────────────────
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public List<UserResponse> searchUsers(String fullName) {
        return userMapper.toUserResponseList(
                userRepository.findByFullNameContainingIgnoreCase(fullName)
        );
    }

    // ── ADMIN: Khoá tài khoản vĩnh viễn ───────────────────
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public void disableUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setIsActive(false);
        userRepository.save(user);
        log.warn("Admin disabled user: {}", userId);
    }

    // ── ADMIN: Mở khoá tài khoản ──────────────────────────
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public void enableUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setIsActive(true);
        user.setBanUntil(null);
        userRepository.save(user);
        log.info("Admin enabled user: {}", userId);
    }

    // ── ADMIN: Xoá tài khoản ──────────────────────────────
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        userRepository.delete(user);
        log.warn("Admin deleted user: {}", userId);
    }

    // ── Khoá tài khoản 7 ngày (RatingService gọi) ─────────
    public void banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setBanUntil(LocalDateTime.now().plusDays(7));
        user.setIsActive(false);
        userRepository.save(user);
        log.warn("User banned for 7 days: {}", userId);
    }

    // ── Cập nhật trust score sau khi bị đánh giá ──────────
    public void updateTrustScore(Long userId, int newStars) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Tính lại điểm trung bình
        int totalRating = user.getTotalRating();
        double currentScore = user.getTrustScore() != null
                ? user.getTrustScore().doubleValue() : 5.0;

        double newScore = ((currentScore * totalRating) + newStars)
                / (totalRating + 1);

        // Làm tròn 1 chữ số thập phân
        newScore = Math.round(newScore * 10.0) / 10.0;

        user.setTrustScore(new java.math.BigDecimal(newScore));
        user.setTotalRating(totalRating + 1);

        userRepository.save(user);
        log.info("Trust score updated for user {}: {} → {}", userId, currentScore, newScore);
    }

    // ── Private: Lấy email từ SecurityContext ──────────────
    private String getCurrentEmail() {
        var authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return authentication.getName();
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public UserResponse adminCreateUser(AdminCreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User.Role role = User.Role.user; // Default là user
        if ("admin".equalsIgnoreCase(request.getRole())) {
            role = User.Role.admin;
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .authProvider(User.AuthProvider.local)
                .role(role)
                .build();

        user = userRepository.save(user);
        log.info("Admin created user: {}", user.getEmail());
        return userMapper.toUserResponse(user);
    }
}
