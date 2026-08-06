package com.offpitch.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Builds playable audio URLs for karaoke tracks.
 * Prefers LOCAL_AUDIO_BASE_URL (local /media files) when set; otherwise Cloudinary CDN.
 */
@Component
public class CloudinaryProperties {

    /** Matches /video/upload/v1234567890/offpitch/songs/him-i_m.mp3 */
    private static final Pattern CLOUDINARY_UPLOAD_PATH = Pattern.compile(
            "/(?:video|raw|image)/upload/(?:v\\d+/)?(.+)$");

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

        String publicId = stored;
        if (stored.startsWith("http://") || stored.startsWith("https://")) {
            String extracted = extractCloudinaryPublicId(stored);
            if (extracted == null) {
                return stored;
            }
            publicId = extracted;
        }

        String fileName = publicId.contains("/")
                ? publicId.substring(publicId.lastIndexOf('/') + 1)
                : publicId;
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

        return buildCloudinaryUrl(publicId);
    }

    private String extractCloudinaryPublicId(String url) {
        if (!isConfigured() || !url.contains("res.cloudinary.com/" + cloudName + "/")) {
            return null;
        }
        Matcher matcher = CLOUDINARY_UPLOAD_PATH.matcher(url);
        if (!matcher.find()) {
            return null;
        }
        String publicId = matcher.group(1);
        if (publicId.endsWith(".mp3")) {
            publicId = publicId.substring(0, publicId.length() - 4);
        }
        return publicId;
    }

    private String buildCloudinaryUrl(String publicId) {
        String id = publicId.endsWith(".mp3") ? publicId : publicId + ".mp3";
        return "https://res.cloudinary.com/" + cloudName + "/video/upload/" + id;
    }
}
