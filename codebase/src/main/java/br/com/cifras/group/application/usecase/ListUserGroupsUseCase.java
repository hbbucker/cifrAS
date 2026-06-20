package br.com.cifras.group.application.usecase;

import br.com.cifras.group.model.Group;
import br.com.cifras.group.infra.persistence.repository.GroupRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;

@ApplicationScoped
public class ListUserGroupsUseCase {

    @Inject
    GroupRepository groupRepository;

    public List<Group> execute(String userId) {
        return groupRepository.listGroupsByUser(userId);
    }
}
