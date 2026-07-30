package com.offpitch.backend.repository;

import com.offpitch.backend.model.Song;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SongRepository extends JpaRepository<Song, UUID> {

    Optional<Song> findByTitleIgnoreCase(String title);
}
