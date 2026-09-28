package service;

import dto.HouseDto;
import dto.UsageDto;
import entity.Flat;
import entity.House;
import events.EntityChangeEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import mappers.HouseMapper;
import repository.FlatRepository;
import repository.HouseRepository;
import validation.FlatValidator;
import validation.ValidationException;

import java.util.List;

@ApplicationScoped
@Transactional
public class HouseService {

    @Inject
    private HouseRepository houseRepository;

    @Inject
    private FlatRepository flatRepository;

    @Inject
    private HouseMapper houseMapper;

    @Inject
    private Event<EntityChangeEvent> events;

    public List<HouseDto> list() {
        return houseMapper.toDtoList(houseRepository.findAll());
    }

    public UsageDto usage(long id) {
        find(id);
        return new UsageDto(flatRepository.countByHouseId(id));
    }

    /**
     * Удаляет дом. Если на него ссылаются квартиры, они перепривязываются
     * к дому replacementId, выбранному пользователем.
     */
    public void delete(long id, Long replacementId) {
        House house = find(id);
        List<Flat> linkedFlats = flatRepository.findByHouseId(id);

        if (!linkedFlats.isEmpty()) {
            if (replacementId == null) {
                throw new ValidationException(List.of("Дом используется в квартирах (" + linkedFlats.size()
                        + " шт.): выберите дом, к которому их нужно привязать"));
            }
            if (replacementId == id) {
                throw new ValidationException(List.of("Дом для замены должен отличаться от удаляемого"));
            }
            House replacement = find(replacementId);
            List<Integer> tooHigh = linkedFlats.stream()
                    .filter(flat -> FlatValidator.isAboveTopFloor(flat.getFloor(), replacement.getNumberOfFloors()))
                    .map(Flat::getId)
                    .toList();
            if (!tooHigh.isEmpty()) {
                throw new ValidationException(List.of("Нельзя привязать квартиры к дому #" + replacementId
                        + ": в нём " + replacement.getNumberOfFloors() + " этаж(ей), а квартиры с id " + tooHigh
                        + " находятся выше. Выберите другой дом"));
            }
            for (Flat flat : linkedFlats) {
                flat.setHouse(replacement);
                events.fire(new EntityChangeEvent(EntityChangeEvent.FLAT, EntityChangeEvent.UPDATED, flat.getId()));
            }
        }

        houseRepository.remove(house);
        events.fire(new EntityChangeEvent(EntityChangeEvent.HOUSE, EntityChangeEvent.DELETED, id));
    }

    private House find(long id) {
        return houseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Дом с id=" + id + " не найден"));
    }
}
