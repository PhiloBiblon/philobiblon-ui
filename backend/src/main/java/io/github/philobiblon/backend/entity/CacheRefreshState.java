package io.github.philobiblon.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/** Single-row state of the change-driven nightly refresh (row id is always {@link #SINGLETON_ID}). */
@Entity
@Table(name = "cache_refresh_state")
public class CacheRefreshState {

    public static final long SINGLETON_ID = 1L;

    @Id
    private Long id = SINGLETON_ID;

    /** Start of the last change-detection cycle that completed; the next window starts here (minus the overlap). */
    @Column(name = "last_change_poll_at")
    private Instant lastChangePollAt;

    /** Start of the last cycle that reloaded every registered query. */
    @Column(name = "last_full_refresh_at")
    private Instant lastFullRefreshAt;

    @Column(name = "last_change_detection_error", length = 2000)
    private String lastChangeDetectionError;

    @Column(name = "last_change_detection_error_at")
    private Instant lastChangeDetectionErrorAt;

    public Long getId() {
        return id;
    }

    public Instant getLastChangePollAt() {
        return lastChangePollAt;
    }

    public void setLastChangePollAt(Instant lastChangePollAt) {
        this.lastChangePollAt = lastChangePollAt;
    }

    public Instant getLastFullRefreshAt() {
        return lastFullRefreshAt;
    }

    public void setLastFullRefreshAt(Instant lastFullRefreshAt) {
        this.lastFullRefreshAt = lastFullRefreshAt;
    }

    public String getLastChangeDetectionError() {
        return lastChangeDetectionError;
    }

    public void setLastChangeDetectionError(String lastChangeDetectionError) {
        this.lastChangeDetectionError = lastChangeDetectionError;
    }

    public Instant getLastChangeDetectionErrorAt() {
        return lastChangeDetectionErrorAt;
    }

    public void setLastChangeDetectionErrorAt(Instant lastChangeDetectionErrorAt) {
        this.lastChangeDetectionErrorAt = lastChangeDetectionErrorAt;
    }
}
