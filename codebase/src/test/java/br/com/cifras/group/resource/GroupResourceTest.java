package br.com.cifras.group.resource;

import br.com.cifras.group.dto.AddMemberRequest;
import br.com.cifras.group.dto.CreateGroupRequest;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

import io.quarkus.test.InjectMock;
import org.mockito.Mockito;
import br.com.cifras.shared.security.UserService;
import br.com.cifras.group.service.GroupService;
import br.com.cifras.playlist.service.PlaylistService;
import br.com.cifras.playlist.dto.CreatePlaylistRequest;
import br.com.cifras.group.dto.LinkPlaylistRequest;
import br.com.cifras.playlist.domain.Playlist;
import jakarta.inject.Inject;

/**
 * T13: GroupResource REST integration tests
 * Tests: 4
 * 1. POST /groups → 201 with GroupDTO
 * 2. GET /groups → 200 list of groups
 * 3. POST /groups/{id}/members → 204 member added
 * 4. DELETE /groups/{id}/members/{targetUserId} → 204 member removed
 */
import br.com.cifras.BaseIntegrationTest;

@QuarkusTest
class GroupResourceTest extends BaseIntegrationTest {

    @InjectMock
    UserService userService;

    @Inject
    GroupService groupService;

    @Inject
    PlaylistService playlistService;

    private static final String OWNER = "group-owner-uuid";
    private static final String MEMBER = "group-member-uuid";

    private java.util.UUID createGroup(String name) {
        String idStr = given()
            .contentType(ContentType.JSON)
            .body(new CreateGroupRequest(name))
            .when().post("/groups")
            .then().statusCode(201)
            .extract().path("id");
        return java.util.UUID.fromString(idStr);
    }

    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenValidRequest_whenCreateGroup_thenReturns201() {
        given()
            .contentType(ContentType.JSON)
            .body(new CreateGroupRequest("My Band"))
            .when().post("/groups")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("name", equalTo("My Band"))
            .body("ownerId", equalTo(OWNER));
    }

    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenAuthenticated_whenGetGroups_thenReturns200() {
        createGroup("My Second Band");

        given()
            .when().get("/groups")
            .then()
            .statusCode(200)
            .body("$", instanceOf(java.util.List.class))
            .body("size()", greaterThan(0));
    }

    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenOwnerAndTarget_whenInviteMember_thenReturns204() {
        java.util.UUID groupId = createGroup("Band With Members");

        Mockito.when(userService.getUserIdByEmail("member@example.com")).thenReturn(MEMBER);

        given()
            .contentType(ContentType.JSON)
            .body(new AddMemberRequest("member@example.com"))
            .when().post("/groups/" + groupId + "/members")
            .then()
            .statusCode(204);
    }

    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenOwnerAndExistingMember_whenRemoveMember_thenReturns204() {
        java.util.UUID groupId = createGroup("Band For Removal");

        groupService.addMember(groupId, MEMBER, OWNER);

        given()
            .when().delete("/groups/" + groupId + "/members/" + MEMBER)
            .then()
            .statusCode(204);
    }

    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenOwnerAndPlaylist_whenLinkPlaylist_thenReturns204() {
        java.util.UUID groupId = createGroup("Band with Playlist");
        Playlist playlist = playlistService.create(new CreatePlaylistRequest("My Songs", false, null), OWNER);

        given()
            .contentType(ContentType.JSON)
            .body(new LinkPlaylistRequest(playlist.id))
            .when().post("/groups/" + groupId + "/playlists")
            .then()
            .statusCode(204);
    }

    @Test
    @TestSecurity(user = MEMBER, roles = {"user"})
    void givenMember_whenGetPlaylists_thenReturnsList() {
        br.com.cifras.group.domain.Group group = groupService.createGroup("Band with Shared Playlists", OWNER);
        java.util.UUID groupId = group.id;
        groupService.addMember(groupId, MEMBER, OWNER);
        Playlist playlist = playlistService.create(new CreatePlaylistRequest("Setlist", false, null), OWNER);
        groupService.linkPlaylist(groupId, playlist.id, OWNER);

        given()
            .when().get("/groups/" + groupId + "/playlists")
            .then()
            .statusCode(200)
            .body("$", instanceOf(java.util.List.class))
            .body("size()", equalTo(1))
            .body("[0].name", equalTo("Setlist"))
            .body("[0].isCollaborative", equalTo(true));
    }

    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenOwner_whenUnlinkPlaylist_thenReturns204() {
        java.util.UUID groupId = createGroup("Band for Unlink");
        Playlist playlist = playlistService.create(new CreatePlaylistRequest("Temporary Setlist", false, null), OWNER);
        groupService.linkPlaylist(groupId, playlist.id, OWNER);

        given()
            .when().delete("/groups/" + groupId + "/playlists/" + playlist.id)
            .then()
            .statusCode(204);
    }
}
