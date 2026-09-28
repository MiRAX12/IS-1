package service;

import dto.FlatPageRequest;
import dto.FlatRequestDto;
import dto.FlatResponseDto;
import dto.PageDto;
import entity.Coordinates;
import entity.Flat;
import entity.Furnish;
import entity.House;
import entity.View;
import events.EntityChangeEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import mappers.CoordinatesMapper;
import mappers.FlatMapper;
import mappers.HouseMapper;
import repository.CoordinatesRepository;
import repository.FlatFilter;
import repository.FlatRepository;
import repository.HouseRepository;
import validation.FlatValidator;
import validation.ValidationException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@ApplicationScoped
@Transactional
public class FlatService {

    private static final int MAX_PAGE_SIZE = 100;

    @Inject
    private FlatRepository flatRepository;

    @Inject
    private CoordinatesRepository coordinatesRepository;

    @Inject
    private HouseRepository houseRepository;

    @Inject
    private FlatMapper flatMapper;

    @Inject
    private CoordinatesMapper coordinatesMapper;

    @Inject
    private HouseMapper houseMapper;

    @Inject
    private FlatValidator validator;

    @Inject
    private Event<EntityChangeEvent> events;

    public PageDto<FlatResponseDto> list(FlatPageRequest request) {
        List<String> errors = new ArrayList<>();
        if (request.page() < 0) {
            errors.add("Номер страницы не может быть отрицательным");
        }
        if (request.size() < 1 || request.size() > MAX_PAGE_SIZE) {
            errors.add("Размер страницы должен быть от 1 до " + MAX_PAGE_SIZE);
        }
        String sort = request.sort() == null || request.sort().isBlank() ? "id" : request.sort();
        if (!FlatRepository.isSortable(sort)) {
            errors.add("Нельзя сортировать по полю «" + sort + "»");
        }
        boolean ascending = !"desc".equalsIgnoreCase(request.direction());
        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }

        FlatFilter filter = new FlatFilter(
                blankToNull(request.name()),
                matchingConstants(Furnish.class, request.furnish()),
                matchingConstants(View.class, request.view()),
                blankToNull(request.houseName())
        );
        List<Flat> flats = flatRepository.findPage(filter, sort, ascending, request.page(), request.size());
        long total = flatRepository.count(filter);
        return new PageDto<>(flatMapper.toDtoList(flats), total, request.page(), request.size());
    }

    public FlatResponseDto get(int id) {
        return flatMapper.toDto(findFlat(id));
    }

    public FlatResponseDto create(FlatRequestDto dto) {
        validator.validate(dto);
        Coordinates coordinates = resolveCoordinates(dto);
        House house = resolveHouse(dto);

        Flat flat = flatMapper.toEntity(dto, coordinates, house);
        flatRepository.save(flat);
        events.fire(new EntityChangeEvent(EntityChangeEvent.FLAT, EntityChangeEvent.CREATED, flat.getId()));
        return flatMapper.toDto(flat);
    }

    public FlatResponseDto update(int id, FlatRequestDto dto) {
        validator.validate(dto);
        Flat flat = findFlat(id);
        Coordinates coordinates = resolveCoordinates(dto);
        House house = resolveHouse(dto);

        flatMapper.updateEntity(flat, dto, coordinates, house);
        flatRepository.flush();
        events.fire(new EntityChangeEvent(EntityChangeEvent.FLAT, EntityChangeEvent.UPDATED, flat.getId()));
        return flatMapper.toDto(flat);
    }

    public void delete(int id) {
        Flat flat = findFlat(id);
        flatRepository.remove(flat);
        events.fire(new EntityChangeEvent(EntityChangeEvent.FLAT, EntityChangeEvent.DELETED, id));
    }

    private Flat findFlat(int id) {
        return flatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Квартира с id=" + id + " не найдена"));
    }

    private Coordinates resolveCoordinates(FlatRequestDto dto) {
        if (dto.coordinatesId() != null) {
            return coordinatesRepository.findById(dto.coordinatesId())
                    .orElseThrow(() -> new ResourceNotFoundException("Координаты с id=" + dto.coordinatesId() + " не найдены"));
        }
        Coordinates coordinates = coordinatesMapper.toEntity(dto.coordinates());
        coordinatesRepository.save(coordinates);
        events.fire(new EntityChangeEvent(EntityChangeEvent.COORDINATES, EntityChangeEvent.CREATED, coordinates.getId()));
        return coordinates;
    }

    private House resolveHouse(FlatRequestDto dto) {
        if (dto.houseId() != null) {
            House house = houseRepository.findById(dto.houseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Дом с id=" + dto.houseId() + " не найден"));
            if (FlatValidator.isAboveTopFloor(dto.floor(), house.getNumberOfFloors())) {
                throw new ValidationException(List.of(FlatValidator.floorAboveHouseMessage(dto.floor(), house.getNumberOfFloors())));
            }
            return house;
        }
        House house = houseMapper.toEntity(dto.house());
        houseRepository.save(house);
        events.fire(new EntityChangeEvent(EntityChangeEvent.HOUSE, EntityChangeEvent.CREATED, house.getId()));
        return house;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    /** Значения enum, в названии которых встречается введённая подстрока (без учёта регистра). */
    private static <E extends Enum<E>> Set<E> matchingConstants(Class<E> type, String query) {
        String value = blankToNull(query);
        if (value == null) {
            return null;
        }
        String upper = value.toUpperCase();
        return Arrays.stream(type.getEnumConstants())
                .filter(constant -> constant.name().contains(upper))
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(type)));
    }
}
