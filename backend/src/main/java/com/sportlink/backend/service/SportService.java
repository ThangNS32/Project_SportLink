package com.sportlink.backend.service;

import com.sportlink.backend.dto.request.AddUserSportRequest;
import com.sportlink.backend.dto.request.UpdateFavoriteSportsRequest;
import com.sportlink.backend.dto.response.UserSportResponse;
import com.sportlink.backend.entity.SkillLevel;
import com.sportlink.backend.entity.Sport;
import com.sportlink.backend.entity.SportType;
import com.sportlink.backend.entity.User;
import com.sportlink.backend.exception.AppException;
import com.sportlink.backend.exception.ErrorCode;
import com.sportlink.backend.mapper.UserMapper;
import com.sportlink.backend.repository.SportRepository;
import com.sportlink.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SportService {

    SportRepository sportRepository;
    UserRepository userRepository;
    UserMapper userMapper;

    // ── Lấy danh sách môn thể thao của tôi ────────────────
    public List<UserSportResponse> getMyFavoriteSports() {
        User user = getCurrentUser();
        return sportRepository.findByUser(user)
                .stream()
                .map(userMapper::toUserSportResponse)
                .toList();
    }

    // ── Lấy danh sách môn thể thao của user khác ──────────
    public List<UserSportResponse> getUserSports(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return sportRepository.findByUser(user)
                .stream()
                .map(userMapper::toUserSportResponse)
                .toList();
    }

    // ── Thêm môn thể thao yêu thích ───────────────────────
    @Transactional
    public UserSportResponse addFavoriteSport(AddUserSportRequest request) {
        User user = getCurrentUser();

        if (sportRepository.existsByUserAndSportType(user, request.getSportType())) {
            throw new AppException(ErrorCode.SPORT_ALREADY_ADDED);
        }

        Sport sport = Sport.builder()
                .user(user)
                .sportType(request.getSportType())
                .skillLevel(request.getSkillLevel())
                .build();

        sport = sportRepository.save(sport);
        log.info("User {} added sport: {} ({})", user.getEmail(), sport.getSportType(), sport.getSkillLevel());
        return userMapper.toUserSportResponse(sport);
    }

    // ── Cập nhật trình độ của một môn thể thao ────────────
    @Transactional
    public UserSportResponse updateSkillLevel(SportType sportType, SkillLevel skillLevel) {
        User user = getCurrentUser();

        Sport sport = sportRepository.findByUserAndSportType(user, sportType)
                .orElseThrow(() -> new AppException(ErrorCode.SPORT_NOT_IN_FAVORITES));

        sport.setSkillLevel(skillLevel);
        sport = sportRepository.save(sport);
        log.info("User {} updated skill level for {}: {}", user.getEmail(), sportType, skillLevel);
        return userMapper.toUserSportResponse(sport);
    }

    // ── Xoá môn thể thao yêu thích ────────────────────────
    @Transactional
    public void removeFavoriteSport(SportType sportType) {
        User user = getCurrentUser();

        if (!sportRepository.existsByUserAndSportType(user, sportType)) {
            throw new AppException(ErrorCode.SPORT_NOT_IN_FAVORITES);
        }

        sportRepository.deleteByUserAndSportType(user, sportType);
        log.info("User {} removed sport: {}", user.getEmail(), sportType);
    }

    // ── Private helper ─────────────────────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    public List<UserSportResponse> replaceAllSports(UpdateFavoriteSportsRequest request) {
        User user = getCurrentUser();

        //Xoá tất cả môn hiện tại
        sportRepository.deleteAllByUser(user);

        // Thêm danh sách môn mới
        List<Sport> newSports = request.getSports().stream()
                .map(s -> Sport.builder()
                        .user(user)
                        .sportType(s.getSportType())
                        .skillLevel(s.getSkillLevel())
                        .build())
                .collect(Collectors.toList());

        sportRepository.saveAll(newSports);

        log.info("User {} replaced sports: {}", user.getEmail(),
                newSports.stream().map(s -> s.getSportType().name()).toList());

        return newSports.stream()
                .map(userMapper::toUserSportResponse)
                .collect(Collectors.toList());
    }
}
