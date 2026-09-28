package mappers;
import jakarta.enterprise.context.ApplicationScoped;

import dto.CoordinatesDto;
import entity.Coordinates;

import java.util.List;

@ApplicationScoped
public class CoordinatesMapper {

    public CoordinatesDto toDto(Coordinates entity) {
        if (entity == null) {
            return null;
        }
        return new CoordinatesDto(entity.getId(), entity.getX(), entity.getY());
    }

    public List<CoordinatesDto> toDtoList(List<Coordinates> entities) {
        return entities.stream().map(this::toDto).toList();
    }

    public Coordinates toEntity(CoordinatesDto dto) {
        if (dto == null) {
            return null;
        }
        return new Coordinates(dto.x(), dto.y());
    }

    public void updateEntity(Coordinates entity, CoordinatesDto dto) {
        entity.setX(dto.x());
        entity.setY(dto.y());
    }
}