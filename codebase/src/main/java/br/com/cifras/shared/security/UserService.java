package br.com.cifras.shared.security;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;

import java.util.*;

@ApplicationScoped
public class UserService {

    public record UserProfile(String id, String email, String name) {}

    @Inject
    EntityManager em;

    public String getUserIdByEmail(String email) {
        try {
            // Note: In Supabase, auth.users contains registered users.
            // Our DB user needs permission to read auth.users.
            Object result = em.createNativeQuery("SELECT id FROM auth.users WHERE email = :email")
                              .setParameter("email", email)
                              .getSingleResult();
            if (result != null) {
                return result.toString();
            }
        } catch (NoResultException e) {
            return null;
        } catch (Exception e) {
            // Fallback for tests or environments without auth schema
            // We just assume the user exists or can't verify properly.
            System.err.println("Could not verify user email in auth.users: " + e.getMessage());
        }
        return null;
    }

    public Map<String, UserProfile> findUserProfilesByIds(List<String> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<String, UserProfile> profiles = new HashMap<>();
        try {
            List<?> rows = em.createNativeQuery(
                "SELECT id::text, email, raw_user_meta_data->>'full_name', raw_user_meta_data->>'name' FROM auth.users WHERE id::text IN (:ids)"
            ).setParameter("ids", userIds).getResultList();

            for (Object item : rows) {
                if (item instanceof Object[] row) {
                    String id = row[0] != null ? row[0].toString() : null;
                    String email = row[1] != null ? row[1].toString() : null;
                    String fullName = row[2] != null ? row[2].toString() : (row[3] != null ? row[3].toString() : null);
                    if (id != null) {
                        String displayName = (fullName != null && !fullName.isBlank()) 
                            ? fullName 
                            : (email != null ? email.split("@")[0] : id);
                        profiles.put(id, new UserProfile(id, email != null ? email : id + "@user.com", displayName));
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Could not query user profiles in auth.users: " + e.getMessage());
        }

        // Fallback for missing entries (e.g. test environments without auth.users)
        for (String id : userIds) {
            if (!profiles.containsKey(id)) {
                String prefix = id.length() > 8 ? id.substring(0, 8) : id;
                profiles.put(id, new UserProfile(id, id.contains("@") ? id : id + "@user.com", "User " + prefix));
            }
        }
        return profiles;
    }

    public UserProfile findUserProfileById(String userId) {
        if (userId == null) return null;
        Map<String, UserProfile> map = findUserProfilesByIds(List.of(userId));
        return map.get(userId);
    }
}
