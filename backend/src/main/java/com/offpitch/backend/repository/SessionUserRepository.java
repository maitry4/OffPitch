package com.offpitch.backend.repository;

import com.offpitch.backend.model.SessionUser;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface SessionUserRepository extends JpaRepository<SessionUser, UUID> {

    List<SessionUser> findBySessionIdOrderByJoinedAtAsc(UUID sessionId);

    Optional<SessionUser> findBySessionIdAndUserId(UUID sessionId, UUID userId);

    boolean existsBySessionIdAndUserId(UUID sessionId, UUID userId);

    long countBySessionId(UUID sessionId);

    @Modifying(clearAutomatically = true)
    @Transactional
    void deleteBySessionIdAndUserId(UUID sessionId, UUID userId);
}
