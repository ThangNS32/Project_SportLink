package com.sportlink.backend.exception;


import lombok.Getter;

@Getter
public enum ErrorCode {

    // ── General ────────────────────────────────────────────
    UNCATEGORIZED_EXCEPTION(1111, "Lỗi không xác định"),
    INVALID_KEY(1005, "Invalid message key"),
    INVALID_REQUEST(1016, "Yêu cầu không hợp lệ"),

    // ── Auth ───────────────────────────────────────────────
    EMAIL_ALREADY_EXISTS(1001, "Email đã tồn tại"),
    INVALID_PASSWORD(1003, "Mật khẩu phải ít nhất 6 ký tự"),
    USER_NOT_FOUND(1006, "Không tìm thấy người dùng"),
    UNAUTHENTICATED(1007, "Chưa xác thực"),
    UNAUTHORIZED(1011, "Không có quyền truy cập"),
    FORBIDDEN(1009, "Truy cập bị từ chối"),
    WRONG_PASSWORD(1012, "Mật khẩu không đúng"),
    ACCOUNT_BANNED(1013, "Tài khoản đang bị khoá"),
    ACCOUNT_DISABLED(1014, "Tài khoản bị vô hiệu hoá"),
    EMAIL_NOT_VERIFIED(1015, "Email Google chưa được xác minh"),

    // ── Sport Post ─────────────────────────────────────────
    POST_NOT_FOUND(2001, "Không tìm thấy bài đăng"),
    POST_EXPIRED(2002, "Bài đăng đã hết hạn"),
    POST_FULL(2003, "Nhóm đã đủ người"),
    POST_ALREADY_MATCHED(2004, "Bài đăng đã tìm được đối thủ"),
    NOT_POST_OWNER(2005, "Bạn không phải chủ bài đăng"),

    // ── Join Request ───────────────────────────────────────
    REQUEST_NOT_FOUND(3001, "Không tìm thấy yêu cầu"),
    REQUEST_ALREADY_SENT(3002, "Bạn đã gửi yêu cầu trước đó rồi"),
    REQUEST_NOT_PENDING(3003, "Yêu cầu không ở trạng thái chờ duyệt"),
    CANNOT_JOIN_OWN_POST(3004, "Bạn không thể tham gia bài đăng của chính mình"),

    // ── Chat ───────────────────────────────────────────────
    GROUP_NOT_FOUND(4001, "Không tìm thấy nhóm chat"),
    NOT_GROUP_MEMBER(4002, "Bạn không phải thành viên nhóm này"),

    // ── Rating ─────────────────────────────────────────────
    RATING_NOT_ALLOWED(5001, "Chưa đủ điều kiện để đánh giá"),
    ALREADY_RATED(5002, "Bạn đã đánh giá người này rồi"),
    CANNOT_RATE_YOURSELF(5003, "Không thể tự đánh giá bản thân");

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    final int code;
    final String message;
}
