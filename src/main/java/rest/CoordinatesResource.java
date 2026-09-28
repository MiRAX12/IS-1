package rest;

import dto.CoordinatesDto;
import dto.UsageDto;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import service.CoordinatesService;

import java.util.List;

@Path("coordinates")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class CoordinatesResource {

    @Inject
    private CoordinatesService coordinatesService;

    @GET
    public List<CoordinatesDto> list() {
        return coordinatesService.list();
    }

    @GET
    @Path("{id}/usage")
    public UsageDto usage(@PathParam("id") long id) {
        return coordinatesService.usage(id);
    }

    @DELETE
    @Path("{id}")
    public Response delete(@PathParam("id") long id, @QueryParam("replacementId") Long replacementId) {
        coordinatesService.delete(id, replacementId);
        return Response.noContent().build();
    }
}
