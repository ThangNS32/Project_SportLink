package com.sportlink.backend.repository;

import com.sportlink.backend.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    boolean existsByRater_UserIdAndRequest_RequestId(Long raterId, Long requestId);

    List<Rating> findByRequest_RequestIdAndIsRevealedFalse(Long requestId);

    @Query("""
        SELECT AVG(r.stars) FROM Rating r
        WHERE r.rated.userId = :userId
        AND r.isRevealed = true
     """)
    Optional<Double> findAvgStarsByRatedUserId(@Param("userId") Long userId);

    @Query("""
        SELECT COUNT(r) FROM Rating r
        WHERE r.rated.userId = :userId
        AND r.isRevealed = true
    """)
    long countRevealedByRatedUserId(@Param("userId") Long userId);

    @Query("""                                                                                                                                                           
         SELECT r FROM Rating r
         WHERE r.isRevealed = false
         AND r.request.post.playTime < :cutoff
    """)
    List<Rating> findRevealableRatings(@Param("cutoff") LocalDateTime cutoff);

    List<Rating> findByRated_UserIdAndIsRevealedTrue(Long userId);

}