package br.com.cifras.user.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Language {
    PT_BR("pt-BR"),
    EN_US("en-US"),
    ES("es");

    private final String value;

    Language(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static Language fromString(String text) {
        if (text == null) return null;
        for (Language b : Language.values()) {
            if (b.value.equalsIgnoreCase(text)) {
                return b;
            }
        }
        throw new IllegalArgumentException("Idioma inválido: " + text);
    }
}
