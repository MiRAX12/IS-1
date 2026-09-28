package repository;

import entity.Flat;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.query.SelectionQuery;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@ApplicationScoped
public class FlatRepository {

    private static final Map<String, String> SORT_COLUMNS = Map.ofEntries(
            Map.entry("id", "f.id"),
            Map.entry("name", "f.name"),
            Map.entry("coordinatesX", "c.x"),
            Map.entry("coordinatesY", "c.y"),
            Map.entry("creationDate", "f.creationDate"),
            Map.entry("area", "f.area"),
            Map.entry("price", "f.price"),
            Map.entry("balcony", "f.balcony"),
            Map.entry("timeToMetroOnFoot", "f.timeToMetroOnFoot"),
            Map.entry("numberOfRooms", "f.numberOfRooms"),
            Map.entry("floor", "f.floor"),
Map.entry("furnish", "case f.furnish when 'DESIGNER' then 2 when 'BAD' then 0 when 'LITTLE' then 1 end"),
Map.entry("view", "case f.view when 'STREET' then 0 when 'YARD' then 1 when 'PARK' then 2 when 'NORMAL' then 3 when 'GOOD' then 4 end"),
            Map.entry("houseName", "h.name"),
            Map.entry("houseYear", "h.year"),
            Map.entry("houseNumberOfFloors", "h.numberOfFloors")
    );

    @Inject
    private SessionFactory sessionFactory;

    private Session session() {
        return sessionFactory.getCurrentSession();
    }

    public static boolean isSortable(String field) {
        return SORT_COLUMNS.containsKey(field);
    }

    public Optional<Flat> findById(int id) {
        return Optional.ofNullable(session().get(Flat.class, id));
    }

    public List<Flat> findAll() {
        return session()
                .createSelectionQuery("from Flat f join fetch f.coordinates join fetch f.house order by f.id", Flat.class)
                .getResultList();
    }

    public List<Flat> findPage(FlatFilter filter, String sortField, boolean ascending, int page, int size) {
        Map<String, Object> params = new HashMap<>();
        String where = buildWhere(filter, params);
        String order = " order by " + SORT_COLUMNS.get(sortField) + (ascending ? " asc" : " desc") + " nulls last, f.id asc";

        SelectionQuery<Flat> query = session().createSelectionQuery(
                "select f from Flat f join fetch f.coordinates c join fetch f.house h" + where + order, Flat.class);
        params.forEach(query::setParameter);
        return query.setFirstResult(page * size).setMaxResults(size).getResultList();
    }

    public long count(FlatFilter filter) {
        Map<String, Object> params = new HashMap<>();
        String where = buildWhere(filter, params);

        SelectionQuery<Long> query = session().createSelectionQuery(
                "select count(f) from Flat f join f.coordinates c join f.house h" + where, Long.class);
        params.forEach(query::setParameter);
        return query.getSingleResult();
    }

    public List<Flat> findByCoordinatesId(long coordinatesId) {
        return session()
                .createSelectionQuery("from Flat f where f.coordinates.id = :id", Flat.class)
                .setParameter("id", coordinatesId)
                .getResultList();
    }

    public List<Flat> findByHouseId(long houseId) {
        return session()
                .createSelectionQuery("from Flat f where f.house.id = :id", Flat.class)
                .setParameter("id", houseId)
                .getResultList();
    }

    public long countByCoordinatesId(long coordinatesId) {
        return session()
                .createSelectionQuery("select count(f) from Flat f where f.coordinates.id = :id", Long.class)
                .setParameter("id", coordinatesId)
                .getSingleResult();
    }

    public long countByHouseId(long houseId) {
        return session()
                .createSelectionQuery("select count(f) from Flat f where f.house.id = :id", Long.class)
                .setParameter("id", houseId)
                .getSingleResult();
    }

    public void save(Flat flat) {
        session().persist(flat);
        session().flush();
    }

    public void flush() {
        session().flush();
    }

    public void remove(Flat flat) {
        session().remove(flat);
        session().flush();
    }

    private String buildWhere(FlatFilter filter, Map<String, Object> params) {
        StringBuilder where = new StringBuilder(" where 1 = 1");
        if (filter == null) {
            return where.toString();
        }
        if (filter.name() != null) {
            where.append(" and lower(f.name) like :name escape '!'");
            params.put("name", containsPattern(filter.name()));
        }
        if (filter.houseName() != null) {
            where.append(" and lower(h.name) like :houseName escape '!'");
            params.put("houseName", containsPattern(filter.houseName()));
        }
        if (filter.furnish() != null) {
            if (filter.furnish().isEmpty()) {
                where.append(" and 1 = 0");
            } else {
                where.append(" and f.furnish in :furnish");
                params.put("furnish", filter.furnish());
            }
        }
        if (filter.view() != null) {
            if (filter.view().isEmpty()) {
                where.append(" and 1 = 0");
            } else {
                where.append(" and f.view in :view");
                params.put("view", filter.view());
            }
        }
        return where.toString();
    }

    /** Шаблон LIKE для поиска подстроки; спецсимволы экранируются символом '!'. */
    private static String containsPattern(String value) {
        String escaped = value.toLowerCase()
                .replace("!", "!!")
                .replace("%", "!%")
                .replace("_", "!_");
        return "%" + escaped + "%";
    }
}
