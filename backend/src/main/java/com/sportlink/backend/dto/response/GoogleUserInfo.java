package com.sportlink.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GoogleUserInfo {

    String sub;       // Google ID duy nhất

    String email;

    @JsonProperty("name")
    String fullName;

    @JsonProperty("picture")
    String avatarUrl;

    @JsonProperty("email_verified")
    Boolean emailVerified;
}
