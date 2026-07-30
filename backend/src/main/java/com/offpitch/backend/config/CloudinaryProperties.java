package com.offpitch.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Builds public Cloudinary delivery URLs for karaoke audio.
 * Audio is streamed by Cloudinary CDN — the backend only returns the URL + sync timestamp.
 */
@Component
public class CloudinaryProperties {

    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;
    private final String folder;

    public CloudinaryProperties(
            @Value("${CLOUDINARY_CLOUD_NAME:}") String cloudName,
            @Value("${CLOUDINARY_API_KEY:}") String apiKey,
            @Value("${CLOUDINARY_API_SECRET:}") String apiSecret,
            @Value("${CLOUDINARY_FOLDER:offpitch/songs}") String folder) {
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.folder = folder;
    }

    public String getCloudName() { return cloudName; }
    public String getApiKey() { return apiKey; }
    public String getApiSecret() { return apiSecret; }
    public String getFolder() { return folder; }

    public boolean isConfigured() {
        return cloudName != null && !cloudName.isBlank();
    }

    /**
     * Resolves a stored audio value to a playable HTTPS URL.
     * Accepts either a full URL or a Cloudinary public_id.
     */
    public String resolveAudioUrl(String stored) {
        if (stored == null || stored.isBlank()) {
            return null;
        }
        if (stored.startsWith("http://") || stored.startsWith("https://")) {
            return stored;
        }
        if (!isConfigured()) {
            return stored;
        }
        // MP3s uploaded as "video" resource type on Cloudinary
        return "https://res.cloudinary.com/" + cloudName + "/video/upload/" + stored;
    }
}
