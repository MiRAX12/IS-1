package rest;

import dto.HouseDto;
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
import service.HouseService;

import java.util.List;

@Path("houses")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class HouseResource {

    @Inject
    private HouseService houseService;

    @GET
    public List<HouseDto> list() {
        return houseService.list();
    }

    @GET
    @Path("{id}/usage")
    public UsageDto usage(@PathParam("id") long id) {
        return houseService.usage(id);
    }

    @DELETE
    @Path("{id}")
    public Response delete(@PathParam("id") long id, @QueryParam("replacementId") Long replacementId) {
        houseService.delete(id, replacementId);
        return Response.noContent().build();
    }
}
