package com.offpitch.backend.service;

import com.offpitch.backend.model.KaraokeSession;
import com.offpitch.backend.model.SessionUser;
import com.offpitch.backend.model.Song;
import com.offpitch.backend.model.SongDetail;
import com.offpitch.backend.model.User;
import com.offpitch.backend.repository.KaraokeSessionRepository;
import com.offpitch.backend.repository.SessionUserRepository;
import com.offpitch.backend.repository.SongDetailRepository;
import com.offpitch.backend.repository.UserRepository;
import com.offpitch.backend.signal.SignalBroadcaster;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SessionService {

    public static final Duration SESSION_TTL = Duration.ofMinutes(90);

    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final KaraokeSessionRepository sessionRepository;
    private final SessionUserRepository sessionUserRepository;
    private final UserRepository userRepository;
    private final SongService songService;
    private final SongDetailRepository songDetailRepository;
    private final SignalBroadcaster signalBroadcaster;

    public SessionService(
            KaraokeSessionRepository sessionRepository,
            SessionUserRepository sessionUserRepository,
            UserRepository userRepository,
            SongService songService,
            SongDetailRepository songDetailRepository,
            SignalBroadcaster signalBroadcaster) {
        this.sessionRepository = sessionRepository;
        this.sessionUserRepository = sessionUserRepository;
        this.userRepository = userRepository;
        this.songService = songService;
        this.songDetailRepository = songDetailRepository;
        this.signalBroadcaster = signalBroadcaster;
    }

    @Transactional
    public Map<String, Object> createSession(User host) {
        String inviteCode = generateUniqueInviteCode();
        Instant expiresAt = Instant.now().plus(SESSION_TTL);

        KaraokeSession session = new KaraokeSession(inviteCode, host.getId(), expiresAt);
        sessionRepository.save(session);
        sessionUserRepository.save(new SessionUser(session.getId(), host.getId()));

        return toResponse(session, host.getId());
    }

    @Transactional
    public Map<String, Object> joinSession(String inviteCode, User user) {
        KaraokeSession session = findActiveByInviteCode(inviteCode);

        if (!sessionUserRepository.existsBySessionIdAndUserId(session.getId(), user.getId())) {
            sessionUserRepository.save(new SessionUser(session.getId(), user.getId()));
            session.setUpdatedAt(Instant.now());
            sessionRepository.save(session);
        }

        return toResponse(session, user.getId());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSession(String inviteCode, User user) {
        KaraokeSession session = findActiveByInviteCode(inviteCode);

        if (!sessionUserRepository.existsBySessionIdAndUserId(session.getId(), user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not in this session");
        }

        return toResponse(session, user.getId());
    }

    /**
     * Remove a user from the room. Host transfers to the next remaining member if needed.
     * Idempotent if the user is already gone.
     */
    @Transactional
    public void leaveSession(String inviteCode, User user) {
        leaveSession(inviteCode, user.getId());
    }

    @Transactional
    public void leaveSession(String inviteCode, UUID userId) {
        KaraokeSession session = sessionRepository.findByInviteCodeIgnoreCase(inviteCode.trim())
            .orElse(null);
        if (session == null) {
            return;
        }

        if (!sessionUserRepository.existsBySessionIdAndUserId(session.getId(), userId)) {
            return;
        }

        sessionUserRepository.deleteBySessionIdAndUserId(session.getId(), userId);

        List<SessionUser> remaining =
            sessionUserRepository.findBySessionIdOrderByJoinedAtAsc(session.getId());

        if (remaining.isEmpty()) {
            session.clearSong();
            session.setUpdatedAt(Instant.now());
            sessionRepository.save(session);
            signalBroadcaster.broadcastPeerLeft(session.getInviteCode(), userId);
            return;
        }

        if (session.getHostUserId().equals(userId)) {
            session.setHostUserId(remaining.get(0).getUserId());
        } else {
            session.setUpdatedAt(Instant.now());
        }
        sessionRepository.save(session);
        signalBroadcaster.broadcastPeerLeft(session.getInviteCode(), userId);
    }

    /**
     * Host selects a song — stamps song_started_at so every client can sync playback
     * from the Cloudinary audio URL.
     */
    @Transactional
    public Map<String, Object> selectSong(String inviteCode, UUID songId, User user) {
        KaraokeSession session = findActiveByInviteCode(inviteCode);

        if (!session.getHostUserId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the host can select a song");
        }

        if (!sessionUserRepository.existsBySessionIdAndUserId(session.getId(), user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not in this session");
        }

        Song song = songService.requireSong(songId);
        session.startSong(song.getId(), Instant.now());
        sessionRepository.save(session);

        return toResponse(session, user.getId());
    }

    /**
     * Any room member can pause / play / seek / replay — state is shared for everyone.
     */
    @Transactional
    public Map<String, Object> updatePlayback(String inviteCode, User user, Map<String, Object> body) {
        KaraokeSession session = findActiveByInviteCode(inviteCode);

        if (!sessionUserRepository.existsBySessionIdAndUserId(session.getId(), user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not in this session");
        }
        if (session.getCurrentSongId() == null || session.getSongStartedAt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No song is playing");
        }

        String action = body.get("action") == null ? "" : String.valueOf(body.get("action")).trim().toLowerCase();
        long positionMs = parsePositionMs(body.get("positionMs"));

        switch (action) {
            case "pause" -> session.pauseAt(positionMs);
            case "play" -> session.resumeAt(positionMs);
            case "seek" -> session.seekTo(positionMs, session.isPaused());
            case "replay" -> session.replay();
            default -> throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "action must be pause, play, seek, or replay"
            );
        }

        sessionRepository.save(session);
        return toResponse(session, user.getId());
    }

    private static long parsePositionMs(Object raw) {
        if (raw == null) {
            return 0;
        }
        if (raw instanceof Number n) {
            return Math.max(0, n.longValue());
        }
        try {
            return Math.max(0, Long.parseLong(String.valueOf(raw)));
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private KaraokeSession findActiveByInviteCode(String inviteCode) {
        KaraokeSession session = sessionRepository.findByInviteCodeIgnoreCase(inviteCode.trim())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        if (session.isExpired()) {
            throw new ResponseStatusException(HttpStatus.GONE, "Session has expired");
        }

        return session;
    }

    private Map<String, Object> toResponse(KaraokeSession session, UUID currentUserId) {
        List<SessionUser> memberships =
            sessionUserRepository.findBySessionIdOrderByJoinedAtAsc(session.getId());

        List<UUID> userIds = memberships.stream().map(SessionUser::getUserId).toList();
        Map<UUID, User> usersById = new LinkedHashMap<>();
        userRepository.findAllById(userIds).forEach(u -> usersById.put(u.getId(), u));

        List<Map<String, Object>> members = new ArrayList<>();
        for (SessionUser membership : memberships) {
            User member = usersById.get(membership.getUserId());
            if (member == null) {
                continue;
            }
            members.add(Map.of(
                "id", member.getId().toString(),
                "name", nullToEmpty(member.getName()),
                "username", nullToEmpty(member.getUsername()),
                "email", nullToEmpty(member.getEmail()),
                "isHost", member.getId().equals(session.getHostUserId()),
                "isYou", member.getId().equals(currentUserId),
                "joinedAt", membership.getJoinedAt().toString()
            ));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", session.getId().toString());
        response.put("inviteCode", session.getInviteCode());
        response.put("expiresAt", session.getExpiresAt().toString());
        response.put("createdAt", session.getCreatedAt().toString());
        response.put("peopleCount", members.size());
        response.put("members", members);
        response.put("isHost", session.getHostUserId().equals(currentUserId));
        response.put("playback", buildPlayback(session));
        return response;
    }

    private Object buildPlayback(KaraokeSession session) {
        if (session.getCurrentSongId() == null || session.getSongStartedAt() == null) {
            return null;
        }

        Song song = songService.requireSong(session.getCurrentSongId());
        SongDetail detail = songDetailRepository.findBySongId(song.getId()).orElse(null);

        boolean paused = session.isPaused();
        long positionMs;
        if (paused && session.getPausePositionMs() != null) {
            positionMs = session.getPausePositionMs();
        } else {
            positionMs = Math.max(0, Duration.between(session.getSongStartedAt(), Instant.now()).toMillis());
        }

        return songService.toPlaybackPayload(
            song,
            detail,
            session.getSongStartedAt(),
            paused,
            positionMs
        );
    }

    private String generateUniqueInviteCode() {
        for (int attempt = 0; attempt < 20; attempt++) {
            String code = randomCode();
            if (!sessionRepository.existsByInviteCodeIgnoreCase(code)) {
                return code;
            }
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not generate invite code");
    }

    private static String randomCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(CODE_ALPHABET.charAt(RANDOM.nextInt(CODE_ALPHABET.length())));
        }
        return sb.toString();
    }

    private static String nullToEmpty(String value) {
        return value != null ? value : "";
    }
}
