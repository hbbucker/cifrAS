package br.com.cifras.group.service;

import br.com.cifras.group.domain.Group;
import br.com.cifras.group.domain.GroupMember;
import br.com.cifras.group.domain.GroupRole;
import br.com.cifras.group.repository.GroupRepository;
import br.com.cifras.group.repository.GroupInvitationRepository;
import br.com.cifras.group.domain.GroupInvitation;
import br.com.cifras.group.domain.GroupInvitationStatus;
import br.com.cifras.shared.security.UserService;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.playlist.domain.Playlist;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * GroupService — group management and membership control.
 */
@ApplicationScoped
public class GroupService {

    @Inject
    GroupRepository groupRepository;

    @Inject
    GroupInvitationRepository invitationRepository;

    @Inject
    UserService userService;

    public boolean isMember(UUID groupId, String userId) {
        return groupRepository.isMember(groupId, userId);
    }

    public boolean isOwner(UUID groupId, String userId) {
        return groupRepository.isOwner(groupId, userId);
    }

    @Transactional
    public Group createGroup(String name, String ownerId) {
        Group group = new Group();
        group.name = name;
        group.ownerId = ownerId;
        group.persist();

        // Add the creator as OWNER member
        GroupMember owner = new GroupMember();
        owner.group = group;
        owner.userId = ownerId;
        owner.role = GroupRole.OWNER;
        owner.persist();

        return group;
    }

    @Transactional
    public void addMember(UUID groupId, String targetUserId, String requestingUserId) {
        Group group = Group.findById(groupId);
        if (group == null) throw new NotFoundException("Group not found");
        if (!isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can invite members");

        GroupMember member = new GroupMember();
        member.group = group;
        member.userId = targetUserId;
        member.role = GroupRole.MEMBER;
        member.persist();
    }

    @Transactional
    public void inviteMember(UUID groupId, String targetEmail, String requestingUserId) {
        if (!isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can invite members");
        Group group = Group.findById(groupId);
        if (group == null) throw new NotFoundException("Group not found");

        String targetUserId = userService.getUserIdByEmail(targetEmail);
        if (targetUserId == null) {
            throw new IllegalArgumentException("User with provided email is not registered.");
        }
        
        if (isMember(groupId, targetUserId)) {
            throw new IllegalArgumentException("User is already a member of this group.");
        }

        GroupInvitation invite = new GroupInvitation();
        invite.group = group;
        invite.inviterId = requestingUserId;
        invite.inviteeEmail = targetEmail;
        invite.status = GroupInvitationStatus.PENDING;
        invitationRepository.persist(invite);
    }

    @Transactional
    public void acceptInvite(UUID inviteId, String currentUserEmail, String currentUserId) {
        GroupInvitation invite = invitationRepository.findById(inviteId);
        if (invite == null || !invite.inviteeEmail.equalsIgnoreCase(currentUserEmail)) {
            throw new NotFoundException("Invitation not found");
        }
        if (invite.status != GroupInvitationStatus.PENDING) {
            throw new IllegalArgumentException("Invitation is not pending");
        }
        invite.status = GroupInvitationStatus.ACCEPTED;
        
        if (!isMember(invite.group.id, currentUserId)) {
            GroupMember member = new GroupMember();
            member.group = invite.group;
            member.userId = currentUserId;
            member.role = GroupRole.MEMBER;
            member.persist();
        }
    }

    @Transactional
    public void declineInvite(UUID inviteId, String currentUserEmail) {
        GroupInvitation invite = invitationRepository.findById(inviteId);
        if (invite == null || !invite.inviteeEmail.equalsIgnoreCase(currentUserEmail)) {
            throw new NotFoundException("Invitation not found");
        }
        if (invite.status != GroupInvitationStatus.PENDING) {
            throw new IllegalArgumentException("Invitation is not pending");
        }
        invite.status = GroupInvitationStatus.DECLINED;
    }

    public List<GroupInvitation> getPendingInvites(String email) {
        return invitationRepository.findPendingByEmail(email);
    }

    public List<GroupInvitation> getDeclinedInvites(String inviterId) {
        return invitationRepository.list("inviterId = ?1 and status = ?2", inviterId, GroupInvitationStatus.DECLINED);
    }

    @Transactional
    public void dismissInvite(UUID inviteId, String inviterId) {
        GroupInvitation invite = invitationRepository.findById(inviteId);
        if (invite != null && invite.inviterId.equals(inviterId)) {
            invite.delete();
        }
    }

    @Transactional
    public void removeMember(UUID groupId, String targetUserId, String requestingUserId) {
        if (!isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can remove members");
        GroupMember member = groupRepository.findMember(groupId, targetUserId)
            .orElseThrow(() -> new NotFoundException("Member not found"));
        member.delete();
    }

    public List<Group> listGroupsByUser(String userId) {
        return GroupMember.<GroupMember>list("userId", userId)
            .stream().map(m -> m.group).toList();
    }

    @Transactional
    public void linkPlaylist(UUID groupId, UUID playlistId, String requestingUserId) {
        if (!isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can link playlists to the group");
        
        Group group = Group.findById(groupId);
        if (group == null) throw new NotFoundException("Group not found");

        Playlist playlist = Playlist.findById(playlistId);
        if (playlist == null) throw new NotFoundException("Playlist not found");

        if (!playlist.userId.equals(requestingUserId)) throw new ForbiddenException("Only the playlist owner can link it");

        playlist.group = group;
        playlist.isCollaborative = true;
    }

    @Transactional
    public void unlinkPlaylist(UUID groupId, UUID playlistId, String requestingUserId) {
        if (!isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can unlink playlists from the group");

        Playlist playlist = Playlist.findById(playlistId);
        if (playlist == null) throw new NotFoundException("Playlist not found");

        if (playlist.group == null || !playlist.group.id.equals(groupId)) {
            throw new IllegalArgumentException("Playlist is not linked to this group");
        }

        playlist.group = null;
        playlist.isCollaborative = false;
    }

    public List<Playlist> listGroupPlaylists(UUID groupId, String requestingUserId) {
        if (!isMember(groupId, requestingUserId)) throw new ForbiddenException("Only members can view group playlists");
        
        Group group = Group.findById(groupId);
        if (group == null) throw new NotFoundException("Group not found");

        return Playlist.list("group.id = ?1 and deletedAt is null", groupId);
    }
}
