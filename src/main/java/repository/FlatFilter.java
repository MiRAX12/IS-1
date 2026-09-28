package repository;

import entity.Furnish;
import entity.View;

import java.util.Set;

/**
 * Критерии фильтрации таблицы квартир. null — фильтр по полю не задан,
 * пустое множество у enum-полей — ни одно значение не подходит.
 */
public record FlatFilter(
        String name,
        Set<Furnish> furnish,
        Set<View> view,
        String houseName
) {
}
