package com.offpitch.backend.service;

import com.offpitch.backend.config.CloudinaryProperties;
import com.offpitch.backend.model.Song;
import com.offpitch.backend.model.SongDetail;
import com.offpitch.backend.repository.SongDetailRepository;
import com.offpitch.backend.repository.SongRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SongService {

    private final SongRepository songRepository;
    private final SongDetailRepository songDetailRepository;
    private final CloudinaryProperties cloudinary;

    public SongService(
            SongRepository songRepository,
            SongDetailRepository songDetailRepository,
            CloudinaryProperties cloudinary) {
        this.songRepository = songRepository;
        this.songDetailRepository = songDetailRepository;
        this.cloudinary = cloudinary;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listSongs() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Song song : songRepository.findAll()) {
            result.add(toSummary(song));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSong(UUID songId) {
        Song song = requireSong(songId);
        SongDetail detail = songDetailRepository.findBySongId(songId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Song details not found"));

        Map<String, Object> response = toSummary(song);
        response.put("timeline", detail.getTimeline());
        return response;
    }

    public Song requireSong(UUID songId) {
        return songRepository.findById(songId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found"));
    }

    public Map<String, Object> toSummary(Song song) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", song.getId().toString());
        map.put("title", song.getTitle());
        map.put("artist", nullToEmpty(song.getArtist()));
        map.put("album", nullToEmpty(song.getAlbum()));
        map.put("coverUrl", nullToEmpty(song.getCoverUrl()));
        map.put("durationSeconds", song.getDurationSeconds() != null ? song.getDurationSeconds() : 0);
        map.put("audioUrl", cloudinary.resolveAudioUrl(song.getAudioUrl()));
        return map;
    }

    public Map<String, Object> toPlaybackPayload(Song song, SongDetail detail, java.time.Instant startedAt) {
        Map<String, Object> map = toSummary(song);
        map.put("startedAt", startedAt.toString());
        map.put("serverNow", java.time.Instant.now().toString());
        map.put("timeline", detail != null ? detail.getTimeline() : Map.of("lyrics", List.of(), "effects", List.of()));
        return map;
    }

    private static String nullToEmpty(String value) {
        return value != null ? value : "";
    }
}
