package com.sportlink.backend.dto.response;

import lombok.*;
import java.util.List;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class ChatbotResponse {
    private String message;
    private List<SportPostResponse> posts;
}