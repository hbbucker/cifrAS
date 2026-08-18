package br.com.cifras.group.application.usecase;

import br.com.cifras.group.dto.GroupMemberDTO;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import br.com.cifras.group.model.Group;
import br.com.cifras.group.model.GroupMember;
import br.com.cifras.shared.exception.ForbiddenException;
import br.com.cifras.shared.exception.NotFoundException;
import br.com.cifras.shared.security.UserService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class ListGroupMembersUseCase {

    @Inject
    GroupRepository groupRepository;

    @Inject
    UserService userService;

    public List<GroupMemberDTO> execute(UUID groupId, String requestingUserId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));

        if (!groupRepository.isMember(groupId, requestingUserId)) {
            throw new ForbiddenException("Only group members can view the member list.");
        }

        List<GroupMember> members = groupRepository.findMembersByGroupId(groupId);
        List<String> userIds = members.stream().map(GroupMember::getUserId).toList();
        Map<String, UserService.UserProfile> profiles = userService.findUserProfilesByIds(userIds);

        return members.stream().map(member -> {
            UserService.UserProfile profile = profiles.get(member.getUserId());
            String email = profile != null ? profile.email() : member.getUserId() + "@user.com";
            String name = profile != null ? profile.name() : "User " + member.getUserId();
            return GroupMemberDTO.from(member, email, name);
        }).toList();
    }
}
