package com.offpitch.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "song_detail")
public class SongDetail {

    @Id
    private UUID id;

    @Column(name = "song_id", nullable = false)
    private UUID songId;

    /**
     * JSON shape:
     * {
     *   "lyrics": [{ "line": 1, "startMs": 94, "endMs": 5999, "text": "..." }],
     *   "effects": []
     * }
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> timeline;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected SongDetail() {
    }

    public SongDetail(UUID songId, Map<String, Object> timeline) {
        this.id = UUID.randomUUID();
        this.songId = songId;
        this.timeline = timeline;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getSongId() { return songId; }
    public Map<String, Object> getTimeline() { return timeline; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setTimeline(Map<String, Object> timeline) { this.timeline = timeline; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
