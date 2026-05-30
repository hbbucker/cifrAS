package br.com.cifras.group.application.usecase;

import br.com.cifras.group.model.Group;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * T13: GroupService integration tests
 */
import br.com.cifras.BaseIntegrationTest;

@QuarkusTest
class GroupServiceTest extends BaseIntegrationTest {

    @Inject
    GroupService groupService;

    private static final String OWNER = "group-owner-uuid";
    private static final String MEMBER = "group-member-uuid";
    private static final String STRANGER = "group-stranger-uuid";

    /**
     * Test 1: createGroup() persists group and sets creator as OWNER member.
     */
    @Test
    @Transactional
    void givenValidName_whenCreateGroup_thenGroupCreatedWithOwner() {
        Group group = groupService.createGroup("CifrAS Band", OWNER);

        assertNotNull(group.getId());
        assertEquals("CifrAS Band", group.getName());
        assertEquals(OWNER, group.getOwnerId());
        assertTrue(groupService.isOwner(group.getId(), OWNER), "Creator must be OWNER");
        assertTrue(groupService.isMember(group.getId(), OWNER), "Creator must be a member");
    }

    /**
     * Test 2: isMember() correctly identifies members.
     */
    @Test
    @Transactional
    void givenMemberAdded_whenIsMember_thenReturnsTrue() {
        Group group = groupService.createGroup("Test Group", OWNER);
        groupService.addMember(group.getId(), MEMBER, OWNER);

        assertTrue(groupService.isMember(group.getId(), MEMBER));
        assertFalse(groupService.isMember(group.getId(), STRANGER));
    }

    /**
     * Test 3: isOwner() returns false for regular members.
     */
    @Test
    @Transactional
    void givenMemberAdded_whenIsOwner_thenReturnsFalseForMember() {
        Group group = groupService.createGroup("Owner Test", OWNER);
        groupService.addMember(group.getId(), MEMBER, OWNER);

        assertTrue(groupService.isOwner(group.getId(), OWNER));
        assertFalse(groupService.isOwner(group.getId(), MEMBER));
    }

    /**
     * Test 4: addMember() adds user with MEMBER role.
     */
    @Test
    @Transactional
    void givenOwnerRequest_whenAddMember_thenMemberAdded() {
        Group group = groupService.createGroup("Add Test", OWNER);
        groupService.addMember(group.getId(), MEMBER, OWNER);

        assertTrue(groupService.isMember(group.getId(), MEMBER));
    }

    /**
     * Test 5: removeMember() removes a member from the group.
     */
    @Test
    @Transactional
    void givenExistingMember_whenRemoveMember_thenMemberRemoved() {
        Group group = groupService.createGroup("Remove Test", OWNER);
        groupService.addMember(group.getId(), MEMBER, OWNER);
        groupService.removeMember(group.getId(), MEMBER, OWNER);

        assertFalse(groupService.isMember(group.getId(), MEMBER));
    }

    /**
     * Test 6: Non-owner cannot remove members.
     */
    @Test
    @Transactional
    void givenNonOwner_whenRemoveMember_thenThrowsForbiddenException() {
        Group group = groupService.createGroup("Forbidden Test", OWNER);
        groupService.addMember(group.getId(), MEMBER, OWNER);

        assertThrows(ForbiddenException.class,
            () -> groupService.removeMember(group.getId(), MEMBER, STRANGER));
    }
}
