package com.offpitch.backend.controller;

import com.offpitch.backend.service.SongService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/songs")
public class SongController {

    private final SongService songService;

    public SongController(SongService songService) {
        this.songService = songService;
    }

    /** GET /api/songs — catalog for the song picker. */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listSongs() {
        return ResponseEntity.ok(songService.listSongs());
    }

    /** GET /api/songs/{id} — full song + lyrics timeline. */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getSong(@PathVariable UUID id) {
        return ResponseEntity.ok(songService.getSong(id));
    }
}
