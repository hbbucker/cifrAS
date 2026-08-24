package br.com.cifras.admin.user.application;

import br.com.cifras.admin.shared.dto.PagedResponseDTO;
import br.com.cifras.admin.user.dto.AdminUserDTO;
import br.com.cifras.admin.user.infra.mapper.AdminUserMapper;
import br.com.cifras.admin.user.infra.repository.AdminUserRepository;
import br.com.cifras.admin.user.model.AdminUser;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
public class ListAdminUsersUseCase {

    @Inject
    AdminUserRepository userRepository;

    @Inject
    AdminUserMapper userMapper;

    public PagedResponseDTO<AdminUserDTO> execute(String search, int page, int pageSize) {
        int safePage = Math.max(0, page);
        int safePageSize = pageSize > 0 && pageSize <= 100 ? pageSize : 20;

        List<AdminUser> users = userRepository.findUsers(search, safePage, safePageSize);
        long total = userRepository.countUsers(search);
        List<AdminUserDTO> dtos = userMapper.toDTOList(users);

        return PagedResponseDTO.of(dtos, total, safePage, safePageSize);
    }
}
