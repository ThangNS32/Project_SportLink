package com.sportlink.backend.dto.response;

import com.sportlink.backend.entity.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {

    Long notifId;
    NotificationType type;

    // refId = requestId — frontend dùng để navigate: /chat/req_{refId}
    Long refId;

    String content;      // "A muốn tham gia Bài X"
    Boolean isRead;
    LocalDateTime createdAt;
}