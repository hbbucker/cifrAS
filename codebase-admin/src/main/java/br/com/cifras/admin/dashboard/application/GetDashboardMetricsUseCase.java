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
            Object playlistCount = em.createNativeQuery("SELECT count(*) FROM playlists WHERE deletedat IS NULL").getSingleResult();
            if (playlistCount instanceof Number num) {
                totalPlaylists = num.longValue();
            }
        } catch (Exception ignored) {}

        Map<String, Long> topArtists = new HashMap<>();
        try {
            List<Object[]> rows = em.createQuery(
                "SELECT s.artist, count(s) FROM AdminSongEntity s WHERE s.deletedAt IS NULL GROUP BY s.artist ORDER BY count(s) DESC",
                Object[].class
            ).setMaxResults(5).getResultList();
            for (Object[] row : rows) {
                if (row != null && row[0] != null && row[1] instanceof Number num) {
                    topArtists.put(row[0].toString(), num.longValue());
                }
            }
        } catch (Exception ignored) {}

        Map<String, Long> topKeys = new HashMap<>();
        try {
            List<Object[]> rows = em.createQuery(
                "SELECT s.originalKey, count(s) FROM AdminSongEntity s WHERE s.deletedAt IS NULL AND s.originalKey IS NOT NULL GROUP BY s.originalKey ORDER BY count(s) DESC",
                Object[].class
            ).setMaxResults(5).getResultList();
            for (Object[] row : rows) {
                if (row != null && row[0] != null && row[1] instanceof Number num) {
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
