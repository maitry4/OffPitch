package com.offpitch.backend.repository;

import com.offpitch.backend.model.SongDetail;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SongDetailRepository extends JpaRepository<SongDetail, UUID> {

    Optional<SongDetail> findBySongId(UUID songId);
}
