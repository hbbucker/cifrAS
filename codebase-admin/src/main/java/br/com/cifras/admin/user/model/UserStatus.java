package br.com.cifras.admin.user.model;

public enum UserStatus {
    ACTIVE,
    BLOCKED;

    public static UserStatus fromString(String value) {
        if (value == null || value.isBlank()) return ACTIVE;
        try {
            return UserStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ACTIVE;
        }
    }
}
