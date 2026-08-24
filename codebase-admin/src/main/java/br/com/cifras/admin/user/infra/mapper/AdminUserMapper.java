package br.com.cifras.admin.user.infra.mapper;

import br.com.cifras.admin.user.dto.AdminUserDTO;
import br.com.cifras.admin.user.model.AdminUser;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class AdminUserMapper {

    public AdminUserDTO toDTO(AdminUser user) {
        if (user == null) return null;
        return new AdminUserDTO(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            user.getCreatedAt(),
            user.getLastSignInAt(),
            user.getSongCount(),
            user.isBanned(),
            user.isAdmin()
        );
    }

    public List<AdminUserDTO> toDTOList(List<AdminUser> users) {
        if (users == null) return List.of();
        return users.stream().map(this::toDTO).toList();
    }
}
