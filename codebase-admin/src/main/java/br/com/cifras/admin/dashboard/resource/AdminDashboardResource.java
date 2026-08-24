package br.com.cifras.admin.dashboard.resource;

import br.com.cifras.admin.dashboard.application.GetDashboardMetricsUseCase;
import br.com.cifras.admin.dashboard.application.GetRecentActivityUseCase;
import br.com.cifras.admin.dashboard.dto.DashboardMetricsDTO;
import br.com.cifras.admin.dashboard.dto.RecentActivityDTO;
import br.com.cifras.admin.shared.security.AdminSecurityUtils;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/admin/dashboard")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AdminDashboardResource {

    @Inject
    AdminSecurityUtils securityUtils;

    @Inject
    GetDashboardMetricsUseCase getDashboardMetricsUseCase;

    @Inject
    GetRecentActivityUseCase getRecentActivityUseCase;

    @GET
    @Path("/metrics")
    public Response getMetrics() {
        securityUtils.requireAdmin();
        DashboardMetricsDTO metrics = getDashboardMetricsUseCase.execute();
        return Response.ok(metrics).build();
    }

    @GET
    @Path("/recent-activity")
    public Response getRecentActivity(@QueryParam("limit") @DefaultValue("10") int limit) {
        securityUtils.requireAdmin();
        List<RecentActivityDTO> activities = getRecentActivityUseCase.execute(Math.min(limit, 50));
        return Response.ok(activities).build();
    }
}
