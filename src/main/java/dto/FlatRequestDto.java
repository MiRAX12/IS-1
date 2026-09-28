package dto;

import entity.Furnish;
import entity.View;

public record FlatRequestDto(
        String name,

        Long coordinatesId,
        CoordinatesDto coordinates,

        Float area,
        Long price,
        Boolean balcony,
        Long timeToMetroOnFoot,
        Integer numberOfRooms,
        Integer floor,
        Furnish furnish,
        View view,

        Long houseId,
        HouseDto house
) {
}
