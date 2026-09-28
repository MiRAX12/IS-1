package dto;

public record HouseDto(
        Long id,
        String name,
        Integer year,
        Integer numberOfFloors
) {
}
