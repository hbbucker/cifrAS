package br.com.cifras.user.resource.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;

import br.com.cifras.user.model.UserPreference;

@RegisterForReflection
public record UserPreferenceDTO(String userId, String theme, String language) {
    public static UserPreferenceDTO fromDomain(UserPreference domain) {
        return new UserPreferenceDTO(
            domain.getUserId(),
            domain.getTheme() != null ? domain.getTheme().getValue() : null,
            domain.getLanguage() != null ? domain.getLanguage().getValue() : null
        );
    }
}
