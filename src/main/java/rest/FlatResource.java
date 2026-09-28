package rest;

import dto.FlatPageRequest;
import dto.FlatRequestDto;
import dto.FlatResponseDto;
import dto.PageDto;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import service.FlatService;

@Path("flats")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FlatResource {

    @Inject
    private FlatService flatService;

    @GET
    public PageDto<FlatResponseDto> list(@QueryParam("page") @DefaultValue("0") int page,
                                         @QueryParam("size") @DefaultValue("10") int size,
                                         @QueryParam("sort") @DefaultValue("id") String sort,
                                         @QueryParam("direction") @DefaultValue("asc") String direction,
                                         @QueryParam("name") String name,
                                         @QueryParam("furnish") String furnish,
                                         @QueryParam("view") String view,
                                         @QueryParam("houseName") String houseName) {
        return flatService.list(new FlatPageRequest(page, size, sort, direction, name, furnish, view, houseName));
    }

    @GET
    @Path("{id}")
    public FlatResponseDto get(@PathParam("id") int id) {
        return flatService.get(id);
    }

    @POST
    public Response create(FlatRequestDto dto) {
        return Response.status(Response.Status.CREATED).entity(flatService.create(dto)).build();
    }

    @PUT
    @Path("{id}")
    public FlatResponseDto update(@PathParam("id") int id, FlatRequestDto dto) {
        return flatService.update(id, dto);
    }

    @DELETE
    @Path("{id}")
    public Response delete(@PathParam("id") int id) {
        flatService.delete(id);
        return Response.noContent().build();
    }
}
