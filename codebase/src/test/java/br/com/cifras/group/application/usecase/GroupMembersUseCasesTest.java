package br.com.cifras.group.application.usecase;

import br.com.cifras.BaseIntegrationTest;
import br.com.cifras.group.dto.GroupMemberDTO;
import br.com.cifras.group.dto.GroupInvitationDTO;
import br.com.cifras.group.infra.persistence.repository.GroupInvitationRepository;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.group.model.Group;
import br.com.cifras.group.model.GroupInvitation;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class GroupMembersUseCasesTest extends BaseIntegrationTest {

    @Inject
    CreateGroupUseCase createGroupUseCase;

    @Inject
    AddGroupMemberUseCase addGroupMemberUseCase;

    @Inject
    ListGroupMembersUseCase listGroupMembersUseCase;

    @Inject
    ListGroupInvitationsUseCase listGroupInvitationsUseCase;

    @Inject
    CancelGroupInvitationUseCase cancelGroupInvitationUseCase;

    @Inject
    GroupRepository groupRepository;

    @Inject
    GroupInvitationRepository invitationRepository;

    private static final String OWNER = "member-test-owner-uuid";
    private static final String MEMBER_1 = "member-test-user-1";
    private static final String STRANGER = "member-test-stranger";

    @Test
    @Transactional
    void givenGroupWithMembers_whenListMembers_thenReturnsAllMembers() {
        Group group = createGroupUseCase.execute("Rock Band", OWNER);
        addGroupMemberUseCase.execute(group.getId(), MEMBER_1, OWNER);

        List<GroupMemberDTO> members = listGroupMembersUseCase.execute(group.getId(), OWNER);

        assertNotNull(members);
        assertEquals(2, members.size());
        assertTrue(members.stream().anyMatch(m -> m.userId().equals(OWNER)));
        assertTrue(members.stream().anyMatch(m -> m.userId().equals(MEMBER_1)));
    }

    @Test
    @Transactional
    void givenNonMember_whenListMembers_thenThrowsForbidden() {
        Group group = createGroupUseCase.execute("Secret Band", OWNER);

        assertThrows(ForbiddenException.class, () ->
            listGroupMembersUseCase.execute(group.getId(), STRANGER)
        );
    }

    @Test
    @Transactional
    void givenNonExistentGroup_whenListMembers_thenThrowsNotFound() {
        assertThrows(NotFoundException.class, () ->
            listGroupMembersUseCase.execute(UUID.randomUUID(), OWNER)
        );
    }

    @Test
    @Transactional
    void givenPendingInvitation_whenListGroupInvitations_thenReturnsInvitations() {
        Group group = createGroupUseCase.execute("Jazz Band", OWNER);
        GroupInvitation invite = GroupInvitation.create(group, OWNER, "guitarist@band.com");
        invitationRepository.persist(invite);

        List<GroupInvitationDTO> invites = listGroupInvitationsUseCase.execute(group.getId(), OWNER);

        assertNotNull(invites);
        assertEquals(1, invites.size());
        assertEquals("guitarist@band.com", invites.get(0).inviteeEmail());
    }

    @Test
    @Transactional
    void givenNonOwner_whenListGroupInvitations_thenThrowsForbidden() {
        Group group = createGroupUseCase.execute("Private Band", OWNER);
        addGroupMemberUseCase.execute(group.getId(), MEMBER_1, OWNER);

        assertThrows(ForbiddenException.class, () ->
            listGroupInvitationsUseCase.execute(group.getId(), MEMBER_1)
        );
    }

    @Test
    @Transactional
    void givenValidInvite_whenCancelInvitation_thenInviteDeleted() {
        Group group = createGroupUseCase.execute("Pop Band", OWNER);
        GroupInvitation invite = GroupInvitation.create(group, OWNER, "singer@band.com");
        invitationRepository.persist(invite);

        cancelGroupInvitationUseCase.execute(group.getId(), invite.getId(), OWNER);

        assertTrue(invitationRepository.findById(invite.getId()).isEmpty());
    }

    @Test
    @Transactional
    void givenNonOwner_whenCancelInvitation_thenThrowsForbidden() {
        Group group = createGroupUseCase.execute("Punk Band", OWNER);
        GroupInvitation invite = GroupInvitation.create(group, OWNER, "drummer@band.com");
        invitationRepository.persist(invite);

        assertThrows(ForbiddenException.class, () ->
            cancelGroupInvitationUseCase.execute(group.getId(), invite.getId(), STRANGER)
        );
    }

    @Test
    @Transactional
    void givenMismatchingGroup_whenCancelInvitation_thenThrowsIllegalArgument() {
        Group group1 = createGroupUseCase.execute("Group 1", OWNER);
        Group group2 = createGroupUseCase.execute("Group 2", OWNER);
        GroupInvitation invite = GroupInvitation.create(group1, OWNER, "test@band.com");
        invitationRepository.persist(invite);

        assertThrows(IllegalArgumentException.class, () ->
            cancelGroupInvitationUseCase.execute(group2.getId(), invite.getId(), OWNER)
        );
    }
}
