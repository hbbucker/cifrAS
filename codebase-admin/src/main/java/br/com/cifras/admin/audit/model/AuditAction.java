package br.com.cifras.admin.audit.model;

public enum AuditAction {
    BLOCK,
    UNBLOCK;

    public static AuditAction fromString(String value) {
        if (value == null) throw new IllegalArgumentException("AuditAction cannot be null");
        return AuditAction.valueOf(value.trim().toUpperCase());
    }
}
