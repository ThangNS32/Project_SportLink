package com.sportlink.backend.repository;

import com.sportlink.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SportPostRepository extends JpaRepository<SportPost, Long> {

    List<SportPost> findByStatus(PostStatus status);

    List<SportPost> findByStatusAndSportType(PostStatus status, SportType sportType);

    List<SportPost> findByStatusAndSportTypeAndPostType(
            PostStatus status, SportType sportType, PostType postType);

    List<SportPost> findByUser(User user);

    // Dùng cho Scheduler auto-expire
    List<SportPost> findByStatusAndPlayTimeBefore(PostStatus status, LocalDateTime time);

    List<SportPost> findByStatusAndSportTypeIn(PostStatus status, List<SportType> sportTypes);

    List<SportPost> findByStatusAndPostType(PostStatus status, PostType postType);

    List<SportPost> findByUser_UserIdAndStatus(Long userId, PostStatus status);

    List<SportPost> findByStatusInAndPlayTimeBefore(List<PostStatus> statuses, LocalDateTime time);

    List<SportPost> findByStatusInAndPlayTimeBetween(
            List<PostStatus> statuses,
            LocalDateTime start,
            LocalDateTime end
    );
}

