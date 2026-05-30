package br.com.cifras.user.infra.persistence.mapper;

import br.com.cifras.user.infra.persistence.entity.UserPreferenceEntity;
import br.com.cifras.user.model.Language;
import br.com.cifras.user.model.Theme;
import br.com.cifras.user.model.UserPreference;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UserPreferenceMapper {

    public UserPreference toDomain(UserPreferenceEntity entity) {
        if (entity == null) return null;
        Theme t = entity.theme != null ? Theme.fromString(entity.theme) : null;
        Language l = entity.language != null ? Language.fromString(entity.language) : null;
        return UserPreference.restore(entity.userId, t, l);
    }

    public UserPreferenceEntity toEntity(UserPreference pref) {
        if (pref == null) return null;
        UserPreferenceEntity entity = new UserPreferenceEntity();
        entity.userId = pref.getUserId();
        entity.theme = pref.getTheme() != null ? pref.getTheme().getValue() : null;
        entity.language = pref.getLanguage() != null ? pref.getLanguage().getValue() : null;
        return entity;
    }

    public void updateEntity(UserPreference pref, UserPreferenceEntity entity) {
        entity.theme = pref.getTheme() != null ? pref.getTheme().getValue() : null;
        entity.language = pref.getLanguage() != null ? pref.getLanguage().getValue() : null;
    }
}
