package rest;

import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import jakarta.json.bind.JsonbConfig;
import jakarta.ws.rs.ext.ContextResolver;
import jakarta.ws.rs.ext.Provider;

/**
 * По умолчанию JSON-B пропускает null-поля. Клиенту нужны явные null,
 * чтобы отличать «не указано» от отсутствующего поля.
 */
@Provider
public class JsonbConfigProvider implements ContextResolver<Jsonb> {

    private final Jsonb jsonb = JsonbBuilder.create(new JsonbConfig().withNullValues(true));

    @Override
    public Jsonb getContext(Class<?> type) {
        return jsonb;
    }
}
