package com.offpitch.backend.signal;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.offpitch.backend.model.KaraokeSession;
import com.offpitch.backend.model.User;
import com.offpitch.backend.repository.KaraokeSessionRepository;
import com.offpitch.backend.repository.SessionUserRepository;
import com.offpitch.backend.repository.UserRepository;
import com.offpitch.backend.service.SessionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.UUID;

@Component
public class SignalWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(SignalWebSocketHandler.class);

    private final SignalRoomRegistry registry;
    private final JwtDecoder jwtDecoder;
    private final UserRepository userRepository;
    private final KaraokeSessionRepository sessionRepository;
    private final SessionUserRepository sessionUserRepository;
    private final SessionService sessionService;
    private final SignalBroadcaster signalBroadcaster;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SignalWebSocketHandler(
            SignalRoomRegistry registry,
            JwtDecoder jwtDecoder,
            UserRepository userRepository,
            KaraokeSessionRepository sessionRepository,
            SessionUserRepository sessionUserRepository,
            SessionService sessionService,
            SignalBroadcaster signalBroadcaster) {
        this.registry = registry;
        this.jwtDecoder = jwtDecoder;
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.sessionUserRepository = sessionUserRepository;
        this.sessionService = sessionService;
        this.signalBroadcaster = signalBroadcaster;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        URI uri = session.getUri();
        if (uri == null) {
            session.close(CloseStatus.BAD_DATA);
            return;
        }

        Map<String, String> query = UriComponentsBuilder.fromUri(uri).build().getQueryParams()
                .toSingleValueMap();
        String token = query.get("token");
        String inviteCode = query.get("inviteCode");
        if (token == null || token.isBlank() || inviteCode == null || inviteCode.isBlank()) {
            session.close(CloseStatus.BAD_DATA.withReason("token and inviteCode required"));
            return;
        }

        User user;
        KaraokeSession karaokeSession;
        try {
            Jwt jwt = jwtDecoder.decode(token);
            String googleId = jwt.getSubject();
            user = userRepository.findByGoogleId(googleId).orElse(null);
            if (user == null) {
                session.close(CloseStatus.NOT_ACCEPTABLE.withReason("User not registered"));
                return;
            }
            karaokeSession = sessionRepository.findByInviteCodeIgnoreCase(inviteCode.trim())
                    .orElse(null);
            if (karaokeSession == null) {
                session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Room not found"));
                return;
            }
            if (!sessionUserRepository.existsBySessionIdAndUserId(karaokeSession.getId(), user.getId())) {
                session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Not a room member"));
                return;
            }
        } catch (Exception e) {
            log.warn("WebSocket auth failed: {}", e.getMessage());
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Invalid token"));
            return;
        }

        String code = karaokeSession.getInviteCode();
        SignalPeer peer = new SignalPeer(user.getId(), code, session);
        registry.join(peer);

        ObjectNode welcome = objectMapper.createObjectNode();
        welcome.put("type", "welcome");
        welcome.put("userId", user.getId().toString());
        ArrayNode peers = welcome.putArray("peers");
        for (SignalPeer other : registry.peersInRoom(code)) {
            if (other.getUserId().equals(user.getId())) {
                continue;
            }
            ObjectNode p = peers.addObject();
            p.put("userId", other.getUserId().toString());
            p.put("camOn", other.isCamOn());
            p.put("micOn", other.isMicOn());
        }
        send(session, welcome);

        ObjectNode joined = objectMapper.createObjectNode();
        joined.put("type", "peer-joined");
        joined.put("userId", user.getId().toString());
        joined.put("camOn", false);
        joined.put("micOn", false);
        broadcast(code, user.getId(), joined);

        log.info("Signal join user={} room={}", user.getId(), code);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        SignalPeer self = registry.getBySession(session);
        if (self == null) {
            return;
        }

        JsonNode root;
        try {
            root = objectMapper.readTree(message.getPayload());
        } catch (Exception e) {
            return;
        }

        String type = text(root, "type");
        if (type == null) {
            return;
        }

        switch (type) {
            case "offer", "answer", "ice" -> relay(self, root, type);
            case "media-state" -> handleMediaState(self, root);
            case "playback-control" -> handlePlaybackControl(self, root);
            default -> { /* ignore */ }
        }
    }

    private void handlePlaybackControl(SignalPeer self, JsonNode root) throws IOException {
        String action = text(root, "action");
        if (action == null) {
            return;
        }
        long positionMs = 0;
        if (root.has("positionMs") && root.get("positionMs").canConvertToLong()) {
            positionMs = Math.max(0, root.get("positionMs").asLong());
        }

        ObjectNode out = objectMapper.createObjectNode();
        out.put("type", "playback-control");
        out.put("from", self.getUserId().toString());
        out.put("action", action);
        out.put("positionMs", positionMs);
        broadcast(self.getInviteCode(), self.getUserId(), out);
    }

    private void relay(SignalPeer self, JsonNode root, String type) throws IOException {
        String to = text(root, "to");
        if (to == null) {
            return;
        }
        UUID targetId;
        try {
            targetId = UUID.fromString(to);
        } catch (IllegalArgumentException e) {
            return;
        }

        SignalPeer target = registry.getPeer(self.getInviteCode(), targetId);
        if (target == null || !target.getSession().isOpen()) {
            return;
        }

        ObjectNode out = objectMapper.createObjectNode();
        out.put("type", type);
        out.put("from", self.getUserId().toString());
        if (root.has("sdp")) {
            out.set("sdp", root.get("sdp"));
        }
        if (root.has("candidate")) {
            out.set("candidate", root.get("candidate"));
        }
        send(target.getSession(), out);
    }

    private void handleMediaState(SignalPeer self, JsonNode root) throws IOException {
        if (root.has("camOn")) {
            self.setCamOn(root.get("camOn").asBoolean());
        }
        if (root.has("micOn")) {
            self.setMicOn(root.get("micOn").asBoolean());
        }

        ObjectNode out = objectMapper.createObjectNode();
        out.put("type", "media-state");
        out.put("userId", self.getUserId().toString());
        out.put("camOn", self.isCamOn());
        out.put("micOn", self.isMicOn());
        broadcast(self.getInviteCode(), self.getUserId(), out);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        SignalPeer peer = registry.leave(session);
        if (peer == null) {
            return;
        }
        try {
            // Drop membership + notify room (idempotent if Leave already called the API).
            sessionService.leaveSession(peer.getInviteCode(), peer.getUserId());
        } catch (Exception e) {
            log.warn("Failed to remove user from session on WS close: {}", e.getMessage());
            signalBroadcaster.broadcastPeerLeft(peer.getInviteCode(), peer.getUserId());
        }
        log.info("Signal leave user={} room={}", peer.getUserId(), peer.getInviteCode());
    }

    private void broadcast(String inviteCode, UUID exceptUserId, ObjectNode message) throws IOException {
        signalBroadcaster.broadcast(inviteCode, exceptUserId, message);
    }

    private void send(WebSocketSession session, ObjectNode node) throws IOException {
        synchronized (session) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(node)));
            }
        }
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) {
            return null;
        }
        String s = value.asText();
        return s == null || s.isBlank() ? null : s;
    }
}
