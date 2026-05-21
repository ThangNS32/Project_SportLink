package com.sportlink.backend.scheduler;

import com.sportlink.backend.entity.PostStatus;
import com.sportlink.backend.repository.SportPostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PostScheduler {

    final SportPostRepository postRepository;

    // Chạy mỗi phút
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void expireOldPosts() {
        var expiredPosts = postRepository.findByStatusInAndPlayTimeBefore(
                List.of(PostStatus.open, PostStatus.matched, PostStatus.full),
                LocalDateTime.now());

        if (!expiredPosts.isEmpty()) {
            expiredPosts.forEach(post -> post.setStatus(PostStatus.expired));
            postRepository.saveAll(expiredPosts);
            log.info("Auto-expired {} posts", expiredPosts.size());
        }
    }
}
