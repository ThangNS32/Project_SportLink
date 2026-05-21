package com.sportlink.backend.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum SportType {
    bong_da,
    cau_long,
    pickleball;

    @JsonCreator
    public static SportType fromString(String value) {
        return valueOf(value.toLowerCase());
    }
}
