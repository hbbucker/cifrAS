package br.com.cifras.shared.security;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;

@ApplicationScoped
public class UserService {

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
}
