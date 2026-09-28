package validation;

import dto.CoordinatesDto;
import dto.FlatRequestDto;
import dto.HouseDto;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class FlatValidator {

    public void validate(FlatRequestDto dto) {
        List<String> errors = new ArrayList<>();
        if (dto == null) {
            errors.add("Данные квартиры не переданы");
            throw new ValidationException(errors);
        }

        if (dto.name() == null || dto.name().isBlank()) {
            errors.add("Название квартиры не может быть пустым");
        }

        if ((dto.coordinatesId() == null) == (dto.coordinates() == null)) {
            errors.add("Укажите либо существующие координаты (coordinatesId), либо новые (coordinates), но не оба варианта");
        } else if (dto.coordinates() != null) {
            collectErrors(dto.coordinates(), errors);
        }

        if (dto.area() != null) {
            if (dto.area() <= 0) {
                errors.add("Площадь должна быть больше 0");
            } else if (dto.area() > 628) {
                errors.add("Площадь не может быть больше 628");
            }
        }

        if (dto.price() != null && dto.price() <= 0) {
            errors.add("Цена должна быть больше 0");
        }

        if (dto.timeToMetroOnFoot() != null && dto.timeToMetroOnFoot() <= 0) {
            errors.add("Время до метро пешком должно быть больше 0");
        }

        if (dto.numberOfRooms() == null) {
            errors.add("Количество комнат должно быть указано");
        } else if (dto.numberOfRooms() <= 0) {
            errors.add("Количество комнат должно быть больше 0");
        }

        if (dto.floor() == null) {
            errors.add("Этаж должен быть указан");
        } else if (dto.floor() <= 0) {
            errors.add("Этаж должен быть больше 0");
        }

        if (dto.furnish() == null) {
            errors.add("Тип отделки должен быть указан");
        }

        if ((dto.houseId() == null) == (dto.house() == null)) {
            errors.add("Укажите либо существующий дом (houseId), либо новый (house), но не оба варианта");
        } else if (dto.house() != null) {
            collectErrors(dto.house(), errors);
            if (dto.floor() != null && isAboveTopFloor(dto.floor(), dto.house().numberOfFloors())) {
                errors.add(floorAboveHouseMessage(dto.floor(), dto.house().numberOfFloors()));
            }
        }

        throwIfAny(errors);
    }

    public void validate(CoordinatesDto dto) {
        List<String> errors = new ArrayList<>();
        collectErrors(dto, errors);
        throwIfAny(errors);
    }

    public void validate(HouseDto dto) {
        List<String> errors = new ArrayList<>();
        collectErrors(dto, errors);
        throwIfAny(errors);
    }

    private void collectErrors(CoordinatesDto dto, List<String> errors) {
        if (dto == null) {
            errors.add("Координаты должны быть указаны");
            return;
        }
        if (dto.x() == null) {
            errors.add("Координата X не может быть пустой");
        } else if (dto.x() <= -494) {
            errors.add("Координата X должна быть больше -494");
        }
        if (dto.y() == null) {
            errors.add("Координата Y не может быть пустой");
        } else if (dto.y() <= -609) {
            errors.add("Координата Y должна быть больше -609");
        }
    }

    private void collectErrors(HouseDto dto, List<String> errors) {
        if (dto == null) {
            errors.add("Дом должен быть указан");
            return;
        }
        if (dto.name() == null) {
            errors.add("Название дома не может быть пустым");
        }
        if (dto.year() != null && dto.year() <= 0) {
            errors.add("Год постройки должен быть больше 0");
        }
        if (dto.numberOfFloors() != null && dto.numberOfFloors() <= 0) {
            errors.add("Количество этажей должно быть больше 0");
        }
    }

    /** Этаж квартиры выше последнего этажа дома (если этажность дома известна). */
    public static boolean isAboveTopFloor(int floor, Integer houseNumberOfFloors) {
        return houseNumberOfFloors != null && floor > houseNumberOfFloors;
    }

    public static String floorAboveHouseMessage(int floor, int houseNumberOfFloors) {
        return "Этаж квартиры (" + floor + ") не может быть больше количества этажей в доме (" + houseNumberOfFloors + ")";
    }

    private void throwIfAny(List<String> errors) {
        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }
    }
}
