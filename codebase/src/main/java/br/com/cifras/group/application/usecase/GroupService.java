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
        Group group = new Group();
        group.name = name;
        group.ownerId = ownerId;
        groupRepository.persist(group);

        GroupMember owner = new GroupMember();
        owner.group = group;
        owner.userId = ownerId;
        owner.role = GroupRole.OWNER;
        owner.joinedAt = Instant.now();
        groupRepository.persistMember(owner);

        return group;
    }

    @Transactional
    public void addMember(UUID groupId, String targetUserId, String requestingUserId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found"));
        if (!isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can add members");

        GroupMember member = new GroupMember();
        member.group = group;
        member.userId = targetUserId;
        member.role = GroupRole.MEMBER;
        member.joinedAt = Instant.now();
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

        GroupInvitation invite = new GroupInvitation();
        invite.group = group;
        invite.inviterId = requestingUserId;
        invite.inviteeEmail = targetEmail;
        invite.status = GroupInvitationStatus.PENDING;
        invitationRepository.persist(invite);
    }

    @Transactional
    public void acceptInvite(UUID inviteId, String currentUserEmail, String currentUserId) {
        GroupInvitation invite = invitationRepository.findById(inviteId).orElseThrow(() -> new NotFoundException("Invitation not found"));
        if (!invite.inviteeEmail.equalsIgnoreCase(currentUserEmail)) {
            throw new NotFoundException("Invitation not found");
        }
        if (invite.status != GroupInvitationStatus.PENDING) {
            throw new IllegalArgumentException("Invitation is not pending");
        }
        invite.status = GroupInvitationStatus.ACCEPTED;
        invitationRepository.update(invite);
        
        if (!isMember(invite.group.id, currentUserId)) {
            GroupMember member = new GroupMember();
            member.group = invite.group;
            member.userId = currentUserId;
            member.role = GroupRole.MEMBER;
            member.joinedAt = Instant.now();
            groupRepository.persistMember(member);
        }
    }

    @Transactional
    public void declineInvite(UUID inviteId, String currentUserEmail) {
        GroupInvitation invite = invitationRepository.findById(inviteId).orElseThrow(() -> new NotFoundException("Invitation not found"));
        if (!invite.inviteeEmail.equalsIgnoreCase(currentUserEmail)) {
            throw new NotFoundException("Invitation not found");
        }
        if (invite.status != GroupInvitationStatus.PENDING) {
            throw new IllegalArgumentException("Invitation is not pending");
        }
        invite.status = GroupInvitationStatus.DECLINED;
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
        if (invite != null && invite.inviterId.equals(inviterId)) {
            invitationRepository.delete(invite.id);
        }
    }

    @Transactional
    public void removeMember(UUID groupId, String targetUserId, String requestingUserId) {
        if (!isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can remove members");
        GroupMember member = groupRepository.findMember(groupId, targetUserId)
            .orElseThrow(() -> new NotFoundException("Member not found"));
        groupRepository.deleteMember(member.id);
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

        if (!playlist.userId.equals(requestingUserId)) throw new ForbiddenException("Only the playlist owner can link it");

        // Use the mapped reference but be careful as the POJO isn't an Entity instance directly
        br.com.cifras.group.infra.persistence.entity.GroupEntity groupEntity = new br.com.cifras.group.infra.persistence.entity.GroupEntity();
        groupEntity.id = group.id; // Just need the ID for the foreign key reference
        playlist.group = groupEntity;
        
        playlist.isCollaborative = true;
        playlistRepository.update(playlist);
    }

    @Transactional
    public void unlinkPlaylist(UUID groupId, UUID playlistId, String requestingUserId) {
        if (!isOwner(groupId, requestingUserId)) throw new ForbiddenException("Only OWNER can unlink playlists from the group");

        Playlist playlist = playlistRepository.findActiveById(playlistId).orElse(null);
        if (playlist == null) throw new NotFoundException("Playlist not found");

        if (playlist.group == null || !playlist.group.id.equals(groupId)) {
            throw new IllegalArgumentException("Playlist is not linked to this group");
        }

        playlist.group = null;
        playlist.isCollaborative = false;
        playlistRepository.update(playlist);
    }

    public List<Playlist> listGroupPlaylists(UUID groupId, String requestingUserId) {
        if (!isMember(groupId, requestingUserId)) throw new ForbiddenException("Only members can view group playlists");
        
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found"));

        return playlistRepository.findCollaborativeActive(requestingUserId).stream()
                .filter(p -> p.group != null && p.group.id.equals(groupId))
                .toList();
    }
}
