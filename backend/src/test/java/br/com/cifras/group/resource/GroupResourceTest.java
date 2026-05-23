package br.com.cifras.group.resource;

import br.com.cifras.group.dto.AddMemberRequest;
import br.com.cifras.group.dto.CreateGroupRequest;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * T13: GroupResource REST integration tests
 * Tests: 4
 * 1. POST /groups → 201 with GroupDTO
 * 2. GET /groups → 200 list of groups
 * 3. POST /groups/{id}/members → 204 member added
 * 4. DELETE /groups/{id}/members/{targetUserId} → 204 member removed
 */
@QuarkusTest
class GroupResourceTest {

    private static final String OWNER = "group-owner-uuid";
    private static final String MEMBER = "group-member-uuid";

    private Integer createGroup(String name) {
        return given()
            .contentType(ContentType.JSON)
            .body(new CreateGroupRequest(name))
            .when().post("/groups")
            .then().statusCode(201)
            .extract().path("id");
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
    void givenOwnerAndTarget_whenAddMember_thenReturns204() {
        Integer groupId = createGroup("Band With Members");

        given()
            .contentType(ContentType.JSON)
            .body(new AddMemberRequest(MEMBER))
            .when().post("/groups/" + groupId + "/members")
            .then()
            .statusCode(204);
    }

    @Test
    @TestSecurity(user = OWNER, roles = {"user"})
    void givenOwnerAndExistingMember_whenRemoveMember_thenReturns204() {
        Integer groupId = createGroup("Band For Removal");

        given()
            .contentType(ContentType.JSON)
            .body(new AddMemberRequest(MEMBER))
            .when().post("/groups/" + groupId + "/members")
            .then().statusCode(204);

        given()
            .when().delete("/groups/" + groupId + "/members/" + MEMBER)
            .then()
            .statusCode(204);
    }
}
