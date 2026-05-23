package br.com.cifras;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.Map;

/**
 * Custom TestResource Lifecycle Manager for explicit Testcontainers usage.
 * Disables Quarkus Dev Services and runs an isolated PostgreSQL container for integration testing.
 */
public class PostgresTestResource implements QuarkusTestResourceLifecycleManager {

    private static final PostgreSQLContainer<?> DATABASE = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("cifras_test")
        .withUsername("testuser")
        .withPassword("testpass");

    @Override
    public Map<String, String> start() {
        DATABASE.start();

        return Map.of(
            // Disable Quarkus auto-DevServices for this test
            "quarkus.datasource.devservices.enabled", "false",
            // Pass the Testcontainers JDBC URL, username, and password to Quarkus
            "quarkus.datasource.jdbc.url", DATABASE.getJdbcUrl(),
            "quarkus.datasource.username", DATABASE.getUsername(),
            "quarkus.datasource.password", DATABASE.getPassword()
        );
    }

    @Override
    public void stop() {
        if (DATABASE != null) {
            DATABASE.stop();
        }
    }
}
