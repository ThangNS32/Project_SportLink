package com.sportlink.backend.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotRequest {
    private String message;
    private Double userLat;
    private Double userLng;
}