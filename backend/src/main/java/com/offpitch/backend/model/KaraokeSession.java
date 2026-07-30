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
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public void startSong(UUID songId, Instant startedAt) {
        this.currentSongId = songId;
        this.songStartedAt = startedAt;
        this.updatedAt = Instant.now();
    }

    public void clearSong() {
        this.currentSongId = null;
        this.songStartedAt = null;
        this.updatedAt = Instant.now();
    }
}
