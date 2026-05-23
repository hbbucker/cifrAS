package br.com.cifras.playlist.resource;

import br.com.cifras.playlist.dto.CreatePlaylistRequest;
import br.com.cifras.playlist.dto.ReorderRequest;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * T12: PlaylistResource REST integration tests
 * Tests: 5
 * 1. POST /playlists → 201 with PlaylistDTO
 * 2. GET /playlists → 200 with list
 * 3. POST /playlists/{id}/songs → 204 song added
 * 4. DELETE /playlists/{id}/songs/{songId} → 204 song removed
 * 5. PATCH /playlists/{id}/songs/reorder → 204 songs reordered
 */
import br.com.cifras.BaseIntegrationTest;

@QuarkusTest
class PlaylistResourceTest extends BaseIntegrationTest {

    private static final String OWNER = "playlist-res-owner-uuid";

    private Integer createPlaylist(String name) {
        return given()
            .contentType(ContentType.JSON)
            .body("{\"name\":\"" + name + "\",\"isCollaborative\":false}")
            .when().post("/playlists")
            .then().statusCode(201)
            .extract().path("id");
    }

    private Integer createSong(String title) {
        return given()
            .contentType(ContentType.JSON)
            .body("{\"title\":\"" + title + "\",\"artist\":\"Artist\",\"originalKey\":\"C\"}")
            .when().post("/songs")
            .then().statusCode(201)
            .extract().path("id");
    }

    /**
     * Test 1: POST /playlists returns 201 with the created playlist.
     */
    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenValidPlaylist_whenPost_thenReturns201() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"name\":\"My Setlist\",\"isCollaborative\":false}")
            .when().post("/playlists")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("name", equalTo("My Setlist"));
    }

    /**
     * Test 2: GET /playlists returns 200 with playlist list.
     */
    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenAuthenticated_whenGetPlaylists_thenReturns200() {
        given()
            .when().get("/playlists")
            .then()
            .statusCode(200)
            .body("$", instanceOf(java.util.List.class));
    }

    /**
     * Test 3: POST /playlists/{id}/songs adds a song (204).
     */
    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenPlaylistAndSong_whenAddSong_thenReturns204() {
        Integer playlistId = createPlaylist("Set for Add");
        Integer songId = createSong("Song to Add");

        given()
            .contentType(ContentType.JSON)
            .body("{\"songId\":" + songId + ",\"position\":0}")
            .when().post("/playlists/" + playlistId + "/songs")
            .then().statusCode(204);
    }

    /**
     * Test 4: DELETE /playlists/{id}/songs/{songId} removes the song (204).
     */
    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenSongInPlaylist_whenRemoveSong_thenReturns204() {
        Integer playlistId = createPlaylist("Set for Remove");
        Integer songId = createSong("Song to Remove");

        given().contentType(ContentType.JSON)
            .body("{\"songId\":" + songId + ",\"position\":0}")
            .when().post("/playlists/" + playlistId + "/songs")
            .then().statusCode(204);

        given()
            .when().delete("/playlists/" + playlistId + "/songs/" + songId)
            .then().statusCode(204);
    }

    /**
     * Test 5: PATCH /playlists/{id}/songs/reorder reorders songs (204).
     */
    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenSongsInPlaylist_whenReorder_thenReturns204() {
        Integer playlistId = createPlaylist("Set for Reorder");
        Integer song1Id = createSong("Song 1 Reorder");
        Integer song2Id = createSong("Song 2 Reorder");

        given().contentType(ContentType.JSON)
            .body("{\"songId\":" + song1Id + ",\"position\":0}")
            .when().post("/playlists/" + playlistId + "/songs").then().statusCode(204);
        given().contentType(ContentType.JSON)
            .body("{\"songId\":" + song2Id + ",\"position\":1}")
            .when().post("/playlists/" + playlistId + "/songs").then().statusCode(204);

        given()
            .contentType(ContentType.JSON)
            .body("{\"orderedSongIds\":[" + song2Id + "," + song1Id + "]}")
            .when().patch("/playlists/" + playlistId + "/songs/reorder")
            .then().statusCode(204);
    }
}
