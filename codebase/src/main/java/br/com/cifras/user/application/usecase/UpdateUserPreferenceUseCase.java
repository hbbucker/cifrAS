package br.com.cifras.user.application.usecase;

import br.com.cifras.user.model.Language;
import br.com.cifras.user.model.Theme;
import br.com.cifras.user.model.UserPreference;
import br.com.cifras.user.infra.persistence.repository.UserPreferenceRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class UpdateUserPreferenceUseCase {

    @Inject
    UserPreferenceRepository repository;

    @Transactional
    public UserPreference execute(String userId, String themeVal, String langVal) {
        boolean isNew = repository.findByUserId(userId).isEmpty();
        UserPreference pref = isNew ? UserPreference.createDefault(userId) : repository.findByUserId(userId).get();

        if (themeVal != null) {
            pref.updateTheme(Theme.fromString(themeVal));
        }
        if (langVal != null) {
            pref.updateLanguage(Language.fromString(langVal));
        }

        if (isNew) {
            repository.persist(pref);
        } else {
            repository.update(pref);
        }

        return pref;
    }
}
