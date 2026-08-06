package com.offpitch.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Builds playable audio URLs for karaoke tracks.
 * Prefers LOCAL_AUDIO_BASE_URL (local /media files) when set; otherwise Cloudinary CDN.
 */
@Component
public class CloudinaryProperties {

    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;
    private final String folder;
    private final String localAudioBaseUrl;

    public CloudinaryProperties(
            @Value("${CLOUDINARY_CLOUD_NAME:}") String cloudName,
            @Value("${CLOUDINARY_API_KEY:}") String apiKey,
            @Value("${CLOUDINARY_API_SECRET:}") String apiSecret,
            @Value("${CLOUDINARY_FOLDER:offpitch/songs}") String folder,
            @Value("${LOCAL_AUDIO_BASE_URL:}") String localAudioBaseUrl) {
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.folder = folder;
        this.localAudioBaseUrl = localAudioBaseUrl == null ? "" : localAudioBaseUrl.trim();
    }

    public String getCloudName() { return cloudName; }
    public String getApiKey() { return apiKey; }
    public String getApiSecret() { return apiSecret; }
    public String getFolder() { return folder; }

    public boolean isConfigured() {
        return cloudName != null && !cloudName.isBlank();
    }

    public boolean usesLocalAudio() {
        return !localAudioBaseUrl.isBlank();
    }

    /**
     * Resolves a stored audio value to a playable HTTPS/HTTP URL.
     * Accepts either a full URL or a Cloudinary public_id / relative id.
     */
    public String resolveAudioUrl(String stored) {
        if (stored == null || stored.isBlank()) {
            return null;
        }
        if (stored.startsWith("http://") || stored.startsWith("https://")) {
            return stored;
        }

        String fileName = stored.contains("/")
                ? stored.substring(stored.lastIndexOf('/') + 1)
                : stored;
        if (!fileName.endsWith(".mp3")) {
            fileName = fileName + ".mp3";
        }

        // Local karaoke_songs via /media — works without Cloudinary upload.
        if (usesLocalAudio()) {
            String base = localAudioBaseUrl.endsWith("/")
                    ? localAudioBaseUrl.substring(0, localAudioBaseUrl.length() - 1)
                    : localAudioBaseUrl;
            return base + "/" + fileName;
        }

        if (!isConfigured()) {
            return stored;
        }

        // MP3s uploaded as "video" resource type on Cloudinary.
        String publicId = stored.endsWith(".mp3") ? stored : stored + ".mp3";
        return "https://res.cloudinary.com/" + cloudName + "/video/upload/" + publicId;
    }
}
