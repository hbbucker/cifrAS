package br.com.cifras.admin;

import br.com.cifras.admin.dashboard.dto.DashboardMetricsDTO;
import br.com.cifras.admin.dashboard.model.DashboardMetrics;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class DashboardMetricsTest {

    @Test
    void shouldCreateAndExposeMetrics() {
        DashboardMetrics metrics = new DashboardMetrics(
            150,
            1200,
            1150,
            50,
            300,
            15,
            240,
            Map.of("Chico Buarque", 120L),
            Map.of("C", 400L)
        );

        assertEquals(150, metrics.getTotalUsers());
        assertEquals(1200, metrics.getTotalSongs());
        assertEquals(1150, metrics.getActiveSongs());
        assertEquals(50, metrics.getDeletedSongs());
        assertEquals(300, metrics.getTotalPlaylists());
        assertEquals(15, metrics.getSongsCreatedToday());
        assertEquals(240, metrics.getSongsCreatedThisMonth());
        assertEquals(120L, metrics.getTopArtists().get("Chico Buarque"));
        assertEquals(400L, metrics.getTopKeys().get("C"));
    }

    @Test
    void shouldCreateDTO() {
        DashboardMetricsDTO dto = new DashboardMetricsDTO(
            10, 50, 45, 5, 8, 2, 20, Map.of(), Map.of()
        );

        assertEquals(10, dto.totalUsers());
        assertEquals(50, dto.totalSongs());
        assertEquals(45, dto.activeSongs());
    }
}
