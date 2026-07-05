package io.github.philobiblon.backend.repository;

import io.github.philobiblon.backend.entity.CachedQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

public interface CachedQueryRepository extends JpaRepository<CachedQuery, String> {

    List<CachedQuery> findByLastAccessedAtBefore(Instant cutoff);

    @Transactional
    @Modifying
    @Query("UPDATE CachedQuery q SET q.lastAccessedAt = :accessedAt WHERE q.queryHash = :queryHash")
    void touch(@Param("queryHash") String queryHash, @Param("accessedAt") Instant accessedAt);
}
