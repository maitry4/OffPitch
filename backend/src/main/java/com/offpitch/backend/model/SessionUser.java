package com.offpitch.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "session_users",
    uniqueConstraints = @UniqueConstraint(columnNames = {"session_id", "user_id"})
)
public class SessionUser {

    @Id
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt;

    protected SessionUser() {
    }

    public SessionUser(UUID sessionId, UUID userId) {
        this.id = UUID.randomUUID();
        this.sessionId = sessionId;
        this.userId = userId;
        this.joinedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getSessionId() { return sessionId; }
    public UUID getUserId() { return userId; }
    public Instant getJoinedAt() { return joinedAt; }
}
