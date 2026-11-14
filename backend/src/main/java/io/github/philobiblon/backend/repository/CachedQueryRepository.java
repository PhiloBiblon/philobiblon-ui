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

    /** Updates last_accessed_at and adds usageDelta to the lifetime usage counter in one write. */
    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("UPDATE CachedQuery q SET q.lastAccessedAt = :accessedAt, " +
            "q.usageTotal = q.usageTotal + :usageDelta " +
            "WHERE q.queryHash = :queryHash")
    void touch(@Param("queryHash") String queryHash, @Param("accessedAt") Instant accessedAt, @Param("usageDelta") long usageDelta);

    /** Flags every query whose source tables match the LIKE pattern, e.g. "% manid %" (padded tokens). */
    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("UPDATE CachedQuery q SET q.dirty = true WHERE q.sourceTables IS NOT NULL AND q.sourceTables LIKE :token")
    int markDirtyBySourceTable(@Param("token") String token);

    /** Flags the given queries. */
    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("UPDATE CachedQuery q SET q.dirty = true WHERE q.queryHash IN :hashes")
    int markDirtyByHashes(@Param("hashes") java.util.Collection<String> hashes);
}
