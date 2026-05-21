package com.sportlink.backend.repository;

import com.sportlink.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Lấy thông báo CHƯA ĐỌC của user — dùng cho badge đỏ ở Header
    // isReadFalse → WHERE is_read = false
    List<Notification> findByUser_UserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    // Lấy TẤT CẢ thông báo (đọc + chưa đọc) — dùng cho trang thông báo
    List<Notification> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
}