package com.offpitch.backend.repository;

import com.offpitch.backend.model.KaraokeSession;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KaraokeSessionRepository extends JpaRepository<KaraokeSession, UUID> {

    Optional<KaraokeSession> findByInviteCodeIgnoreCase(String inviteCode);

    boolean existsByInviteCodeIgnoreCase(String inviteCode);
}
