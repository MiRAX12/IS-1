package service;

import dto.CoordinatesDto;
import dto.UsageDto;
import entity.Coordinates;
import entity.Flat;
import events.EntityChangeEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import mappers.CoordinatesMapper;
import repository.CoordinatesRepository;
import repository.FlatRepository;
import validation.ValidationException;

import java.util.List;

@ApplicationScoped
@Transactional
public class CoordinatesService {

    @Inject
    private CoordinatesRepository coordinatesRepository;

    @Inject
    private FlatRepository flatRepository;

    @Inject
    private CoordinatesMapper coordinatesMapper;

    @Inject
    private Event<EntityChangeEvent> events;

    public List<CoordinatesDto> list() {
        return coordinatesMapper.toDtoList(coordinatesRepository.findAll());
    }

    public UsageDto usage(long id) {
        find(id);
        return new UsageDto(flatRepository.countByCoordinatesId(id));
    }

    /**
     * Удаляет координаты. Если на них ссылаются квартиры, они перепривязываются
     * к координатам replacementId, выбранным пользователем.
     */
    public void delete(long id, Long replacementId) {
        Coordinates coordinates = find(id);
        List<Flat> linkedFlats = flatRepository.findByCoordinatesId(id);

        if (!linkedFlats.isEmpty()) {
            if (replacementId == null) {
                throw new ValidationException(List.of("Координаты используются в квартирах (" + linkedFlats.size()
                        + " шт.): выберите координаты, к которым их нужно привязать"));
            }
            if (replacementId == id) {
                throw new ValidationException(List.of("Координаты для замены должны отличаться от удаляемых"));
            }
            Coordinates replacement = find(replacementId);
            for (Flat flat : linkedFlats) {
                flat.setCoordinates(replacement);
                events.fire(new EntityChangeEvent(EntityChangeEvent.FLAT, EntityChangeEvent.UPDATED, flat.getId()));
            }
        }

        coordinatesRepository.remove(coordinates);
        events.fire(new EntityChangeEvent(EntityChangeEvent.COORDINATES, EntityChangeEvent.DELETED, id));
    }

    private Coordinates find(long id) {
        return coordinatesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Координаты с id=" + id + " не найдены"));
    }
}
