package br.com.cifras.user.model;

public class UserPreference {
    private String userId;
    private Theme theme;
    private Language language;

    // Construtor fechado para forçar o uso da fábrica
    private UserPreference(String userId, Theme theme, Language language) {
        this.userId = userId;
        this.theme = theme;
        this.language = language;
    }
    
    // Factory para restauração a partir da camada de infraestrutura/repositório
    public static UserPreference restore(String userId, Theme theme, Language language) {
        return new UserPreference(userId, theme, language);
    }

    public static UserPreference createDefault(String userId) {
        return createDefault(userId, Language.PT_BR);
    }

    public static UserPreference createDefault(String userId, Language defaultLanguage) {
        return new UserPreference(userId, Theme.LIGHT, defaultLanguage != null ? defaultLanguage : Language.PT_BR);
    }

    public void updateTheme(Theme theme) {
        if (theme == null) throw new IllegalArgumentException("Theme não pode ser nulo");
        this.theme = theme;
    }

    public void updateLanguage(Language language) {
        if (language == null) throw new IllegalArgumentException("Language não pode ser nula");
        this.language = language;
    }

    public String getUserId() { return userId; }
    public Theme getTheme() { return theme; }
    public Language getLanguage() { return language; }
}
