package br.com.cifras.group.application.usecase;

import br.com.cifras.group.model.Group;
import br.com.cifras.group.model.GroupMember;
import br.com.cifras.group.model.GroupRole;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.group.infra.persistence.repository.GroupInvitationRepository;
import br.com.cifras.group.model.GroupInvitation;
import br.com.cifras.group.model.GroupInvitationStatus;
import br.com.cifras.shared.security.UserService;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.playlist.model.Playlist;
import br.com.cifras.playlist.infra.persistence.repository.PlaylistRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class GroupService {

    @Inject
    GroupRepository groupRepository;

    @Inject
    GroupInvitationRepository invitationRepository;

    @Inject
    UserService userService;

    @Inject
    PlaylistRepository playlistRepository;

    public boolean isMember(UUID groupId, String userId) {
        return groupRepository.isMember(groupId, userId);
    }

    public boolean isOwner(UUID groupId, String userId) {
        return groupRepository.isOwner(groupId, userId);
    }

    @Transactional
    public Group createGroup(String name, String ownerId) {
        Group group = Group.create(name, ownerId);
        groupRepository.persist(group);

        GroupMember owner = GroupMember.create(group, ownerId, GroupRole.OWNER);
        groupRepository.persistMember(owner);

        return group;
    }

    @Transactional
    public void addMember(UUID groupId, String targetUserId, String requestingUserId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found"));
        if (!isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can add members");

        GroupMember member = GroupMember.create(group, targetUserId, GroupRole.MEMBER);
        groupRepository.persistMember(member);
    }

    @Transactional
    public void inviteMember(UUID groupId, String targetEmail, String requestingUserId) {
        if (!isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can invite members");
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found"));

        String targetUserId = userService.getUserIdByEmail(targetEmail);
        if (targetUserId == null) {
            throw new IllegalArgumentException("User with provided email is not registered.");
        }
        
        if (isMember(groupId, targetUserId)) {
            throw new IllegalArgumentException("User is already a member of this group.");
        }

        GroupInvitation invite = GroupInvitation.create(group, requestingUserId, targetEmail);
        invitationRepository.persist(invite);
    }

    @Transactional
    public void acceptInvite(UUID inviteId, String currentUserEmail, String currentUserId) {
        GroupInvitation invite = invitationRepository.findById(inviteId).orElseThrow(() -> new NotFoundException("Invitation not found"));
        if (!invite.getInviteeEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new NotFoundException("Invitation not found");
        }
        if (invite.getStatus() != GroupInvitationStatus.PENDING) {
            throw new IllegalArgumentException("Invitation is not pending");
        }
        invite.accept();
        invitationRepository.update(invite);
        
        if (!isMember(invite.getGroup().getId(), currentUserId)) {
            GroupMember member = GroupMember.create(invite.getGroup(), currentUserId, GroupRole.MEMBER);
            groupRepository.persistMember(member);
        }
    }

    @Transactional
    public void declineInvite(UUID inviteId, String currentUserEmail) {
        GroupInvitation invite = invitationRepository.findById(inviteId).orElseThrow(() -> new NotFoundException("Invitation not found"));
        if (!invite.getInviteeEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new NotFoundException("Invitation not found");
        }
        if (invite.getStatus() != GroupInvitationStatus.PENDING) {
            throw new IllegalArgumentException("Invitation is not pending");
        }
        invite.reject();
        invitationRepository.update(invite);
    }

    public List<GroupInvitation> getPendingInvites(String email) {
        return invitationRepository.findPendingByEmail(email);
    }

    public List<GroupInvitation> getDeclinedInvites(String inviterId) {
        return invitationRepository.findByInviterIdAndStatus(inviterId, GroupInvitationStatus.DECLINED);
    }

    @Transactional
    public void dismissInvite(UUID inviteId, String inviterId) {
        GroupInvitation invite = invitationRepository.findById(inviteId).orElse(null);
        if (invite != null && invite.getInviterId().equals(inviterId)) {
            invitationRepository.delete(invite.getId());
        }
    }

    @Transactional
    public void removeMember(UUID groupId, String targetUserId, String requestingUserId) {
        if (!isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can remove members");
        GroupMember member = groupRepository.findMember(groupId, targetUserId)
            .orElseThrow(() -> new NotFoundException("Member not found"));
        groupRepository.deleteMember(member.getId());
    }

    public List<Group> listGroupsByUser(String userId) {
        return groupRepository.listGroupsByUser(userId);
    }

    @Transactional
    public void linkPlaylist(UUID groupId, UUID playlistId, String requestingUserId) {
        if (!isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can link playlists to the group");
        
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found"));

        Playlist playlist = playlistRepository.findActiveById(playlistId).orElse(null);
        if (playlist == null) throw new NotFoundException("Playlist not found");

        if (!playlist.getUserId().equals(requestingUserId)) throw new ForbiddenException("Only the playlist owner can link it");

        playlist.makeCollaborative(group);
        playlistRepository.update(playlist);
    }

    @Transactional
    public void unlinkPlaylist(UUID groupId, UUID playlistId, String requestingUserId) {
        if (!isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can unlink playlists from the group");

        Playlist playlist = playlistRepository.findActiveById(playlistId).orElse(null);
        if (playlist == null) throw new NotFoundException("Playlist not found");

        if (playlist.getGroup() == null || !playlist.getGroup().getId().equals(groupId)) {
            throw new IllegalArgumentException("Playlist is not linked to this group");
        }

        playlist.removeCollaborative();
        playlistRepository.update(playlist);
    }

    public List<Playlist> listGroupPlaylists(UUID groupId, String requestingUserId) {
        if (!isMember(groupId, requestingUserId)) throw new ForbiddenException("Only members can view group playlists");
        
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found"));

        return playlistRepository.findCollaborativeActive(requestingUserId).stream()
                .filter(p -> p.getGroup() != null && p.getGroup().getId().equals(groupId))
                .toList();
    }
}
