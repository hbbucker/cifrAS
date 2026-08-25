package br.com.cifras.admin.user.resource;

import br.com.cifras.admin.audit.application.GetUserAuditLogsUseCase;
import br.com.cifras.admin.audit.dto.UserAuditLogDTO;
import br.com.cifras.admin.shared.dto.PagedResponseDTO;
import br.com.cifras.admin.shared.security.AdminSecurityUtils;
import br.com.cifras.admin.user.application.BlockUserUseCase;
import br.com.cifras.admin.user.application.GetAdminUserUseCase;
import br.com.cifras.admin.user.application.ListAdminUsersUseCase;
import br.com.cifras.admin.user.application.UnblockUserUseCase;
import br.com.cifras.admin.user.dto.AdminUserDTO;
import br.com.cifras.admin.user.dto.BlockUserRequestDTO;
import br.com.cifras.admin.user.dto.UnblockUserRequestDTO;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/admin/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AdminUserResource {

    @Inject
    AdminSecurityUtils securityUtils;

    @Inject
    ListAdminUsersUseCase listAdminUsersUseCase;

    @Inject
    GetAdminUserUseCase getAdminUserUseCase;

    @Inject
    BlockUserUseCase blockUserUseCase;

    @Inject
    UnblockUserUseCase unblockUserUseCase;

    @Inject
    GetUserAuditLogsUseCase getUserAuditLogsUseCase;

    @GET
    public Response listUsers(
            @QueryParam("search") String search,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("20") int pageSize) {
        securityUtils.requireAdmin();
        PagedResponseDTO<AdminUserDTO> response = listAdminUsersUseCase.execute(search, page, pageSize);
        return Response.ok(response).build();
    }

    @GET
    @Path("/{id}")
    public Response getUser(@PathParam("id") String id) {
        securityUtils.requireAdmin();
        AdminUserDTO user = getAdminUserUseCase.execute(id);
        return Response.ok(user).build();
    }

    @POST
    @Path("/{id}/block")
    public Response blockUser(@PathParam("id") String id, @Valid BlockUserRequestDTO request) {
        securityUtils.requireAdmin();
        String reason = request != null ? request.reason() : null;
        AdminUserDTO user = blockUserUseCase.execute(id, reason);
        return Response.ok(user).build();
    }

    @POST
    @Path("/{id}/unblock")
    public Response unblockUser(@PathParam("id") String id, UnblockUserRequestDTO request) {
        securityUtils.requireAdmin();
        String reason = request != null ? request.reason() : null;
        AdminUserDTO user = unblockUserUseCase.execute(id, reason);
        return Response.ok(user).build();
    }

    @GET
    @Path("/{id}/audit-logs")
    public Response getAuditLogs(@PathParam("id") String id) {
        securityUtils.requireAdmin();
        List<UserAuditLogDTO> logs = getUserAuditLogsUseCase.execute(id);
        return Response.ok(logs).build();
    }
}
