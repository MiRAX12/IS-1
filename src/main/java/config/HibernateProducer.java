package config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Disposes;
import jakarta.enterprise.inject.Produces;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

@ApplicationScoped
public class HibernateProducer {

    @Produces
    @ApplicationScoped
    public SessionFactory produceSessionFactory() {
        return new Configuration().configure().buildSessionFactory();
    }

    public void closeSessionFactory(@Disposes SessionFactory sessionFactory) {
        if (sessionFactory.isOpen()) {
            sessionFactory.close();
        }
    }
}
