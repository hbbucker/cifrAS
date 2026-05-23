package br.com.cifras.song.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * T10: Song Transposition API integration tests
 * Tests: 4
 * 1. POST /songs/{id}/transpose with valid semitones → 200 with transposed lyrics
 * 2. POST /songs/{id}/transpose with semitones > 11 → 400
 * 3. POST /songs/{id}/transpose with semitones < -11 → 400
 * 4. GET /songs/{id}?transpose=N → 200 with stateless transposition
 */
@QuarkusTest
class SongTranspositionTest {

    private static final String OWNER = "transpose-owner-uuid";

    private Integer createSong() {
        return given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "title":"Transpose Me","artist":"Artist","originalKey":"C",
                  "lyrics":{"sections":[{"label":"V1","lines":[{"chords":[{"chord":"C","position":0},{"chord":"Am","position":8}],"text":"line"}]}]}
                }
                """)
            .when().post("/songs")
            .then().statusCode(201)
            .extract().path("id");
    }

    /**
     * Test 1: POST /songs/{id}/transpose returns 200 with transposed chords.
     */
    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenValidSemitones_whenTranspose_thenReturns200WithTransposedChords() {
        Integer id = createSong();

        given()
            .contentType(ContentType.JSON)
            .body("{\"semitones\":2,\"convention\":\"SHARPS\"}")
            .when().post("/songs/" + id + "/transpose")
            .then()
            .statusCode(200)
            .body("lyrics.sections[0].lines[0].chords[0].chord", equalTo("D"))
            .body("lyrics.sections[0].lines[0].chords[1].chord", equalTo("Bm"));
    }

    /**
     * Test 2: semitones > 11 returns 400 Bad Request.
     */
    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenSemitonesOver11_whenTranspose_thenReturns400() {
        Integer id = createSong();

        given()
            .contentType(ContentType.JSON)
            .body("{\"semitones\":12,\"convention\":\"SHARPS\"}")
            .when().post("/songs/" + id + "/transpose")
            .then()
            .statusCode(400);
    }

    /**
     * Test 3: semitones < -11 returns 400 Bad Request.
     */
    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenSemitonesUnderMinus11_whenTranspose_thenReturns400() {
        Integer id = createSong();

        given()
            .contentType(ContentType.JSON)
            .body("{\"semitones\":-12,\"convention\":\"SHARPS\"}")
            .when().post("/songs/" + id + "/transpose")
            .then()
            .statusCode(400);
    }

    /**
     * Test 4: GET /songs/{id}?transpose=2 returns song with transposed lyrics (stateless, DB unchanged).
     */
    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenTransposeQueryParam_whenGetSong_thenReturnsTransposedLyrics() {
        Integer id = createSong();

        given()
            .queryParam("transpose", 2)
            .when().get("/songs/" + id)
            .then()
            .statusCode(200)
            .body("lyrics.sections[0].lines[0].chords[0].chord", equalTo("D"));
    }
}
