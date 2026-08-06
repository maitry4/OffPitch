package com.offpitch.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "session")
public class KaraokeSession {

    @Id
    private UUID id;

    @Column(name = "invite_code", nullable = false, unique = true, length = 16)
    private String inviteCode;

    @Column(name = "host_user_id", nullable = false)
    private UUID hostUserId;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "current_song_id")
    private UUID currentSongId;

    @Column(name = "song_started_at")
    private Instant songStartedAt;

    @Column(name = "is_paused", nullable = false)
    private boolean paused;

    @Column(name = "pause_position_ms")
    private Long pausePositionMs;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected KaraokeSession() {
    }

    public KaraokeSession(String inviteCode, UUID hostUserId, Instant expiresAt) {
        this.id = UUID.randomUUID();
        this.inviteCode = inviteCode;
        this.hostUserId = hostUserId;
        this.expiresAt = expiresAt;
        this.paused = false;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public UUID getId() { return id; }
    public String getInviteCode() { return inviteCode; }
    public UUID getHostUserId() { return hostUserId; }
    public Instant getExpiresAt() { return expiresAt; }
    public UUID getCurrentSongId() { return currentSongId; }
    public Instant getSongStartedAt() { return songStartedAt; }
    public boolean isPaused() { return paused; }
    public Long getPausePositionMs() { return pausePositionMs; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public void setHostUserId(UUID hostUserId) {
        this.hostUserId = hostUserId;
        this.updatedAt = Instant.now();
    }

    public void startSong(UUID songId, Instant startedAt) {
        this.currentSongId = songId;
        this.songStartedAt = startedAt;
        this.paused = false;
        this.pausePositionMs = null;
        this.updatedAt = Instant.now();
    }

    public void clearSong() {
        this.currentSongId = null;
        this.songStartedAt = null;
        this.paused = false;
        this.pausePositionMs = null;
        this.updatedAt = Instant.now();
    }

    public void pauseAt(long positionMs) {
        this.paused = true;
        this.pausePositionMs = Math.max(0, positionMs);
        this.updatedAt = Instant.now();
    }

    public void resumeAt(long positionMs) {
        long pos = Math.max(0, positionMs);
        this.paused = false;
        this.pausePositionMs = null;
        this.songStartedAt = Instant.now().minusMillis(pos);
        this.updatedAt = Instant.now();
    }

    public void seekTo(long positionMs, boolean remainPaused) {
        long pos = Math.max(0, positionMs);
        if (remainPaused) {
            this.paused = true;
            this.pausePositionMs = pos;
        } else {
            this.paused = false;
            this.pausePositionMs = null;
            this.songStartedAt = Instant.now().minusMillis(pos);
        }
        this.updatedAt = Instant.now();
    }

    public void replay() {
        this.paused = false;
        this.pausePositionMs = null;
        this.songStartedAt = Instant.now();
        this.updatedAt = Instant.now();
    }
}
