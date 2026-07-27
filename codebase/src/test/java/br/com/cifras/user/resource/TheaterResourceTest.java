package br.com.cifras.user.resource;

import br.com.cifras.BaseIntegrationTest;
import br.com.cifras.song.application.usecase.CreateSongUseCase;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.user.resource.dto.TheaterSessionStateDTO;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class TheaterResourceTest extends BaseIntegrationTest {

    private static final String USER = "user-uuid-123";

    @Inject
    CreateSongUseCase createSongUseCase;

    private UUID createTestSong() {
        return QuarkusTransaction.requiringNew().call(() -> {
            var song = createSongUseCase.execute(
                new CreateSongRequest("Test Song", "Test Artist", "C", null),
                USER
            );
            return song.getId();
        });
    }

    @Test
    @TestSecurity(user = "user-no-session", roles = {"user"})
    void shouldReturnNoContentWhenNoSessionExists() {
        given()
            .when().get("/theater/session")
            .then()
            .statusCode(204);
    }

    @Test
    @TestSecurity(user = USER, roles = {"user"})
    void shouldSaveAndRetrieveTheaterSession() throws InterruptedException {
        UUID songId1 = createTestSong();
        UUID songId2 = createTestSong();

        // 1. Update session for song 1
        given()
            .contentType(ContentType.JSON)
            .body(new TheaterSessionStateDTO(songId1, 2, 5, 20))
            .when().put("/theater/session")
            .then()
            .statusCode(204);

        Thread.sleep(100); // ensure updated_at is different

        // 2. Update session for song 2
        given()
            .contentType(ContentType.JSON)
            .body(new TheaterSessionStateDTO(songId2, -1, 3, 18))
            .when().put("/theater/session")
            .then()
            .statusCode(204);

        // 3. Get session - should return song 2 (most recent updated_at)
        given()
            .when().get("/theater/session")
            .then()
            .statusCode(200)
            .body("songId", equalTo(songId2.toString()))
            .body("transposeSteps", equalTo(-1))
            .body("autoScrollSpeed", equalTo(3))
            .body("fontSize", equalTo(18));

        // 4. Update session for song 1 again (simulate editing song 1 preferences outside theater mode)
        given()
            .contentType(ContentType.JSON)
            .body(new TheaterSessionStateDTO(songId1, 4, 7, 24))
            .when().put("/theater/session")
            .then()
            .statusCode(204);

        // 5. Get session - should now return song 1 (trade-off accepted in MVP)
        given()
            .when().get("/theater/session")
            .then()
            .statusCode(200)
            .body("songId", equalTo(songId1.toString()))
            .body("transposeSteps", equalTo(4))
            .body("autoScrollSpeed", equalTo(7))
            .body("fontSize", equalTo(24));
            
        // 6. Get song preferences explicitly for song 2
        given()
            .when().get("/theater/song-preferences/" + songId2)
            .then()
            .statusCode(200)
            .body("transposeSteps", equalTo(-1))
            .body("autoScrollSpeed", equalTo(3))
            .body("fontSize", equalTo(18));
    }
}
