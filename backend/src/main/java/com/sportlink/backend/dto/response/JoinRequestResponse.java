package com.sportlink.backend.dto.response;

import com.sportlink.backend.entity.RequestStatus;
import com.sportlink.backend.entity.RequestType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JoinRequestResponse {

    Long requestId;       // dùng để tạo conversationId = "req_{requestId}"

    // Thông tin bài đăng — ChatPage cần để tạo Firestore document
    Long postId;
    String postTitle;     // teamName của bài
    String postType;      // "find_team" hoặc "find_rival"
    LocalDateTime postPlayTime;

    // Thông tin người gửi request
    Long requesterId;
    String requesterName;
    String requesterAvatar;

    // Thông tin chủ bài
    Long ownerId;
    String ownerName;
    String ownerAvatar;

    RequestType requestType;   // join hoặc challenge
    RequestStatus status;      // pending / accepted / rejected
    String message;            // "Tôi muốn tham gia" / "Tôi muốn giao hữu"
    LocalDateTime createdAt;
}