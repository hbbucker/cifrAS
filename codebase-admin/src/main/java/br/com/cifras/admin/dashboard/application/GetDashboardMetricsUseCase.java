package br.com.cifras.admin.dashboard.application;

import br.com.cifras.admin.dashboard.dto.DashboardMetricsDTO;
import br.com.cifras.admin.song.infra.repository.AdminSongRepository;
import br.com.cifras.admin.user.infra.repository.AdminUserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class GetDashboardMetricsUseCase {

    @Inject
    AdminUserRepository userRepository;

    @Inject
    AdminSongRepository songRepository;

    @Inject
    EntityManager em;

    public DashboardMetricsDTO execute() {
        long totalUsers = userRepository.countUsers(null);
        long activeSongs = songRepository.countActive();
        long deletedSongs = songRepository.countDeleted();
        long totalSongs = activeSongs + deletedSongs;

        Instant startOfToday = Instant.now().truncatedTo(ChronoUnit.DAYS);
        Instant startOfMonth = Instant.now().minus(30, ChronoUnit.DAYS);

        long songsCreatedToday = songRepository.countCreatedAfter(startOfToday);
        long songsCreatedThisMonth = songRepository.countCreatedAfter(startOfMonth);

        long totalPlaylists = 0L;
        try {
            Object playlistCount = em.createNativeQuery("SELECT count(*) FROM playlists WHERE deleted_at IS NULL").getSingleResult();
            if (playlistCount instanceof Number num) {
                totalPlaylists = num.longValue();
            }
        } catch (Exception ignored) {}

        Map<String, Long> topArtists = new HashMap<>();
        try {
            List<?> rows = em.createNativeQuery(
                "SELECT artist, count(*) as c FROM songs WHERE deleted_at IS NULL GROUP BY artist ORDER BY c DESC LIMIT 5"
            ).getResultList();
            for (Object item : rows) {
                if (item instanceof Object[] row && row[0] != null && row[1] instanceof Number num) {
                    topArtists.put(row[0].toString(), num.longValue());
                }
            }
        } catch (Exception ignored) {}

        Map<String, Long> topKeys = new HashMap<>();
        try {
            List<?> rows = em.createNativeQuery(
                "SELECT original_key, count(*) as c FROM songs WHERE deleted_at IS NULL AND original_key IS NOT NULL GROUP BY original_key ORDER BY c DESC LIMIT 5"
            ).getResultList();
            for (Object item : rows) {
                if (item instanceof Object[] row && row[0] != null && row[1] instanceof Number num) {
                    topKeys.put(row[0].toString(), num.longValue());
                }
            }
        } catch (Exception ignored) {}

        return new DashboardMetricsDTO(
            totalUsers,
            totalSongs,
            activeSongs,
            deletedSongs,
            totalPlaylists,
            songsCreatedToday,
            songsCreatedThisMonth,
            topArtists,
            topKeys
        );
    }
}
