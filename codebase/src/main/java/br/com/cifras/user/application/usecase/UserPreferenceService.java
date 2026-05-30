package br.com.cifras.user.application.usecase;

import br.com.cifras.user.model.UserPreference;
import br.com.cifras.user.infra.persistence.repository.UserPreferenceRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class UserPreferenceService {

    @Inject
    UserPreferenceRepository repository;

    public UserPreference getPreferences(String userId) {
        return repository.findByUserId(userId).orElseGet(() -> {
            UserPreference pref = new UserPreference();
            pref.userId = userId;
            pref.theme = "light";
            return pref;
        });
    }

    @Transactional
    public UserPreference updatePreferences(String userId, UserPreference newPref) {
        UserPreference pref = repository.findByUserId(userId).orElseGet(() -> {
            UserPreference p = new UserPreference();
            p.userId = userId;
            return p;
        });

        if (newPref.theme != null) {
            pref.theme = newPref.theme;
        }
        if (newPref.language != null) {
            pref.language = newPref.language;
        }

        if (repository.findByUserId(userId).isEmpty()) {
            repository.persist(pref);
        } else {
            repository.update(pref);
        }

        return pref;
    }
}
