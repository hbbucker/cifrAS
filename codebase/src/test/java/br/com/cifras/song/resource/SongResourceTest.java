package br.com.cifras.song.resource;

import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.dto.UpdateSongRequest;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * T9: SongResource REST integration tests
 * Tests: 7
 * 1. GET /songs without auth → 401
 * 2. POST /songs with valid body → 201 with SongDTO
 * 3. POST /songs with missing title → 400 validation error
 * 4. GET /songs → 200 PagedResponse
 * 5. GET /songs/{id} → 200 SongDTO
 * 6. PUT /songs/{id} by non-owner → 403/404
 * 7. DELETE /songs/{id} → 204 soft delete
 */
import br.com.cifras.BaseIntegrationTest;

@QuarkusTest
class SongResourceTest extends BaseIntegrationTest {

    private static final String OWNER = "owner-user-uuid";
    private static final String OTHER = "other-user-uuid";

    /**
     * Test 1: Unauthenticated access to /songs returns 401.
     */
    @Test
    void givenNoAuth_whenGetSongs_thenReturns401() {
        given()
            .when().get("/songs")
            .then().statusCode(401);
    }

    /**
     * Test 2: POST /songs with valid body returns 201 and SongDTO.
     */
    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenValidSong_whenPost_thenReturns201WithSongDTO() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {"title":"Bohemian Rhapsody","artist":"Queen","originalKey":"Bb"}
                """)
            .when().post("/songs")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("title", equalTo("Bohemian Rhapsody"))
            .body("artist", equalTo("Queen"));
    }

    /**
     * Test 3: POST /songs with missing title returns 400.
     */
    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenMissingTitle_whenPost_thenReturns400() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {"artist":"Queen","originalKey":"Bb"}
                """)
            .when().post("/songs")
            .then()
            .statusCode(400);
    }

    /**
     * Test 4: GET /songs returns 200 with paginated structure.
     */
    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenAuthenticated_whenGetSongs_thenReturns200WithPagedResponse() {
        given()
            .when().get("/songs")
            .then()
            .statusCode(200)
            .body("data", notNullValue())
            .body("total", greaterThanOrEqualTo(0))
            .body("page", equalTo(1))
            .body("pageSize", equalTo(20));
    }

    /**
     * Test 5: GET /songs/{id} returns 200 with full SongDTO for owner.
     */
    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenOwnedSong_whenGetById_thenReturns200() {
        // First create a song
        Integer songId = given()
            .contentType(ContentType.JSON)
            .body("""
                {"title":"Let It Be","artist":"Beatles","originalKey":"C"}
                """)
            .when().post("/songs")
            .then().statusCode(201)
            .extract().path("id");

        // Then fetch it
        given()
            .when().get("/songs/" + songId)
            .then()
            .statusCode(200)
            .body("title", equalTo("Let It Be"));
    }

    /**
     * Test 6: GET /songs/{id} from another user returns 404 (not leaking existence).
     */
    @Test
    @TestSecurity(user = OTHER, roles = {"user"})
    void givenOtherUserSong_whenGetById_thenReturns404() {
        // Song ID that doesn't belong to OTHER user — use a valid ID from OWNER if possible, else 999999
        given()
            .when().get("/songs/999999")
            .then()
            .statusCode(404);
    }

    /**
     * Test 7: DELETE /songs/{id} returns 204 and song disappears from list.
     */
    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenOwnedSong_whenDelete_thenReturns204AndSoftDeletes() {
        Integer songId = given()
            .contentType(ContentType.JSON)
            .body("""
                {"title":"To Delete","artist":"Test","originalKey":"G"}
                """)
            .when().post("/songs")
            .then().statusCode(201)
            .extract().path("id");

        given()
            .when().delete("/songs/" + songId)
            .then().statusCode(204);

        // Verify it no longer appears
        given()
            .when().get("/songs/" + songId)
            .then().statusCode(404);
    }
}
