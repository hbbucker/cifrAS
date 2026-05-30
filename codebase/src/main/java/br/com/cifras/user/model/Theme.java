package br.com.cifras.user.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Theme {
    LIGHT("light"),
    DARK("dark");

    private final String value;

    Theme(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static Theme fromString(String text) {
        if (text == null) return null;
        for (Theme b : Theme.values()) {
            if (b.value.equalsIgnoreCase(text)) {
                return b;
            }
        }
        throw new IllegalArgumentException("Tema inválido: " + text);
    }
}
