package com.offpitch.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Serves karaoke MP3s from the repo's karaoke_songs/ folder for local/dev playback
 * when Cloudinary assets are missing or LOCAL_AUDIO_BASE_URL is used.
 */
@Configuration
public class MediaConfig implements WebMvcConfigurer {

    private final String localAudioDir;

    public MediaConfig(
            @Value("${LOCAL_AUDIO_DIR:../karaoke_songs}") String localAudioDir) {
        this.localAudioDir = localAudioDir;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path dir = Paths.get(localAudioDir).toAbsolutePath().normalize();
        String location = dir.toUri().toString();
        if (!location.endsWith("/")) {
            location = location + "/";
        }
        registry.addResourceHandler("/media/**")
                .addResourceLocations(location);
    }
}
