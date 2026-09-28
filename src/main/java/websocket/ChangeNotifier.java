package websocket;

import events.EntityChangeEvent;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.enterprise.event.TransactionPhase;
import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;

/**
 * Рассылает клиентам изменения только после успешного коммита транзакции,
 * чтобы они не увидели откатившиеся данные.
 */
@ApplicationScoped
public class ChangeNotifier {

    private final Jsonb jsonb = JsonbBuilder.create();

    public void onChange(@Observes(during = TransactionPhase.AFTER_SUCCESS) EntityChangeEvent event) {
        ChangesEndpoint.broadcast(jsonb.toJson(event));
    }

    @PreDestroy
    public void close() throws Exception {
        jsonb.close();
    }
}
