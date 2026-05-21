package com.sportlink.backend.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum SkillLevel {
    beginner,
    intermediate,
    advanced;

    @JsonCreator
    public static SkillLevel fromString(String value) {
        return valueOf(value.toLowerCase());
    }
}

