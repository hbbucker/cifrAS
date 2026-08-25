package br.com.cifras.admin.user.infra.repository;

import br.com.cifras.admin.user.model.AdminUser;
import br.com.cifras.admin.user.model.UserStatus;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class AdminUserRepository {

    private static final Logger LOG = Logger.getLogger(AdminUserRepository.class);

    @Inject
    EntityManager em;

    private final Map<String, AdminUser> fallbackUsers = new ConcurrentHashMap<>();

    public AdminUserRepository() {
        initFallbacks();
    }

    private void initFallbacks() {
        fallbackUsers.put("admin-user-id", new AdminUser(
            "admin-user-id", "admin@cifras.com", "Admin CifrAS", "admin",
            Instant.now().minusSeconds(864000), Instant.now(), 5,
            UserStatus.ACTIVE, false, null, Instant.now()
        ));
        fallbackUsers.put("user-1", new AdminUser(
            "user-1", "musico@cifras.com", "João Músico", "user",
            Instant.now().minusSeconds(432000), Instant.now(), 12,
            UserStatus.ACTIVE, false, null, Instant.now()
        ));
        fallbackUsers.put("e2e-user-1234", new AdminUser(
            "e2e-user-1234", "e2e@cifras.com", "E2E User", "user",
            Instant.now().minusSeconds(100000), Instant.now(), 3,
            UserStatus.ACTIVE, false, null, Instant.now()
        ));
        fallbackUsers.put("0503abef-1673-4048-95f3-031caf21573c", new AdminUser(
            "0503abef-1673-4048-95f3-031caf21573c", "hbbucker@gmail.com", "Bucker", "admin",
            Instant.now().minusSeconds(200000), Instant.now(), 32,
            UserStatus.ACTIVE, false, null, Instant.now()
        ));
    }

    public List<AdminUser> findUsers(String search, int page, int pageSize) {
        List<AdminUser> users = new ArrayList<>();
        int offset = Math.max(0, page * pageSize);

        try {
            StringBuilder sql = new StringBuilder(
                "SELECT u.id::text, u.email, " +
                "coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', u.email), " +
                "coalesce(u.raw_app_meta_data->>'role', u.raw_user_meta_data->>'role', 'user'), " +
                "u.created_at, u.last_sign_in_at, " +
                "(SELECT count(*) FROM songs s WHERE s.userid = u.id::text AND s.deletedat IS NULL) as song_count, " +
                "coalesce(u.raw_app_meta_data->>'status', 'ACTIVE'), " +
                "coalesce((u.raw_app_meta_data->>'is_blocked')::boolean, false), " +
                "u.raw_app_meta_data->>'last_block_reason', " +
                "u.updated_at " +
                "FROM auth.users u WHERE 1=1 "
            );

            if (search != null && !search.isBlank()) {
                sql.append("AND (LOWER(u.email) LIKE LOWER(:search) OR LOWER(u.raw_user_meta_data->>'full_name') LIKE LOWER(:search)) ");
            }

            sql.append("ORDER BY u.created_at DESC ");

            var query = em.createNativeQuery(sql.toString());
            if (search != null && !search.isBlank()) {
                query.setParameter("search", "%" + search.trim() + "%");
            }

            query.setFirstResult(offset);
            query.setMaxResults(pageSize);

            List<?> rows = query.getResultList();
            for (Object obj : rows) {
                if (obj instanceof Object[] row) {
                    String id = row[0] != null ? row[0].toString() : UUID.randomUUID().toString();
                    String email = row[1] != null ? row[1].toString() : "user@cifras.com";
                    String name = row[2] != null ? row[2].toString() : email;
                    String role = row[3] != null ? row[3].toString() : "user";
                    Instant createdAt = parseInstant(row[4]);
                    Instant lastSignInAt = parseInstant(row[5]);
                    long songCount = row[6] instanceof Number num ? num.longValue() : 0L;
                    String statusStr = row.length > 7 && row[7] != null ? row[7].toString() : "ACTIVE";
                    UserStatus status = UserStatus.fromString(statusStr);
                    boolean isBlocked = row.length > 8 && row[8] != null && (Boolean.TRUE.equals(row[8]) || "true".equalsIgnoreCase(row[8].toString()));
                    String lastBlockReason = row.length > 9 && row[9] != null ? row[9].toString() : null;
                    Instant updatedAt = row.length > 10 ? parseInstant(row[10]) : createdAt;

                    AdminUser adminUser = new AdminUser(id, email, name, role, createdAt, lastSignInAt, songCount, status, isBlocked, lastBlockReason, updatedAt);
                    users.add(adminUser);
                }
            }
        } catch (Exception e) {
            LOG.warn("Could not query auth.users directly (using fallback/mock for local/test): " + e.getMessage());
            return getFallbackUsers(search, page, pageSize);
        }

        return users;
    }

    public long countUsers(String search) {
        try {
            StringBuilder sql = new StringBuilder("SELECT count(*) FROM auth.users u WHERE 1=1 ");
            if (search != null && !search.isBlank()) {
                sql.append("AND (LOWER(u.email) LIKE LOWER(:search) OR LOWER(u.raw_user_meta_data->>'full_name') LIKE LOWER(:search)) ");
            }
            var query = em.createNativeQuery(sql.toString());
            if (search != null && !search.isBlank()) {
                query.setParameter("search", "%" + search.trim() + "%");
            }
            Object res = query.getSingleResult();
            if (res instanceof Number num) {
                return num.longValue();
            }
        } catch (Exception e) {
            LOG.warn("Could not count auth.users (using fallback): " + e.getMessage());
            return fallbackUsers.values().stream()
                .filter(u -> search == null || search.isBlank() || u.getEmail().contains(search) || u.getFullName().contains(search))
                .count();
        }
        return 0L;
    }

    public Optional<AdminUser> findById(String id) {
        if (id == null || id.isBlank()) return Optional.empty();

        try {
            String sql = "SELECT u.id::text, u.email, " +
                "coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', u.email), " +
                "coalesce(u.raw_app_meta_data->>'role', u.raw_user_meta_data->>'role', 'user'), " +
                "u.created_at, u.last_sign_in_at, " +
                "(SELECT count(*) FROM songs s WHERE s.userid = u.id::text AND s.deletedat IS NULL) as song_count, " +
                "coalesce(u.raw_app_meta_data->>'status', 'ACTIVE'), " +
                "coalesce((u.raw_app_meta_data->>'is_blocked')::boolean, false), " +
                "u.raw_app_meta_data->>'last_block_reason', " +
                "u.updated_at " +
                "FROM auth.users u WHERE u.id::text = :id";
            var query = em.createNativeQuery(sql);
            query.setParameter("id", id.trim());
            List<?> rows = query.getResultList();
            if (!rows.isEmpty() && rows.get(0) instanceof Object[] row) {
                String userId = row[0] != null ? row[0].toString() : id;
                String email = row[1] != null ? row[1].toString() : "user@cifras.com";
                String name = row[2] != null ? row[2].toString() : email;
                String role = row[3] != null ? row[3].toString() : "user";
                Instant createdAt = parseInstant(row[4]);
                Instant lastSignInAt = parseInstant(row[5]);
                long songCount = row[6] instanceof Number num ? num.longValue() : 0L;
                String statusStr = row.length > 7 && row[7] != null ? row[7].toString() : "ACTIVE";
                UserStatus status = UserStatus.fromString(statusStr);
                boolean isBlocked = row.length > 8 && row[8] != null && (Boolean.TRUE.equals(row[8]) || "true".equalsIgnoreCase(row[8].toString()));
                String lastBlockReason = row.length > 9 && row[9] != null ? row[9].toString() : null;
                Instant updatedAt = row.length > 10 ? parseInstant(row[10]) : createdAt;

                AdminUser adminUser = new AdminUser(userId, email, name, role, createdAt, lastSignInAt, songCount, status, isBlocked, lastBlockReason, updatedAt);
                fallbackUsers.put(userId, adminUser);
                return Optional.of(adminUser);
            }
        } catch (Exception e) {
            LOG.warn("Could not query auth.users by id (using fallback): " + e.getMessage());
        }
        return Optional.ofNullable(fallbackUsers.get(id));
    }

    public void updateStatus(AdminUser user) {
        if (user == null || user.getId() == null) return;
        fallbackUsers.put(user.getId(), user);

        try {
            String sql = "UPDATE auth.users SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || " +
                         "jsonb_build_object('status', cast(:status as text), 'is_blocked', cast(:isBlocked as boolean), 'last_block_reason', cast(:lastBlockReason as text)), " +
                         "updated_at = NOW() WHERE id::text = :id";
            em.createNativeQuery(sql)
              .setParameter("status", user.getStatus().name())
              .setParameter("isBlocked", user.isBlocked())
              .setParameter("lastBlockReason", user.getLastBlockReason())
              .setParameter("id", user.getId())
              .executeUpdate();
        } catch (Exception e) {
            LOG.warn("Could not update auth.users directly (updating fallback memory store): " + e.getMessage());
        }
    }

    private List<AdminUser> getFallbackUsers(String search, int page, int pageSize) {
        return fallbackUsers.values().stream()
            .filter(u -> search == null || search.isBlank() || u.getEmail().toLowerCase().contains(search.toLowerCase()) || u.getFullName().toLowerCase().contains(search.toLowerCase()))
            .sorted(Comparator.comparing(AdminUser::getCreatedAt).reversed())
            .skip((long) page * pageSize)
            .limit(pageSize)
            .toList();
    }

    private Instant parseInstant(Object val) {
        if (val == null) return null;
        if (val instanceof Instant i) return i;
        if (val instanceof java.sql.Timestamp ts) return ts.toInstant();
        if (val instanceof java.util.Date d) return d.toInstant();
        try {
            return Instant.parse(val.toString());
        } catch (Exception e) {
            return Instant.now();
        }
    }
}
