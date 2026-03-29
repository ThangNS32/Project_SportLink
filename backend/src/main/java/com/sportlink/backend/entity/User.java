package com.sportlink.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    Long userId;

    @Column(name = "full_name", nullable = false, length = 100)
    String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    String email;

    @Column(name = "google_id", unique = true, length = 100)
    String googleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false)
    AuthProvider authProvider;

    @Column(name = "password")
    String password;

    @Column(name = "avatar_url", length = 255)
    String avatarUrl;

    @Column(name = "age")
    Integer age;

    @Column(name = "location_lat", precision = 10, scale = 8)
    BigDecimal locationLat;

    @Column(name = "location_lng", precision = 11, scale = 8)
    BigDecimal locationLng;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    Role role;

    @Column(name = "is_active", nullable = false)
    Boolean isActive;

    @Column(name = "trust_score", precision = 2, scale = 1)
    BigDecimal trustScore;

    @Column(name = "ban_until")
    LocalDateTime banUntil;

    @Column(name = "total_rating", nullable = false)
    Integer totalRating;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    public enum AuthProvider {
        local, google
    }

    public enum Role {
        user, admin
    }

    @PrePersist
    public void prePersist() {
        if (role == null)         role         = Role.user;
        if (isActive == null)     isActive     = true;
        if (trustScore == null)   trustScore   = BigDecimal.valueOf(5.0);
        if (totalRating == null)  totalRating  = 0;
        if (createdAt == null)    createdAt    = LocalDateTime.now();
        if (authProvider == null) authProvider = AuthProvider.local;
    }
}
