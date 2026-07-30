package com.offpitch.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.offpitch.backend.config.CloudinaryProperties;
import com.offpitch.backend.model.Song;
import com.offpitch.backend.model.SongDetail;
import com.offpitch.backend.repository.SongDetailRepository;
import com.offpitch.backend.repository.SongRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Seeds the song catalog once on startup if empty.
 * Audio files themselves live on Cloudinary; we only store public_ids + lyrics JSON.
 */
@Component
public class SongCatalogSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SongCatalogSeeder.class);

    private final SongRepository songRepository;
    private final SongDetailRepository songDetailRepository;
    private final CloudinaryProperties cloudinary;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SongCatalogSeeder(
            SongRepository songRepository,
            SongDetailRepository songDetailRepository,
            CloudinaryProperties cloudinary) {
        this.songRepository = songRepository;
        this.songDetailRepository = songDetailRepository;
        this.cloudinary = cloudinary;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (songRepository.count() > 0) {
            return;
        }

        log.info("Seeding karaoke song catalog…");

        seedSong(
            "Him & I",
            "G-Eazy & Halsey",
            "Him & I",
            264,
            cloudinary.getFolder() + "/him-i_m",
            "songs/him_i.json"
        );

        seedSong(
            "Gallan Goodiyaan",
            "Yashita Sharma, Manish Kumar Tipu, Farhan Akhtar, Sukhwinder Singh, Javed Bashir",
            "Dil Dhadakne Do",
            296,
            cloudinary.getFolder() + "/Gallan_Goodiyaan_m",
            "songs/gallan_goodiyaan.json"
        );

        log.info("Song catalog seeded ({} songs).", songRepository.count());
    }

    private void seedSong(
            String title,
            String artist,
            String album,
            int durationSeconds,
            String cloudinaryPublicId,
            String lyricsClasspath) throws Exception {

        Song song = new Song(title, artist, album, null, durationSeconds, cloudinaryPublicId);
        songRepository.save(song);

        List<Map<String, Object>> rawLyrics = readLyrics(lyricsClasspath);
        List<Map<String, Object>> lyrics = new ArrayList<>();
        for (Map<String, Object> row : rawLyrics) {
            Map<String, Object> line = new LinkedHashMap<>();
            line.put("line", row.get("line"));
            line.put("startMs", srtToMs((String) row.get("start")));
            line.put("endMs", srtToMs((String) row.get("end")));
            line.put("text", row.get("text"));
            lyrics.add(line);
        }

        Map<String, Object> timeline = new LinkedHashMap<>();
        timeline.put("lyrics", lyrics);
        timeline.put("effects", List.of());

        songDetailRepository.save(new SongDetail(song.getId(), timeline));
    }

    private List<Map<String, Object>> readLyrics(String classpath) throws Exception {
        ClassPathResource resource = new ClassPathResource(classpath);
        try (InputStream in = resource.getInputStream()) {
            return objectMapper.readValue(in, new TypeReference<>() {});
        }
    }

    /** Converts "00:01:06,088" → milliseconds. */
    static long srtToMs(String srt) {
        String[] parts = srt.split(":");
        String[] secParts = parts[2].split(",");
        long hours = Long.parseLong(parts[0]);
        long minutes = Long.parseLong(parts[1]);
        long seconds = Long.parseLong(secParts[0]);
        long millis = Long.parseLong(secParts[1]);
        return (((hours * 60) + minutes) * 60 + seconds) * 1000 + millis;
    }
}
