package com.offpitch.backend.repository;

import com.offpitch.backend.model.SessionUser;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionUserRepository extends JpaRepository<SessionUser, UUID> {

    List<SessionUser> findBySessionIdOrderByJoinedAtAsc(UUID sessionId);

    Optional<SessionUser> findBySessionIdAndUserId(UUID sessionId, UUID userId);

    boolean existsBySessionIdAndUserId(UUID sessionId, UUID userId);

    long countBySessionId(UUID sessionId);
}
