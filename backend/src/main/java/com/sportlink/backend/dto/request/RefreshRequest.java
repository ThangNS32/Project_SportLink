package com.sportlink.backend.dto.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshRequest {
    private String token;
}
