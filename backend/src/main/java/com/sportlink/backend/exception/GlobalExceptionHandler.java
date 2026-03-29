package com.sportlink.backend.exception;

import com.sportlink.backend.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;

import java.io.IOException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ── Bỏ qua lỗi SSE (giữ từ Planify) ──────────────────
    @ExceptionHandler({
            IOException.class,
            IllegalStateException.class,
            AsyncRequestNotUsableException.class
    })
    public void ignoreSseException(Exception ex) {
        // Bỏ qua
    }

    // ── Lỗi Runtime không xác định ────────────────────────
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(
            RuntimeException e) {
        log.error("Unhandled runtime exception: ", e);
        return ResponseEntity.badRequest().body(
                ApiResponse.<Void>builder()
                        .code(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode())
                        .message(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage())
                        .build()
        );
    }

    // ── Lỗi xác thực (chưa đăng nhập) ────────────────────
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(
            AuthenticationException e) {
        log.error("Authentication exception: ", e);
        return ResponseEntity.status(401).body(
                ApiResponse.<Void>builder()
                        .code(ErrorCode.UNAUTHENTICATED.getCode())
                        .message(ErrorCode.UNAUTHENTICATED.getMessage())
                        .build()
        );
    }

    // ── Lỗi phân quyền (không có quyền) ──────────────────
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(
            AccessDeniedException e) {
        log.error("Access denied: ", e);
        return ResponseEntity.status(403).body(
                ApiResponse.<Void>builder()
                        .code(ErrorCode.FORBIDDEN.getCode())
                        .message(ErrorCode.FORBIDDEN.getMessage())
                        .build()
        );
    }

    // ── Lỗi AppException (lỗi nghiệp vụ) ─────────────────
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(
            AppException e) {
        ErrorCode errorCode = e.getErrorCode();
        log.warn("App exception: {} - {}", errorCode.getCode(), errorCode.getMessage());
        return ResponseEntity
                .status(errorCode.getCode() >= 500 ? 500 : 400)
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build()
                );
    }

    // ── Lỗi Validate (@NotBlank, @Email...) ──────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(
            MethodArgumentNotValidException e) {

        // Lấy message của field lỗi đầu tiên
        String enumKey = e.getFieldError() != null
                ? e.getFieldError().getDefaultMessage()
                : "INVALID_KEY";

        ErrorCode errorCode = ErrorCode.INVALID_KEY;

        // Thử map message sang ErrorCode
        try {
            errorCode = ErrorCode.valueOf(enumKey);
        } catch (IllegalArgumentException ex) {
            // Nếu không map được thì dùng message thẳng
            return ResponseEntity.badRequest().body(
                    ApiResponse.<Void>builder()
                            .code(400)
                            .message(enumKey)
                            .build()
            );
        }

        return ResponseEntity.badRequest().body(
                ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build()
        );
    }
}
