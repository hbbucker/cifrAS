package br.com.cifras.admin.user.application;

import br.com.cifras.admin.shared.exception.ResourceNotFoundException;
import br.com.cifras.admin.user.dto.AdminUserDTO;
import br.com.cifras.admin.user.infra.mapper.AdminUserMapper;
import br.com.cifras.admin.user.infra.repository.AdminUserRepository;
import br.com.cifras.admin.user.model.AdminUser;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class GetAdminUserUseCase {

    @Inject
    AdminUserRepository userRepository;

    @Inject
    AdminUserMapper userMapper;

    public AdminUserDTO execute(String id) {
        AdminUser user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return userMapper.toDTO(user);
    }
}
