package br.com.cifras.user.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_preferences")
public class UserPreference extends PanacheEntityBase {
    @Id
    public String userId;
    
    public String theme;
    
    public String language;
    
    public static UserPreference findByUserId(String userId) {
        return find("userId", userId).firstResult();
    }
}
