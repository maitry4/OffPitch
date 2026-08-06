package com.offpitch.backend.signal;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SignalRoomRegistry {

    /** inviteCode → (userId → peer) */
    private final Map<String, Map<UUID, SignalPeer>> rooms = new ConcurrentHashMap<>();
    /** websocket session id → peer */
    private final Map<String, SignalPeer> bySession = new ConcurrentHashMap<>();

    public void join(SignalPeer peer) {
        rooms.computeIfAbsent(peer.getInviteCode(), k -> new ConcurrentHashMap<>())
                .put(peer.getUserId(), peer);
        bySession.put(peer.getSession().getId(), peer);
    }

    public SignalPeer leave(WebSocketSession session) {
        SignalPeer peer = bySession.remove(session.getId());
        if (peer == null) {
            return null;
        }
        Map<UUID, SignalPeer> room = rooms.get(peer.getInviteCode());
        if (room != null) {
            room.remove(peer.getUserId(), peer);
            if (room.isEmpty()) {
                rooms.remove(peer.getInviteCode(), room);
            }
        }
        return peer;
    }

    public SignalPeer getBySession(WebSocketSession session) {
        return bySession.get(session.getId());
    }

    public SignalPeer getPeer(String inviteCode, UUID userId) {
        Map<UUID, SignalPeer> room = rooms.get(inviteCode);
        if (room == null) {
            return null;
        }
        return room.get(userId);
    }

    public Collection<SignalPeer> peersInRoom(String inviteCode) {
        Map<UUID, SignalPeer> room = rooms.get(inviteCode);
        if (room == null) {
            return List.of();
        }
        return new ArrayList<>(room.values());
    }
}
