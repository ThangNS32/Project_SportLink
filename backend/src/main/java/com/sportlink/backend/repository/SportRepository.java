package com.sportlink.backend.repository;

import com.sportlink.backend.entity.Sport;
import org.springframework.data.jpa.repository.JpaRepository;

import com.sportlink.backend.entity.SportType;
import com.sportlink.backend.entity.User;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface SportRepository extends JpaRepository<Sport, Long> {

    List<Sport> findByUser(User user);

    Optional<Sport> findByUserAndSportType(User user, SportType sportType);

    boolean existsByUserAndSportType(User user, SportType sportType);

    void deleteByUserAndSportType(User user, SportType sportType);

    @Transactional
    void deleteAllByUser(User user);
}


