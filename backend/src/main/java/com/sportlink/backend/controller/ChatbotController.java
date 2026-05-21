package com.sportlink.backend.controller;

import com.sportlink.backend.dto.request.ChatbotRequest;
import com.sportlink.backend.dto.response.ChatbotResponse;
import com.sportlink.backend.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping
    public ChatbotResponse chat(@RequestBody ChatbotRequest request) {
        return chatbotService.chat(request.getMessage(), request.getUserLat(), request.getUserLng());
    }
}