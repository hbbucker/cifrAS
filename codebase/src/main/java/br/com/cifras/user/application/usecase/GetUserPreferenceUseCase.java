package br.com.cifras.user.application.usecase;

import br.com.cifras.user.model.UserPreference;
import br.com.cifras.user.infra.persistence.repository.UserPreferenceRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class GetUserPreferenceUseCase {

    @Inject
    UserPreferenceRepository repository;

    public UserPreference execute(String userId) {
        return execute(userId, br.com.cifras.user.model.Language.PT_BR);
    }

    public UserPreference execute(String userId, br.com.cifras.user.model.Language defaultLanguage) {
        return repository.findByUserId(userId).orElseGet(() -> UserPreference.createDefault(userId, defaultLanguage));
    }
}
