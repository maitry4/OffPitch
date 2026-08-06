package com.offpitch.backend.signal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.UUID;

@Component
public class SignalBroadcaster {

    private static final Logger log = LoggerFactory.getLogger(SignalBroadcaster.class);

    private final SignalRoomRegistry registry;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SignalBroadcaster(SignalRoomRegistry registry) {
        this.registry = registry;
    }

    public void broadcastPeerLeft(String inviteCode, UUID userId) {
        ObjectNode left = objectMapper.createObjectNode();
        left.put("type", "peer-left");
        left.put("userId", userId.toString());
        broadcast(inviteCode, userId, left);
    }

    public void broadcast(String inviteCode, UUID exceptUserId, ObjectNode message) {
        String payload;
        try {
            payload = objectMapper.writeValueAsString(message);
        } catch (Exception e) {
            log.warn("Failed to serialize signal message: {}", e.getMessage());
            return;
        }

        for (SignalPeer peer : registry.peersInRoom(inviteCode)) {
            if (peer.getUserId().equals(exceptUserId)) {
                continue;
            }
            WebSocketSession session = peer.getSession();
            if (!session.isOpen()) {
                continue;
            }
            try {
                synchronized (session) {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(payload));
                    }
                }
            } catch (Exception e) {
                log.debug("Failed to send signal to {}: {}", peer.getUserId(), e.getMessage());
            }
        }
    }
}
