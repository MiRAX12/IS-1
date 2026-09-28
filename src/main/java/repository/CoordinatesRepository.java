package repository;

import entity.Coordinates;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.hibernate.Session;
import org.hibernate.SessionFactory;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class CoordinatesRepository {

    @Inject
    private SessionFactory sessionFactory;

    private Session session() {
        return sessionFactory.getCurrentSession();
    }

    public Optional<Coordinates> findById(long id) {
        return Optional.ofNullable(session().get(Coordinates.class, id));
    }

    public List<Coordinates> findAll() {
        return session().createSelectionQuery("from Coordinates e order by e.id", Coordinates.class).getResultList();
    }

    public void save(Coordinates entity) {
        session().persist(entity);
        session().flush();
    }

    public void remove(Coordinates entity) {
        session().remove(entity);
        session().flush();
    }
}
