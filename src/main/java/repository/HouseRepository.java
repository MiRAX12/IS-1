package repository;

import entity.House;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.hibernate.Session;
import org.hibernate.SessionFactory;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class HouseRepository {

    @Inject
    private SessionFactory sessionFactory;

    private Session session() {
        return sessionFactory.getCurrentSession();
    }

    public Optional<House> findById(long id) {
        return Optional.ofNullable(session().get(House.class, id));
    }

    public List<House> findAll() {
        return session().createSelectionQuery("from House e order by e.id", House.class).getResultList();
    }

    public void save(House entity) {
        session().persist(entity);
        session().flush();
    }

    public void remove(House entity) {
        session().remove(entity);
        session().flush();
    }
}
