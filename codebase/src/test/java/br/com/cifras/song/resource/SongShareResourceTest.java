package br.com.cifras.song.resource;

import br.com.cifras.BaseIntegrationTest;
import br.com.cifras.shared.security.UserService;
import br.com.cifras.song.application.usecase.CreateSongUseCase;
import br.com.cifras.song.application.usecase.ShareSongUseCase;
import br.com.cifras.song.dto.CreateSongRequest;
import br.com.cifras.song.dto.ShareSongRequestDTO;
import br.com.cifras.song.model.Song;
import br.com.cifras.song.model.SongShare;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class SongShareResourceTest extends BaseIntegrationTest {

    private static final String SENDER_USER = "sender-user-uuid";
    private static final String RECEIVER_USER = "receiver@cifras.com";
    private static final String RECEIVER_ID = "receiver-user-uuid";

    @InjectMock
    UserService userService;

    @Inject
    CreateSongUseCase createSongUseCase;

    @Inject
    ShareSongUseCase shareSongUseCase;

    @BeforeEach
    void setupMocks() {
        Mockito.when(userService.getUserIdByEmail(Mockito.eq(RECEIVER_USER))).thenReturn(RECEIVER_ID);
        Mockito.when(userService.getUserIdByEmail(Mockito.eq("unknown@cifras.com"))).thenReturn(null);
    }

    @Test
    void givenNoAuth_whenPostShare_thenReturns401() {
        given()
            .contentType(ContentType.JSON)
            .body(new ShareSongRequestDTO("receiver@cifras.com"))
            .when().post("/songs/" + UUID.randomUUID() + "/share")
            .then().statusCode(401);
    }

    @Test
    @TestSecurity(user = SENDER_USER, roles = {"user"})
    void givenValidSong_whenPostShare_thenReturns201WithSongShareResponseDTO() {
        String songId = given()
            .contentType(ContentType.JSON)
            .body("""
                {"title":"Song To Share","artist":"Artist","originalKey":"C"}
                """)
            .when().post("/songs")
            .then().statusCode(201)
            .extract().path("id");

        given()
            .contentType(ContentType.JSON)
            .body(new ShareSongRequestDTO(RECEIVER_USER))
            .when().post("/songs/" + songId + "/share")
            .then()
            .statusCode(201)
            .body("songId", equalTo(songId))
            .body("inviterId", equalTo(SENDER_USER))
            .body("inviteeEmail", equalTo(RECEIVER_USER))
            .body("status", equalTo("PENDING"));
    }

    @Test
    @TestSecurity(user = SENDER_USER, roles = {"user"})
    void givenInvalidEmail_whenPostShare_thenReturns400() {
        given()
            .contentType(ContentType.JSON)
            .body(new ShareSongRequestDTO("not-an-email"))
            .when().post("/songs/" + UUID.randomUUID() + "/share")
            .then()
            .statusCode(400);
    }

    @Test
    @TestSecurity(user = SENDER_USER, roles = {"user"})
    void givenUnregisteredEmail_whenPostShare_thenReturns404() {
        String songId = given()
            .contentType(ContentType.JSON)
            .body("""
                {"title":"Song for Unregistered","artist":"Artist","originalKey":"C"}
                """)
            .when().post("/songs")
            .then().statusCode(201)
            .extract().path("id");

        given()
            .contentType(ContentType.JSON)
            .body(new ShareSongRequestDTO("unknown@cifras.com"))
            .when().post("/songs/" + songId + "/share")
            .then()
            .statusCode(404);
    }

    @Test
    @TestSecurity(user = RECEIVER_USER, roles = {"user"})
    void givenPendingShares_whenGetPending_thenReturns200WithList() {
        QuarkusTransaction.requiringNew().run(() -> {
            Song song = createSongUseCase.execute(new CreateSongRequest("Song for List", "Artist", "D", null), SENDER_USER);
            shareSongUseCase.execute(song.getId(), RECEIVER_USER, SENDER_USER);
        });

        given()
            .contentType(ContentType.JSON)
            .when().get("/songs/shares/pending")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    @TestSecurity(user = RECEIVER_USER, roles = {"user"})
    void givenPendingShare_whenAccept_thenReturns200WithNewSongDTO() {
        final UUID[] shareIdHolder = new UUID[1];
        QuarkusTransaction.requiringNew().run(() -> {
            Song song = createSongUseCase.execute(new CreateSongRequest("Song for Accept", "Artist", "E", null), SENDER_USER);
            SongShare share = shareSongUseCase.execute(song.getId(), RECEIVER_USER, SENDER_USER);
            shareIdHolder[0] = share.getId();
        });

        given()
            .contentType(ContentType.JSON)
            .when().post("/songs/shares/" + shareIdHolder[0] + "/accept")
            .then()
            .statusCode(200)
            .body("title", equalTo("Song for Accept"))
            .body("artist", equalTo("Artist"));
    }

    @Test
    @TestSecurity(user = RECEIVER_USER, roles = {"user"})
    void givenPendingShare_whenDecline_thenReturns204() {
        final UUID[] shareIdHolder = new UUID[1];
        QuarkusTransaction.requiringNew().run(() -> {
            Song song = createSongUseCase.execute(new CreateSongRequest("Song for Decline", "Artist", "F", null), SENDER_USER);
            SongShare share = shareSongUseCase.execute(song.getId(), RECEIVER_USER, SENDER_USER);
            shareIdHolder[0] = share.getId();
        });

        given()
            .contentType(ContentType.JSON)
            .when().post("/songs/shares/" + shareIdHolder[0] + "/decline")
            .then()
            .statusCode(204);
    }
}
