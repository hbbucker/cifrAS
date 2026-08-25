package br.com.cifras.admin.config;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection(targets = {
    // Shared DTOs
    br.com.cifras.admin.shared.dto.PagedResponseDTO.class,

    // Dashboard DTOs & Models
    br.com.cifras.admin.dashboard.dto.DashboardMetricsDTO.class,
    br.com.cifras.admin.dashboard.dto.RecentActivityDTO.class,
    br.com.cifras.admin.dashboard.model.DashboardMetrics.class,

    // Song DTOs & Models
    br.com.cifras.admin.song.dto.AdminSongDTO.class,
    br.com.cifras.admin.song.model.AdminSong.class,
    br.com.cifras.admin.song.infra.entity.AdminSongEntity.class,

    // User DTOs & Models
    br.com.cifras.admin.user.dto.AdminUserDTO.class,
    br.com.cifras.admin.user.dto.BlockUserRequestDTO.class,
    br.com.cifras.admin.user.dto.UnblockUserRequestDTO.class,
    br.com.cifras.admin.user.dto.UpdateUserRoleRequestDTO.class,
    br.com.cifras.admin.user.model.AdminUser.class,
    br.com.cifras.admin.user.model.UserStatus.class,

    // Audit DTOs & Models & Entities
    br.com.cifras.admin.audit.dto.UserAuditLogDTO.class,
    br.com.cifras.admin.audit.model.UserAuditLog.class,
    br.com.cifras.admin.audit.model.AuditAction.class,
    br.com.cifras.admin.audit.infra.entity.UserAuditLogEntity.class
})
public class NativeReflectionConfig {
}
