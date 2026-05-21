package com.sportlink.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sportlink.backend.dto.response.ChatbotResponse;
import com.sportlink.backend.dto.response.SportPostResponse;
import com.sportlink.backend.entity.PostStatus;
import com.sportlink.backend.entity.SportPost;
import com.sportlink.backend.mapper.SportPostMapper;
import com.sportlink.backend.repository.SportPostRepository;
import com.sportlink.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import com.sportlink.backend.entity.User;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    @Value("${deepseek.api.key}")
    private String apiKey;

    @Value("${deepseek.api.url}")
    private String apiUrl;

    @Value("${deepseek.api.model}")
    private String model;

    private final SportPostRepository postRepository;
    private final SportPostMapper sportPostMapper;
    private final RestClient restClient = RestClient.create();
    private final UserRepository userRepository;

    private static final String SYSTEM_PROMPT = """
                Bạn là trợ lý ảo của SportLink — ứng dụng kết nối người chơi thể thao tại Việt Nam.
                Bạn giúp người dùng:
                - Tìm kiếm bài đăng tìm đồng đội hoặc đối thủ theo địa điểm, ngày giờ, môn thể thao, khoảng cách
                - Hiểu cách tham gia, chấp nhận, từ chối lời
                - Giải thích hệ thống điểm uy tín (trust score)
                - Trả lời câu hỏi về các môn thể thao: bóng đá, cầu lông, pickleball
                Khi được cung cấp danh sách bài đăng, hãy lọc và trình bày những bài phù hợp yêu cầu.
                Trả lời ngắn gọn, thân thiện, bằng tiếng Việt.
                Không trả lời các chủ đề không liên quan đến thể thao hoặc app.
                QUAN TRỌNG về JSON output:
                Luôn trả lời theo đúng JSON format sau, không thêm gì ngoài JSON:
                {"message": "câu trả lời thân thiện bằng tiếng Việt", "matchedPostIds": [1, 2, 3]}
                matchedPostIds là danh sách postId của những bài phù hợp yêu cầu, [] nếu không có bài nào.
                TUYỆT ĐỐI KHÔNG viết postId, post id, hay số id của bài trong phần "message".
                SAI: "- postId 30: Trại hè bóng đá lúc 23:00"
                ĐÚNG: "- Trại hè bóng đá lúc 23:00 tại CLB Tennis"
                Khi người dùng hỏi theo quận/huyện (ví dụ: quận Cầu Giấy, quận 1), hãy dùng kiến thức của bạn để xác định những địa điểm nào trong trường 'Địa điểm' thuộc quận/huyện đó, rồi trả về các bài tương ứng.
                QUAN TRỌNG về tìm kiếm theo thời gian:
                - Phải tìm trong TOÀN BỘ danh sách bài đăng, kể cả bài có ngày xa trong tương lai (vài tháng tới).
                - Không được bỏ sót bài đăng chỉ vì ngày chơi còn xa. Người dùng muốn tìm TẤT CẢ bài phù hợp, không chỉ bài sắp tới nhất.
                - Định nghĩa khung giờ (dùng trường 'Giờ:' để lọc):
                  + buổi sáng = 05:00 – 11:00
                  + buổi trưa = 11:00 – 14:00
                  + buổi chiều = 14:00 – 18:00
                  + buổi tối = 18:00 – 23:59
                  + đêm khuya = 00:00 – 05:00
                """;

    public ChatbotResponse chat(String userMessage, Double userLat, Double userLng) {
        // 1. Lấy hết bài đăng upcoming
        List<SportPost> posts = findAllUpcomingPosts();

        // 2. Map sang response + tính distance từng bài
        List<SportPostResponse> postResponses = posts.stream()
                .map(p -> {
                    SportPostResponse r = sportPostMapper.toResponse(p);
                    if (userLat != null && userLng != null) {
                        r.setDistanceKm(calcDistance(
                                userLat, userLng,
                                p.getLocationLat().doubleValue(),
                                p.getLocationLng().doubleValue()
                        ));
                    }
                    return r;
                })
                .toList();

        // 3. Nhét toàn bộ data vào context cho AI
        String context = buildContext(postResponses);

        User currentUser = getCurrentUser();
        String userInfo = String.format("Người dùng hiện tại: %s (userId: %d)",
                currentUser.getFullName(), currentUser.getUserId());

        String enrichedMessage = context.isEmpty()
                ? userMessage
                : userMessage + "\n\nThông tin người dùng: " + userInfo
                + "\nNgày hôm nay: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                + "\n\n--- Danh sách bài đăng hiện có ---\n" + context;

        // 4. Gọi DeepSeek, AI tự lọc theo yêu cầu user
        Map<String, Object> body = Map.of(
                "model", model,
                "max_tokens", 1024,
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_PROMPT),
                        Map.of("role", "user", "content", enrichedMessage)
                )
        );

        Map response = restClient.post()
                .uri(apiUrl + "/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        String content = (String) message.get("content");

        try {
            ObjectMapper mapper = new ObjectMapper();
            String cleaned = content.trim()
                    .replaceAll("^```json\\s*", "")
                    .replaceAll("^```\\s*", "")
                    .replaceAll("```$", "")
                    .trim();
            JsonNode json = mapper.readTree(cleaned);
            String aiText = json.get("message").asText();
            List<Long> matchedIds = mapper.convertValue(
                    json.get("matchedPostIds"),
                    mapper.getTypeFactory().constructCollectionType(List.class, Long.class)
            );
            List<SportPostResponse> filteredPosts = postResponses.stream()
                    .filter(p -> matchedIds.contains(p.getPostId()))
                    .toList();
            return ChatbotResponse.builder()
                    .message(aiText)
                    .posts(filteredPosts)
                    .build();
        } catch (Exception e) {
            return ChatbotResponse.builder()
                    .message(content)
                    .posts(List.of())
                    .build();
        }
    }

    private List<SportPost> findAllUpcomingPosts() {
        return postRepository.findByStatusInAndPlayTimeBetween(
                List.of(PostStatus.open, PostStatus.matched),
                LocalDateTime.now(),
                LocalDate.now().plusDays(365).atTime(23, 59, 59)
        );
    }

    private String buildContext(List<SportPostResponse> posts) {
        if (posts.isEmpty()) return "Hiện không có bài đăng nào sắp tới.";

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");
        StringBuilder sb = new StringBuilder();
        for (SportPostResponse p : posts) {
            String distance = p.getDistanceKm() != null ? p.getDistanceKm() + "km" : "không rõ";
            String city = detectCity(p.getLocationLat(), p.getLocationLng());
            sb.append(String.format(
                    "- postId:%d | [%s] [%s] %s | Thành phố: %s | Địa điểm: %s | Cách bạn: %s | Ngày: %s | Giờ: %s | Trình độ: %s | Slots còn: %d | Người đăng: %s\n",
                    p.getPostId(),
                    p.getSportType(),
                    p.getPostType(),
                    p.getTeamName(),
                    city,
                    p.getLocationName(),
                    distance,
                    p.getPlayTime().format(dateFmt),
                    p.getPlayTime().format(timeFmt),
                    p.getSkillLevel() != null ? p.getSkillLevel() : "N/A",
                    p.getSlotsTotal() - p.getSlotsFilled(),
                    p.getUserFullName()
            ));
        }
        return sb.toString();
    }

    private double calcDistance(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10.0) / 10.0;
    }

    private String detectCity(double lat, double lng) {
        if (lat >= 19.0) return "Hà Nội";
        if (lat >= 14.0) return "miền Trung";
        return "Hồ Chí Minh";
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
    }
}