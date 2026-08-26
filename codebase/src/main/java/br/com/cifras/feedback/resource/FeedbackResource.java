package br.com.cifras.feedback.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.validation.Valid;


import br.com.cifras.feedback.application.FeedbackService;
import br.com.cifras.feedback.dto.FeedbackCreateDTO;

import io.quarkus.security.Authenticated;

@Path("/feedbacks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class FeedbackResource {

    @Inject
    FeedbackService service;

    @Inject
    br.com.cifras.shared.security.SecurityUtils securityUtils;

    @POST
    public Response submitFeedback(@Valid FeedbackCreateDTO dto) {
        String userId = securityUtils.getCurrentUserId();
        if (userId == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        
        service.submitFeedback(userId, dto.message());
        return Response.status(Response.Status.CREATED).build();
    }
}
