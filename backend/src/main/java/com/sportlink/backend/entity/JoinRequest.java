package com.sportlink.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Entity
@Table(name = "join_requests")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JoinRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    Long requestId;

    // @ManyToOne — nhiều request có thể thuộc về 1 bài đăng
    // FetchType.LAZY — không load bài đăng ngay, chỉ load khi cần (tối ưu hiệu năng)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    SportPost post;

    // @ManyToOne — nhiều request có thể do 1 user gửi
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    User requester;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false)
    RequestType requestType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    RequestStatus status;

    @Column(name = "message", columnDefinition = "TEXT")
    String message;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    // null khi pending, có giá trị khi đã accept/reject
    @Column(name = "responded_at")
    LocalDateTime respondedAt;

    // @PrePersist chạy tự động trước khi INSERT vào DB
    // Đảm bảo status và createdAt luôn có giá trị mặc định
    @PrePersist
    public void prePersist() {
        if (status == null)    status    = RequestStatus.pending;
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
