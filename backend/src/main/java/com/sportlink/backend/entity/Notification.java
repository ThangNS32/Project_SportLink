package com.sportlink.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notif_id")
    Long notifId;

    // Người NHẬN thông báo — @ManyToOne vì 1 user có thể có nhiều thông báo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    NotificationType type;

    // refId = requestId — frontend dùng cái này để navigate đến /chat/req_{refId}
    @Column(name = "ref_id")
    Long refId;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    String content;

    // false = chưa đọc (hiện badge đỏ), true = đã đọc
    @Column(name = "is_read", nullable = false)
    Boolean isRead;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (isRead == null)    isRead    = false;
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}