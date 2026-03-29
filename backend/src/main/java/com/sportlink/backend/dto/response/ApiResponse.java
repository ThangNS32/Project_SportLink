package com.sportlink.backend.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // Không trả về field null
public class ApiResponse<T> {
    @Builder.Default
    private int code = 200;
    private String message;
    private T result;
}
