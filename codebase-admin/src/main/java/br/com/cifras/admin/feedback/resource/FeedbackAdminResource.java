package br.com.cifras.admin.feedback.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.validation.Valid;

import br.com.cifras.admin.feedback.application.FeedbackAdminService;
import br.com.cifras.admin.feedback.dto.FeedbackReplyDTO;
import java.util.UUID;

@Path("/admin/feedbacks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FeedbackAdminResource {

    @Inject
    FeedbackAdminService service;

    @Inject
    br.com.cifras.admin.shared.security.AdminSecurityUtils securityUtils;

    @GET
    public Response listFeedbacks() {
        securityUtils.requireAdmin();
        return Response.ok(service.listAllFeedbacks()).build();
    }

    @PUT
    @Path("/{id}/reply")
    public Response replyToFeedback(@PathParam("id") UUID id, @Valid FeedbackReplyDTO dto) {
        securityUtils.requireAdmin();
        boolean updated = service.replyToFeedback(id, dto.replyMessage());
        if (!updated) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok().build();
    }
}
