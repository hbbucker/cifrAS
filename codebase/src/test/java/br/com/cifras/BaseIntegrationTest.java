package br.com.cifras;

import io.quarkus.test.common.QuarkusTestResource;

/**
 * Base class for all integration tests.
 * Forces the use of our explicit Testcontainers PostgreSQL setup (PostgresTestResource).
 */
@QuarkusTestResource(PostgresTestResource.class)
public abstract class BaseIntegrationTest {
}
