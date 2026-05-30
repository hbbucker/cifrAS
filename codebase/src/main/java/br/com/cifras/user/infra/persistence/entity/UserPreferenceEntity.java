package br.com.cifras.user.infra.persistence.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_preferences")
public class UserPreferenceEntity extends PanacheEntityBase {
    @Id
    public String userId;
    
    public String theme;
    
    public String language;
    
    public static UserPreferenceEntity findByUserId(String userId) {
        return find("userId", userId).firstResult();
    }
}
