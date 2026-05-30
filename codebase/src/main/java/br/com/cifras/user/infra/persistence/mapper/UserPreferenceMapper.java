package br.com.cifras.user.infra.persistence.mapper;

import br.com.cifras.user.infra.persistence.entity.UserPreferenceEntity;
import br.com.cifras.user.model.UserPreference;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UserPreferenceMapper {

    public UserPreference toDomain(UserPreferenceEntity entity) {
        if (entity == null) return null;
        UserPreference pref = new UserPreference();
        pref.userId = entity.userId;
        pref.theme = entity.theme;
        pref.language = entity.language;
        return pref;
    }

    public UserPreferenceEntity toEntity(UserPreference pref) {
        if (pref == null) return null;
        UserPreferenceEntity entity = new UserPreferenceEntity();
        entity.userId = pref.userId;
        entity.theme = pref.theme;
        entity.language = pref.language;
        return entity;
    }

    public void updateEntity(UserPreference pref, UserPreferenceEntity entity) {
        entity.theme = pref.theme;
        entity.language = pref.language;
    }
}
