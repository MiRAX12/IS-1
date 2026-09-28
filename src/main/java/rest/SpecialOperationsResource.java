package rest;

import dto.FlatResponseDto;
import dto.NumberResultDto;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import service.SpecialOperationsService;
import validation.ValidationException;

import java.util.ArrayList;
import java.util.List;

@Path("special")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class SpecialOperationsResource {

    @Inject
    private SpecialOperationsService specialOperationsService;

    @GET
    @Path("rooms-sum")
    public NumberResultDto roomsSum() {
        return new NumberResultDto(specialOperationsService.sumNumberOfRooms());
    }

    @GET
    @Path("floor-average")
    public NumberResultDto floorAverage() {
        return new NumberResultDto(specialOperationsService.averageFloor());
    }

    @GET
    @Path("name-prefix")
    public List<FlatResponseDto> byNamePrefix(@QueryParam("prefix") String prefix) {
        return specialOperationsService.findByNamePrefix(prefix);
    }

    @GET
    @Path("cheapest")
    public FlatResponseDto cheapest(@QueryParam("id1") Integer id1,
                                    @QueryParam("id2") Integer id2) {
        requireIds(id1, id2);
        return specialOperationsService.cheapest(id1, id2);
    }

    @GET
    @Path("most-expensive")
    public FlatResponseDto mostExpensive(@QueryParam("id1") Integer id1,
                                         @QueryParam("id2") Integer id2,
                                         @QueryParam("id3") Integer id3) {
        requireIds(id1, id2, id3);
        return specialOperationsService.mostExpensive(id1, id2, id3);
    }

    private static void requireIds(Integer... ids) {
        List<String> errors = new ArrayList<>();
        for (int i = 0; i < ids.length; i++) {
            if (ids[i] == null) {
                errors.add("Укажите id" + (i + 1));
            }
        }
        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }
    }
}
