package websocket;

import jakarta.websocket.OnClose;
import jakarta.websocket.OnError;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Клиенты подписываются сюда, чтобы получать уведомления об изменениях объектов.
 */
@ServerEndpoint("/ws/changes")
public class ChangesEndpoint {

    private static final Logger LOG = Logger.getLogger(ChangesEndpoint.class.getName());

    private static final Set<Session> SESSIONS = ConcurrentHashMap.newKeySet();

    @OnOpen
    public void onOpen(Session session) {
        SESSIONS.add(session);
    }

    @OnClose
    public void onClose(Session session) {
        SESSIONS.remove(session);
    }

    @OnError
    public void onError(Session session, Throwable error) {
        SESSIONS.remove(session);
        LOG.log(Level.FINE, "Ошибка WebSocket-сессии", error);
    }

    static void broadcast(String message) {
        for (Session session : SESSIONS) {
            if (!session.isOpen()) {
                SESSIONS.remove(session);
                continue;
            }
            // Отправка в одну сессию из нескольких потоков одновременно недопустима
            synchronized (session) {
                try {
                    session.getBasicRemote().sendText(message);
                } catch (IOException e) {
                    SESSIONS.remove(session);
                    LOG.log(Level.FINE, "Не удалось отправить сообщение клиенту", e);
                }
            }
        }
    }
}
