package service;

import dto.FlatResponseDto;
import entity.Flat;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import mappers.FlatMapper;
import repository.FlatRepository;
import validation.ValidationException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.OptionalDouble;

/**
 * Специальные операции над квартирами. Все вычисления выполняются в Java,
 * без функций и процедур БД.
 */
@ApplicationScoped
@Transactional
public class SpecialOperationsService {

    @Inject
    private FlatRepository flatRepository;

    @Inject
    private FlatMapper flatMapper;

    public long sumNumberOfRooms() {
        return flatRepository.findAll().stream()
                .mapToLong(Flat::getNumberOfRooms)
                .sum();
    }

    /** Среднее значение floor или null, если квартир нет. */
    public Double averageFloor() {
        OptionalDouble average = flatRepository.findAll().stream()
                .mapToInt(Flat::getFloor)
                .average();
        return average.isPresent() ? average.getAsDouble() : null;
    }

    public List<FlatResponseDto> findByNamePrefix(String prefix) {
        if (prefix == null || prefix.isEmpty()) {
            throw new ValidationException(List.of("Подстрока для поиска не может быть пустой"));
        }
        List<Flat> matching = flatRepository.findAll().stream()
                .filter(flat -> flat.getName().startsWith(prefix))
                .toList();
        return flatMapper.toDtoList(matching);
    }

    public FlatResponseDto cheapest(int id1, int id2) {
        return pickByPrice(List.of(id1, id2), Comparator.naturalOrder());
    }

    public FlatResponseDto mostExpensive(int id1, int id2, int id3) {
        return pickByPrice(List.of(id1, id2, id3), Comparator.reverseOrder());
    }

    /** Возвращает первую квартиру из списка при упорядочивании по цене. */
    private FlatResponseDto pickByPrice(List<Integer> ids, Comparator<Long> priceOrder) {
        if (ids.stream().distinct().count() != ids.size()) {
            throw new ValidationException(List.of("Идентификаторы квартир должны быть различными"));
        }

        List<Flat> flats = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        for (int id : ids) {
            Flat flat = flatRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Квартира с id=" + id + " не найдена"));
            if (flat.getPrice() == null) {
                errors.add("У квартиры с id=" + id + " не указана цена");
            }
            flats.add(flat);
        }
        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }

        Flat result = flats.stream()
                .min(Comparator.comparing(Flat::getPrice, priceOrder))
                .orElseThrow();
        return flatMapper.toDto(result);
    }
}
