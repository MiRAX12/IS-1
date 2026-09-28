package mappers;
import jakarta.enterprise.context.ApplicationScoped;
import dto.HouseDto;
import entity.House;

import java.util.List;

@ApplicationScoped
public class HouseMapper {

    public HouseDto toDto(House entity) {
        if (entity == null) {
            return null;
        }
        return new HouseDto(entity.getId(), entity.getName(), entity.getYear(), entity.getNumberOfFloors());
    }

    public List<HouseDto> toDtoList(List<House> entities) {
        return entities.stream().map(this::toDto).toList();
    }

    public House toEntity(HouseDto dto) {
        if (dto == null) {
            return null;
        }
        return new House(dto.name(), dto.year(), dto.numberOfFloors());
    }

    public void updateEntity(House entity, HouseDto dto) {
        entity.setName(dto.name());
        entity.setYear(dto.year());
        entity.setNumberOfFloors(dto.numberOfFloors());
    }
}