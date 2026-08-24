package br.com.cifras.admin.user.resource;

import br.com.cifras.admin.shared.dto.PagedResponseDTO;
import br.com.cifras.admin.shared.security.AdminSecurityUtils;
import br.com.cifras.admin.user.application.GetAdminUserUseCase;
import br.com.cifras.admin.user.application.ListAdminUsersUseCase;
import br.com.cifras.admin.user.dto.AdminUserDTO;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

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
}
