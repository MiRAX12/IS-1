package mappers;
import dto.FlatRequestDto;
import dto.FlatResponseDto;
import entity.Coordinates;
import entity.Flat;
import entity.House;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
public class FlatMapper {

    @Inject
    private CoordinatesMapper coordinatesMapper;

    @Inject
    private HouseMapper houseMapper;

    public FlatResponseDto toDto(Flat entity) {
        if (entity == null) {
            return null;
        }
        return new FlatResponseDto(
                entity.getId(),
                entity.getName(),
                coordinatesMapper.toDto(entity.getCoordinates()),
                entity.getCreationDate(),
                entity.getArea(),
                entity.getPrice(),
                entity.getBalcony(),
                entity.getTimeToMetroOnFoot(),
                entity.getNumberOfRooms(),
                entity.getFloor(),
                entity.getFurnish(),
                entity.getView(),
                houseMapper.toDto(entity.getHouse())
        );
    }

    public List<FlatResponseDto> toDtoList(List<Flat> entities) {
        return entities.stream().map(this::toDto).toList();
    }

    public Flat toEntity(FlatRequestDto dto, Coordinates coordinates, House house) {
        Flat flat = new Flat();
        updateEntity(flat, dto, coordinates, house);
        return flat;
    }

    public void updateEntity(Flat flat, FlatRequestDto dto, Coordinates coordinates, House house) {
        flat.setName(dto.name() != null ? dto.name().trim() : null);
        flat.setCoordinates(coordinates);
        flat.setArea(dto.area());
        flat.setPrice(dto.price());
        flat.setBalcony(dto.balcony());
        flat.setTimeToMetroOnFoot(dto.timeToMetroOnFoot());
        flat.setNumberOfRooms(dto.numberOfRooms());
        flat.setFloor(dto.floor());
        flat.setFurnish(dto.furnish());
        flat.setView(dto.view());
        flat.setHouse(house);
    }
}