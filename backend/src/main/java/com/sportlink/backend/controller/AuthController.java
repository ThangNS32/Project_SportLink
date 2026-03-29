package com.sportlink.backend.controller;

import com.nimbusds.jose.JOSEException;
import com.sportlink.backend.dto.request.*;
import com.sportlink.backend.dto.response.*;
import com.sportlink.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {

    AuthService authService;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @RequestBody @Valid RegisterRequest request) {

        return ResponseEntity.ok(
                ApiResponse.<AuthResponse>builder()
                        .message("Đăng ký thành công")
                        .result(authService.register(request))
                        .build()
        );
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @RequestBody @Valid LoginRequest request) {

        return ResponseEntity.ok(
                ApiResponse.<AuthResponse>builder()
                        .message("Đăng nhập thành công")
                        .result(authService.login(request))
                        .build()
        );
    }

    // POST /api/auth/introspect
    @PostMapping("/introspect")
    public ResponseEntity<ApiResponse<IntrospectResponse>> introspect(
            @RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {

        return ResponseEntity.ok(
                ApiResponse.<IntrospectResponse>builder()
                        .result(authService.introspect(request))
                        .build()
        );
    }

    // POST /api/auth/logout
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody LogoutRequest request)
            throws ParseException, JOSEException {

        authService.logout(request);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .message("Đăng xuất thành công")
                        .build()
        );
    }

    // POST /api/auth/refresh
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @RequestBody RefreshRequest request)
            throws ParseException, JOSEException {

        return ResponseEntity.ok(
                ApiResponse.<AuthResponse>builder()
                        .message("Làm mới token thành công")
                        .result(authService.refreshToken(request))
                        .build()
        );
    }

    // POST /api/auth/google
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> loginWithGoogle(
            @RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<AuthResponse>builder()
                        .message("Đăng nhập Google thành công")
                        .result(authService.loginWithGoogle(request.getCode()))
                        .build()
        );
    }
}
