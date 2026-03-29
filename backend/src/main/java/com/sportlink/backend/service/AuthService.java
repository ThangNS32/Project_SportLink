package com.sportlink.backend.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.*;
import com.nimbusds.jwt.*;
import com.sportlink.backend.dto.request.*;
import com.sportlink.backend.dto.response.*;
import com.sportlink.backend.entity.*;
import com.sportlink.backend.exception.*;
import com.sportlink.backend.repository.*;
import lombok.*;
import lombok.experimental.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthService {

    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    InvalidatedTokenRepository invalidatedTokenRepository;
    GoogleAuthService googleAuthService;

    @NonFinal
    @Value("${jwt.signer-key}")
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION;

    // ── ĐĂNG KÝ ───────────────────────────────────────────
    public AuthResponse register(RegisterRequest request) {

        // Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // Tạo user mới
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .authProvider(User.AuthProvider.local)
                .build();

        // @PrePersist tự set: role=user, isActive=true, trustScore=5.0...
        user = userRepository.save(user);
        log.info("User registered: {}", user.getEmail());

        // Trả về token luôn sau khi đăng ký (không cần đăng nhập lại)
        return buildAuthResponse(user);
    }

    // ── ĐĂNG NHẬP ─────────────────────────────────────────
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Kiểm tra tài khoản bị khoá không
        if (user.getBanUntil() != null &&
                user.getBanUntil().isAfter(java.time.LocalDateTime.now())) {
            throw new AppException(ErrorCode.ACCOUNT_BANNED);
        }

        // Kiểm tra tài khoản active không
        if (!user.getIsActive()) {
            throw new AppException(ErrorCode.ACCOUNT_DISABLED);
        }

        // Kiểm tra password
        boolean matched = passwordEncoder.matches(
                request.getPassword(), user.getPassword()
        );
        if (!matched) {
            throw new AppException(ErrorCode.WRONG_PASSWORD);
        }

        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(user);
    }

    // ── INTROSPECT (Kiểm tra token hợp lệ) ───────────────
    public IntrospectResponse introspect(IntrospectRequest request)
            throws JOSEException, ParseException {
        boolean isValid = true;
        try {
            verifyToken(request.getToken(), false);
        } catch (AppException e) {
            isValid = false;
        }
        return IntrospectResponse.builder().valid(isValid).build();
    }

    // ── LOGOUT ────────────────────────────────────────────
    public void logout(LogoutRequest request)
            throws ParseException, JOSEException {
        try {
            var signedJWT = verifyToken(request.getToken(), true);
            String jti = signedJWT.getJWTClaimsSet().getJWTID();
            Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

            // Lưu token vào blacklist
            invalidatedTokenRepository.save(
                    InvalidatedToken.builder()
                            .id(jti)
                            .expiryTime(expiryTime)
                            .build()
            );
            log.info("User logged out, token blacklisted: {}", jti);
        } catch (AppException e) {
            log.info("Token already expired, logout anyway");
        }
    }

    // ── REFRESH TOKEN ─────────────────────────────────────
    public AuthResponse refreshToken(RefreshRequest request)
            throws ParseException, JOSEException {

        var signedJWT = verifyToken(request.getToken(), true);

        // Blacklist token cũ
        invalidatedTokenRepository.save(
                InvalidatedToken.builder()
                        .id(signedJWT.getJWTClaimsSet().getJWTID())
                        .expiryTime(signedJWT.getJWTClaimsSet().getExpirationTime())
                        .build()
        );

        // Tạo token mới
        String email = signedJWT.getJWTClaimsSet().getSubject();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return buildAuthResponse(user);
    }

    // ── PRIVATE: Tạo JWT token ────────────────────────────
    private String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issuer("sportlink.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now()
                                .plus(VALID_DURATION, ChronoUnit.SECONDS)
                                .toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("userId", user.getUserId())
                .claim("scope", "SCOPE_" + user.getRole().name().toUpperCase())
                .build();

        JWSObject jwsObject = new JWSObject(header, new Payload(claimsSet.toJSONObject()));

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }

    // ── PRIVATE: Verify token ─────────────────────────────
    private SignedJWT verifyToken(String token, boolean isRefresh)
            throws JOSEException, ParseException {

        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = isRefresh
                ? new Date(signedJWT.getJWTClaimsSet().getIssueTime()
                .toInstant()
                .plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS)
                .toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        boolean verified = signedJWT.verify(verifier);

        if (!verified || !expiryTime.after(new Date())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // Kiểm tra token đã bị blacklist chưa (logout rồi)
        if (invalidatedTokenRepository.existsById(
                signedJWT.getJWTClaimsSet().getJWTID())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return signedJWT;
    }

    // ── PRIVATE: Build response sau login/register ────────
    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.builder()
                .token(generateToken(user))
                .authenticated(true)
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .trustScore(user.getTrustScore() != null
                        ? user.getTrustScore().doubleValue() : 5.0)
                .build();
    }

    // ── ĐĂNG NHẬP GOOGLE ──────────────────────────────────
    public AuthResponse loginWithGoogle(String code) {

        // Bước 1: Đổi code → access token
        String accessToken = googleAuthService.getAccessToken(code);

        // Bước 2: Lấy thông tin user từ Google
        GoogleUserInfo googleUser = googleAuthService.getUserInfo(accessToken);

        if (!Boolean.TRUE.equals(googleUser.getEmailVerified())) {
            throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED);
        }

        // Bước 3: Kiểm tra email đã có trong DB chưa
        User user = userRepository.findByEmail(googleUser.getEmail())
                .orElse(null);

        if (user == null) {
            // Chưa có → Tạo user mới
            user = User.builder()
                    .fullName(googleUser.getFullName())
                    .email(googleUser.getEmail())
                    .googleId(googleUser.getSub())
                    .avatarUrl(googleUser.getAvatarUrl())
                    .authProvider(User.AuthProvider.google)
                    // Password = null vì đăng nhập Google
                    .build();

            user = userRepository.save(user);
            log.info("New user created via Google: {}", user.getEmail());

        } else {

            // Kiểm tra tài khoản bị khoá không
            if (user.getBanUntil() != null &&
                    user.getBanUntil().isAfter(LocalDateTime.now())) {
                throw new AppException(ErrorCode.ACCOUNT_BANNED);
            }

            if (!user.getIsActive()) {
                throw new AppException(ErrorCode.ACCOUNT_DISABLED);
            }

            // Đã có → Cập nhật googleId nếu chưa có
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleUser.getSub());
                user.setAuthProvider(User.AuthProvider.google);
                user = userRepository.save(user);
            }

            log.info("Existing user logged in via Google: {}", user.getEmail());
        }

        return buildAuthResponse(user);
    }
}
