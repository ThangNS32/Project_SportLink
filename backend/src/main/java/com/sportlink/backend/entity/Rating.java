package com.sportlink.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ratings")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rating_id")
    Long ratingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rater_id", nullable = false)
    User rater;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rated_id", nullable = false)
    User rated;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    JoinRequest request;

    @Column(name = "stars", nullable = false)
    Integer stars;

    @ElementCollection
    @CollectionTable(
            name = "rating_tags",
            joinColumns = @JoinColumn(name = "rating_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "tag")
    List<RatingTag> tags;

    @Column(name = "is_revealed", nullable = false)
    Boolean isRevealed;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (isRevealed == null) isRevealed = false;
        if (createdAt == null)  createdAt  = LocalDateTime.now();
    }
}