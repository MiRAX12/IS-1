package dto;

import entity.Furnish;
import entity.View;

import java.time.LocalDateTime;

public record FlatResponseDto(
        int id,
        String name,
        CoordinatesDto coordinates,
        LocalDateTime creationDate,
        Float area,
        Long price,
        Boolean balcony,
        Long timeToMetroOnFoot,
        int numberOfRooms,
        int floor,
        Furnish furnish,
        View view,
        HouseDto house
) {
}
