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
        // Fallback to match prefixes (e.g., 'en' matches 'en-US', 'pt' matches 'pt-BR')
        for (Language b : Language.values()) {
            String prefix1 = b.value.split("-")[0];
            String prefix2 = text.split("-")[0];
            if (prefix1.equalsIgnoreCase(prefix2)) {
                return b;
            }
        }
        throw new IllegalArgumentException("Idioma inválido: " + text);
    }
}
