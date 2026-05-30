package br.com.cifras.group.application.usecase;

import br.com.cifras.group.infra.persistence.entity.GroupEntity;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * T13: GroupService integration tests
 * Tests: 6
 * 1. createGroup() creates group and sets creator as OWNER
 * 2. isMember() returns true for group members
 * 3. isOwner() returns true only for owner
 * 4. addMember() adds a new member
 * 5. removeMember() removes existing member
 * 6. removeMember() throws ForbiddenException if non-owner tries to remove
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
        GroupEntity group = groupService.createGroup("CifrAS Band", OWNER);

        assertNotNull(group.id);
        assertEquals("CifrAS Band", group.name);
        assertEquals(OWNER, group.ownerId);
        assertTrue(groupService.isOwner(group.id, OWNER), "Creator must be OWNER");
        assertTrue(groupService.isMember(group.id, OWNER), "Creator must be a member");
    }

    /**
     * Test 2: isMember() correctly identifies members.
     */
    @Test
    @Transactional
    void givenMemberAdded_whenIsMember_thenReturnsTrue() {
        GroupEntity group = groupService.createGroup("Test GroupEntity", OWNER);
        groupService.addMember(group.id, MEMBER, OWNER);

        assertTrue(groupService.isMember(group.id, MEMBER));
        assertFalse(groupService.isMember(group.id, STRANGER));
    }

    /**
     * Test 3: isOwner() returns false for regular members.
     */
    @Test
    @Transactional
    void givenMemberAdded_whenIsOwner_thenReturnsFalseForMember() {
        GroupEntity group = groupService.createGroup("Owner Test", OWNER);
        groupService.addMember(group.id, MEMBER, OWNER);

        assertTrue(groupService.isOwner(group.id, OWNER));
        assertFalse(groupService.isOwner(group.id, MEMBER));
    }

    /**
     * Test 4: addMember() adds user with MEMBER role.
     */
    @Test
    @Transactional
    void givenOwnerRequest_whenAddMember_thenMemberAdded() {
        GroupEntity group = groupService.createGroup("Add Test", OWNER);
        groupService.addMember(group.id, MEMBER, OWNER);

        assertTrue(groupService.isMember(group.id, MEMBER));
    }

    /**
     * Test 5: removeMember() removes a member from the group.
     */
    @Test
    @Transactional
    void givenExistingMember_whenRemoveMember_thenMemberRemoved() {
        GroupEntity group = groupService.createGroup("Remove Test", OWNER);
        groupService.addMember(group.id, MEMBER, OWNER);
        groupService.removeMember(group.id, MEMBER, OWNER);

        assertFalse(groupService.isMember(group.id, MEMBER));
    }

    /**
     * Test 6: Non-owner cannot remove members.
     */
    @Test
    @Transactional
    void givenNonOwner_whenRemoveMember_thenThrowsForbiddenException() {
        GroupEntity group = groupService.createGroup("Forbidden Test", OWNER);
        groupService.addMember(group.id, MEMBER, OWNER);

        assertThrows(ForbiddenException.class,
            () -> groupService.removeMember(group.id, MEMBER, STRANGER));
    }
}
