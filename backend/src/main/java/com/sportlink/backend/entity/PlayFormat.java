package com.sportlink.backend.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum PlayFormat {
    don_nam,
    don_nu,
    doi_nam,
    doi_nu,
    doi_nam_nu;

    @JsonCreator
    public static PlayFormat fromString(String value) {
        return valueOf(value.toLowerCase());
    }
}
