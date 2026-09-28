package rest;

import dto.ErrorResponseDto;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.hibernate.exception.ConstraintViolationException;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Всё, что не обработали специализированные мапперы: ошибки JAX-RS,
 * нарушения ограничений БД и непредвиденные исключения.
 */
@Provider
public class GenericExceptionMapper implements ExceptionMapper<Throwable> {

    private static final Logger LOG = Logger.getLogger(GenericExceptionMapper.class.getName());

    @Override
    public Response toResponse(Throwable exception) {
        if (exception instanceof WebApplicationException webException) {
            int status = webException.getResponse().getStatus();
            String message = status == 400
                    ? "Некорректный формат запроса"
                    : webException.getMessage();
            return error(status, message);
        }

        ConstraintViolationException violation = findCause(exception, ConstraintViolationException.class);
        if (violation != null) {
            String constraint = violation.getConstraintName();
            return error(400, "Значение нарушает ограничение базы данных"
                    + (constraint != null ? " (" + constraint + ")" : ""));
        }

        LOG.log(Level.SEVERE, "Необработанная ошибка", exception);
        return error(500, "Внутренняя ошибка сервера");
    }

    private static Response error(int status, String message) {
        return Response.status(status)
                .type(MediaType.APPLICATION_JSON)
                .entity(new ErrorResponseDto(List.of(message)))
                .build();
    }

    private static <T extends Throwable> T findCause(Throwable exception, Class<T> type) {
        for (Throwable current = exception; current != null; current = current.getCause()) {
            if (type.isInstance(current)) {
                return type.cast(current);
            }
            if (current.getCause() == current) {
                break;
            }
        }
        return null;
    }
}
