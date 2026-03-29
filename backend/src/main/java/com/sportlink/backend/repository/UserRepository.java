package com.sportlink.backend.repository;

import com.sportlink.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Đăng nhập / Đăng ký
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByGoogleId(String googleId);

    // Admin
    List<User> findByRole(User.Role role);
    List<User> findByFullNameContainingIgnoreCase(String fullName);

    @Query("SELECT u FROM User u WHERE u.banUntil IS NOT NULL AND u.banUntil > CURRENT_TIMESTAMP")
    List<User> findBannedUsers();

    @Query("SELECT u FROM User u WHERE u.banUntil IS NOT NULL AND u.banUntil <= CURRENT_TIMESTAMP")
    List<User> findUsersWithExpiredBan();
}