package com.sportlink.backend.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name = "sport_posts")
@Getter @Setter @Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SportPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    Long postId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(name = "team_name", nullable = false, length = 100)
    String teamName;

    @Enumerated(EnumType.STRING)
    @Column(name = "sport_type", nullable = false)
    SportType sportType;

    @Enumerated(EnumType.STRING)
    @Column(name = "post_type", nullable = false)
    PostType postType;

    @Column(name = "play_time", nullable = false)
    LocalDateTime playTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_level")
    SkillLevel skillLevel;

    @Column(name = "location_name", nullable = false, length = 255)
    String locationName;

    @Column(name = "location_lat", nullable = false, precision = 10, scale = 8)
    BigDecimal locationLat;

    @Column(name = "location_lng", nullable = false, precision = 11, scale = 8)
    BigDecimal locationLng;

    @Column(name = "slots_total", nullable = false)
    Integer slotsTotal;

    @Column(name = "slots_filled", nullable = false)
    Integer slotsFilled;

    @Enumerated(EnumType.STRING)
    @Column(name = "play_format")   // NULL = bóng đá
    PlayFormat playFormat;

    @Column(name = "note", columnDefinition = "TEXT")
    String note;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    PostStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (status == null)      status      = PostStatus.open;
        if (slotsFilled == null) slotsFilled = 0;
        if (createdAt == null)   createdAt   = LocalDateTime.now();
    }
}
