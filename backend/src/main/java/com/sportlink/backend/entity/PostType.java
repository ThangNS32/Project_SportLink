package com.sportlink.backend.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum PostType {
    find_team, find_rival;

    @JsonCreator
    public static PostType fromString(String value) {
        return valueOf(value.toLowerCase());
    }
}
