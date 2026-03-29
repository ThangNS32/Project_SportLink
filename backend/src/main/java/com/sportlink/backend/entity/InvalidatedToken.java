package com.sportlink.backend.entity;


import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "invalidated_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvalidatedToken {

    @Id
    private String id; // JWT ID (jti)

    @Column(name = "expiry_time", nullable = false)
    private Date expiryTime;
}
