package com.offpitch.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "song")
public class Song {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String title;

    private String artist;

    private String album;

    @Column(name = "cover_url")
    private String coverUrl;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    /**
     * Either a full HTTPS URL, or a Cloudinary public_id
     * (e.g. offpitch/songs/him-i_m) resolved at runtime.
     */
    @Column(name = "audio_url")
    private String audioUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Song() {
    }

    public Song(
            String title,
            String artist,
            String album,
            String coverUrl,
            Integer durationSeconds,
            String audioUrl) {
        this.id = UUID.randomUUID();
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.coverUrl = coverUrl;
        this.durationSeconds = durationSeconds;
        this.audioUrl = audioUrl;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getArtist() { return artist; }
    public String getAlbum() { return album; }
    public String getCoverUrl() { return coverUrl; }
    public Integer getDurationSeconds() { return durationSeconds; }
    public String getAudioUrl() { return audioUrl; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
