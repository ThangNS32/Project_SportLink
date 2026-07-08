package com.sportlink.backend.repository;

import com.sportlink.backend.entity.JoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {

    // Kiểm tra user đã gửi request cho bài này chưa
    // Dùng để chặn spam — không cho gửi request 2 lần cùng 1 bài
    boolean existsByPost_PostIdAndRequester_UserId(Long postId, Long requesterId);

    // Lấy tất cả conversations của user
    // Dùng @Query vì điều kiện OR phức tạp — tên method sẽ quá dài
    // :userId xuất hiện 2 lần: là requester HOẶC là chủ bài
    @Query("SELECT r FROM JoinRequest r " +
            "WHERE r.requester.userId = :userId " +
            "   OR r.post.user.userId = :userId " +
            "ORDER BY r.createdAt DESC")
    List<JoinRequest> findMyConversations(@Param("userId") Long userId);

    // Tìm request theo ID và chủ bài — dùng khi accept/reject
    // Mục đích: đảm bảo chỉ đúng chủ bài mới được accept/reject
    // Nếu requestId không thuộc bài của ownerId → trả về empty → throw lỗi
    Optional<JoinRequest> findByRequestIdAndPost_User_UserId(Long requestId, Long ownerId);

    void deleteByPost_PostId(Long postId);

    List<JoinRequest> findByPost_PostId(Long postId);
}