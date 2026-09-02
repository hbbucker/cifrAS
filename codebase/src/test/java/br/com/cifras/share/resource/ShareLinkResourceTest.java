package br.com.cifras.share.resource;

import br.com.cifras.BaseIntegrationTest;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.group.model.Group;
import br.com.cifras.share.infra.ShareLinkEntity;
import br.com.cifras.share.infra.ShareLinkRepository;
import br.com.cifras.share.model.ShareLinkType;
import br.com.cifras.song.infra.persistence.repository.SongRepository;
import br.com.cifras.song.model.LyricsStructure;
import br.com.cifras.song.model.Song;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;

@QuarkusTest
class ShareLinkResourceTest extends BaseIntegrationTest {

    private static final String OWNER = "owner-user-uuid";
    private static final String OTHER = "other-user-uuid";

    @Inject
    SongRepository songRepository;

    @Inject
    GroupRepository groupRepository;

    @Inject
    ShareLinkRepository shareLinkRepository;

    private UUID songId;
    private UUID groupId;
    private String songToken;
    private String groupToken;
    private String expiredToken;

    @BeforeEach
    void setUpData() {
        QuarkusTransaction.requiringNew().run(() -> {
            Song song = Song.create(OWNER, "Minha Musica", "Artista", "C", new LyricsStructure(List.of()));
            songRepository.persist(song);
            songId = song.getId();

            Group group = Group.create("Meu Grupo", OWNER);
            groupRepository.persist(group);
            groupId = group.getId();
            br.com.cifras.group.model.GroupMember ownerMember = br.com.cifras.group.model.GroupMember.create(group, OWNER, br.com.cifras.group.model.GroupRole.OWNER);
            groupRepository.persistMember(ownerMember);

            songToken = UUID.randomUUID().toString();
            ShareLinkEntity songLink = new ShareLinkEntity(songToken, ShareLinkType.SONG, songId, OWNER, Instant.now().plus(1, ChronoUnit.DAYS));
            shareLinkRepository.persist(songLink);
            
            groupToken = UUID.randomUUID().toString();
            ShareLinkEntity groupLink = new ShareLinkEntity(groupToken, ShareLinkType.GROUP, groupId, OWNER, Instant.now().plus(1, ChronoUnit.DAYS));
            shareLinkRepository.persist(groupLink);

            expiredToken = UUID.randomUUID().toString();
            ShareLinkEntity expiredLink = new ShareLinkEntity(expiredToken, ShareLinkType.SONG, songId, OWNER, Instant.now().minus(1, ChronoUnit.DAYS));
            shareLinkRepository.persist(expiredLink);
        });
    }

    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void createShareLink_Success_Song() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {"type":"SONG","resourceId":"%s"}
                """.formatted(songId))
            .when().post("/share-links")
            .then()
            .statusCode(201)
            .body("token", notNullValue())
            .body("type", equalTo("SONG"))
            .body("resourceId", equalTo(songId.toString()))
            .body("resourceName", equalTo("Minha Musica"))
            .body("url", containsString("cifras.app/invite/"));
    }

    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void createShareLink_Success_Group() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {"type":"GROUP","resourceId":"%s"}
                """.formatted(groupId))
            .when().post("/share-links")
            .then()
            .statusCode(201)
            .body("type", equalTo("GROUP"))
            .body("resourceName", equalTo("Meu Grupo"));
    }

    @Test
    @TestSecurity(user = OTHER, roles = {"user"})
    void createShareLink_NotGroupAdmin() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {"type":"GROUP","resourceId":"%s"}
                """.formatted(groupId))
            .when().post("/share-links")
            .then()
            .statusCode(400); 
    }

    @Test
    void getShareLink_Success() {
        given()
            .when().get("/share-links/" + songToken)
            .then()
            .statusCode(200)
            .body("token", equalTo(songToken))
            .body("resourceName", equalTo("Minha Musica"));
    }

    @Test
    void getShareLink_NotFound() {
        given()
            .when().get("/share-links/fake-token")
            .then()
            .statusCode(404);
    }

    @Test
    void getShareLink_Expired() {
        given()
            .when().get("/share-links/" + expiredToken)
            .then()
            .statusCode(400);
    }

    @Test
    @TestSecurity(user = OTHER, roles = {"user"})
    void acceptShareLink_Success_Song() {
        given()
            .contentType(io.restassured.http.ContentType.JSON)
            .when().post("/share-links/" + songToken + "/accept")
            .then()
            .statusCode(200)
            .body("success", equalTo(true));
    }
    
    @Test
    @TestSecurity(user = OTHER, roles = {"user"})
    void acceptShareLink_Success_Group() {
        given()
            .contentType(io.restassured.http.ContentType.JSON)
            .when().post("/share-links/" + groupToken + "/accept")
            .then()
            .statusCode(200)
            .body("success", equalTo(true));
        
        QuarkusTransaction.requiringNew().run(() -> {
            assertTrue(groupRepository.isMember(groupId, OTHER));
        });
    }
}
