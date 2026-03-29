package com.sportlink.backend.service;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.sportlink.backend.dto.response.GoogleUserInfo;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class GoogleAuthService {

    @Value("${google.client-id}")
    String clientId;

    @Value("${google.client-secret}")
    String clientSecret;

    @Value("${google.redirect-uri}")
    String redirectUri;

    @Value("${google.token-url}")
    String tokenUrl;

    @Value("${google.user-info-url}")
    String userInfoUrl;

    final RestTemplate restTemplate = new RestTemplate();
    final ObjectMapper objectMapper = new ObjectMapper();

    // ── Đổi Authorization Code → Access Token ─────────────
    public String getAccessToken(String code) {
        // 1. Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // 2. Body (là cái params này)
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code",          code);
        params.add("client_id",     clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri",  redirectUri);
        params.add("grant_type",    "authorization_code");

        // 3. Đóng gói lại thành 1 HTTP request
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            // 4. Gửi đi                                //Phương thức: POST
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);

            if (response.getBody() == null) {
                throw new RuntimeException("Không lấy được access token từ Google");
            }

            String accessToken = (String) response.getBody().get("access_token");
            log.info("Got access token from Google successfully");
            return accessToken;

        } catch (Exception e) {
            log.error("Error getting access token from Google: {}", e.getMessage());
            throw new RuntimeException("Lỗi xác thực Google: " + e.getMessage());
        }
    }

    // ── Dùng Access Token lấy thông tin user từ Google ────
    public GoogleUserInfo getUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<GoogleUserInfo> response = restTemplate.exchange(
                    userInfoUrl,
                    HttpMethod.GET,
                    request,
                    GoogleUserInfo.class
            );

            if (response.getBody() == null) {
                throw new RuntimeException("Không lấy được thông tin user từ Google");
            }

            log.info("Got user info from Google: {}", response.getBody().getEmail());
            return response.getBody();

        } catch (Exception e) {
            log.error("Error getting user info from Google: {}", e.getMessage());
            throw new RuntimeException("Lỗi lấy thông tin Google: " + e.getMessage());
        }
    }
}