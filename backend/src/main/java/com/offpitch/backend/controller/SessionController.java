package com.offpitch.backend.controller;

import com.offpitch.backend.model.User;
import com.offpitch.backend.service.CurrentUserService;
import com.offpitch.backend.service.SessionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;
    private final CurrentUserService currentUserService;

    public SessionController(SessionService sessionService, CurrentUserService currentUserService) {
        this.sessionService = sessionService;
        this.currentUserService = currentUserService;
    }

    /** POST /api/sessions — create a room (TTL 1.5 hours) and add the host. */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createSession() {
        User host = currentUserService.requireCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionService.createSession(host));
    }

    /** POST /api/sessions/{inviteCode}/join — join an existing room by invite code. */
    @PostMapping("/{inviteCode}/join")
    public ResponseEntity<Map<String, Object>> joinSession(@PathVariable String inviteCode) {
        User user = currentUserService.requireCurrentUser();
        return ResponseEntity.ok(sessionService.joinSession(inviteCode, user));
    }

    /** GET /api/sessions/{inviteCode} — room details + members (must already be in room). */
    @GetMapping("/{inviteCode}")
    public ResponseEntity<Map<String, Object>> getSession(@PathVariable String inviteCode) {
        User user = currentUserService.requireCurrentUser();
        return ResponseEntity.ok(sessionService.getSession(inviteCode, user));
    }

    /** POST /api/sessions/{inviteCode}/songs/{songId} — host selects a song (starts playback clock). */
    @PostMapping("/{inviteCode}/songs/{songId}")
    public ResponseEntity<Map<String, Object>> selectSong(
            @PathVariable String inviteCode,
            @PathVariable UUID songId) {
        User user = currentUserService.requireCurrentUser();
        return ResponseEntity.ok(sessionService.selectSong(inviteCode, songId, user));
    }

    /** POST /api/sessions/{inviteCode}/playback — shared pause / play / seek / replay. */
    @PostMapping("/{inviteCode}/playback")
    public ResponseEntity<Map<String, Object>> updatePlayback(
            @PathVariable String inviteCode,
            @RequestBody Map<String, Object> body) {
        User user = currentUserService.requireCurrentUser();
        return ResponseEntity.ok(sessionService.updatePlayback(inviteCode, user, body));
    }

    /** POST /api/sessions/{inviteCode}/leave — remove yourself from the room. */
    @PostMapping("/{inviteCode}/leave")
    public ResponseEntity<Void> leaveSession(@PathVariable String inviteCode) {
        User user = currentUserService.requireCurrentUser();
        sessionService.leaveSession(inviteCode, user);
        return ResponseEntity.noContent().build();
    }
}
