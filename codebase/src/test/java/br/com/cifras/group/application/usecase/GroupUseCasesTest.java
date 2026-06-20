package br.com.cifras.group.application.usecase;

import br.com.cifras.group.model.Group;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

import br.com.cifras.BaseIntegrationTest;

@QuarkusTest
class GroupUseCasesTest extends BaseIntegrationTest {

    @Inject
    CreateGroupUseCase createGroupUseCase;

    @Inject
    AddGroupMemberUseCase addGroupMemberUseCase;

    @Inject
    RemoveGroupMemberUseCase removeGroupMemberUseCase;

    @Inject
    GroupRepository groupRepository;

    private static final String OWNER = "group-owner-uuid";
    private static final String MEMBER = "group-member-uuid";
    private static final String STRANGER = "group-stranger-uuid";

    @Test
    @Transactional
    void givenValidName_whenCreateGroup_thenGroupCreatedWithOwner() {
        Group group = createGroupUseCase.execute("CifrAS Band", OWNER);

        assertNotNull(group.getId());
        assertEquals("CifrAS Band", group.getName());
        assertEquals(OWNER, group.getOwnerId());
        assertTrue(groupRepository.isOwner(group.getId(), OWNER), "Creator must be OWNER");
        assertTrue(groupRepository.isMember(group.getId(), OWNER), "Creator must be a member");
    }

    @Test
    @Transactional
    void givenMemberAdded_whenIsMember_thenReturnsTrue() {
        Group group = createGroupUseCase.execute("Test Group", OWNER);
        addGroupMemberUseCase.execute(group.getId(), MEMBER, OWNER);

        assertTrue(groupRepository.isMember(group.getId(), MEMBER));
        assertFalse(groupRepository.isMember(group.getId(), STRANGER));
    }

    @Test
    @Transactional
    void givenMemberAdded_whenIsOwner_thenReturnsFalseForMember() {
        Group group = createGroupUseCase.execute("Owner Test", OWNER);
        addGroupMemberUseCase.execute(group.getId(), MEMBER, OWNER);

        assertTrue(groupRepository.isOwner(group.getId(), OWNER));
        assertFalse(groupRepository.isOwner(group.getId(), MEMBER));
    }

    @Test
    @Transactional
    void givenOwnerRequest_whenAddMember_thenMemberAdded() {
        Group group = createGroupUseCase.execute("Add Test", OWNER);
        addGroupMemberUseCase.execute(group.getId(), MEMBER, OWNER);

        assertTrue(groupRepository.isMember(group.getId(), MEMBER));
    }

    @Test
    @Transactional
    void givenExistingMember_whenRemoveMember_thenMemberRemoved() {
        Group group = createGroupUseCase.execute("Remove Test", OWNER);
        addGroupMemberUseCase.execute(group.getId(), MEMBER, OWNER);
        removeGroupMemberUseCase.execute(group.getId(), MEMBER, OWNER);

        assertFalse(groupRepository.isMember(group.getId(), MEMBER));
    }

    @Test
    @Transactional
    void givenNonOwner_whenRemoveMember_thenThrowsForbiddenException() {
        Group group = createGroupUseCase.execute("Forbidden Test", OWNER);
        addGroupMemberUseCase.execute(group.getId(), MEMBER, OWNER);

        assertThrows(ForbiddenException.class,
            () -> removeGroupMemberUseCase.execute(group.getId(), MEMBER, STRANGER));
    }
}
