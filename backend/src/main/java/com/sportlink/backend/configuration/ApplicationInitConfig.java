package com.sportlink.backend.configuration;


import com.sportlink.backend.entity.User;
import com.sportlink.backend.repository.UserRepository;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository) {
        return args -> {
            // Tự động tạo tài khoản admin mặc định khi chạy lần đầu
            if (userRepository.findByEmail("admin@sportlink.com").isEmpty()) {

                User admin = User.builder()
                        .fullName("Admin SportLink")
                        .email("admin@sportlink.com")
                        .password(passwordEncoder.encode("admin123"))
                        .authProvider(User.AuthProvider.local)
                        .role(User.Role.admin)
                        .isActive(true)
                        .build();

                userRepository.save(admin);
                log.warn("Tài khoản admin đã được tạo: admin@sportlink.com / admin123 — Hãy đổi mật khẩu ngay!");
            }
        };
    }
}
