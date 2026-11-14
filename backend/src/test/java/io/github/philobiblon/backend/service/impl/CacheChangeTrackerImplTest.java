package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.entity.CacheRefreshState;
import io.github.philobiblon.backend.repository.CacheRefreshStateRepository;
import io.github.philobiblon.backend.repository.CachedQueryRepository;
import io.github.philobiblon.backend.repository.CachedQueryRowRepository;
import io.github.philobiblon.backend.service.CacheChangeTracker.Detection;
import io.github.philobiblon.backend.service.CacheChangeTracker.Mode;
import io.github.philobiblon.backend.service.WikibaseChangeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CacheChangeTrackerImplTest {

    private final Instant now = Instant.parse("2026-11-14T03:00:00Z");
    private CacheRefreshStateRepository stateRepository;
    private CachedQueryRepository queryRepository;
    private CachedQueryRowRepository rowRepository;
    private WikibaseChangeService changeService;
    private CacheRefreshState state;
    private List<String> pbidsToReturn = List.of();

    @BeforeEach
    void setUp() {
        stateRepository = mock(CacheRefreshStateRepository.class);
        queryRepository = mock(CachedQueryRepository.class);
        rowRepository = mock(CachedQueryRowRepository.class);
        changeService = mock(WikibaseChangeService.class);
        state = new CacheRefreshState();
        state.setLastChangePollAt(now.minus(Duration.ofDays(1)));
        state.setLastFullRefreshAt(now.minus(Duration.ofDays(2)));
        when(stateRepository.findById(CacheRefreshState.SINGLETON_ID)).thenReturn(Optional.of(state));
        when(changeService.changedItems(any(), any())).thenReturn(Set.of());
        when(changeService.deletedItems(any(), any())).thenReturn(Set.of());
    }

    private CacheChangeTrackerImpl tracker() {
        CacheChangeTrackerImpl tracker = new CacheChangeTrackerImpl(stateRepository, queryRepository, rowRepository,
                changeService) {
            @Override
            List<String> fetchPbids(List<String> items) {
                return pbidsToReturn;
            }
        };
        tracker.maxChangedItems = 100;
        return tracker;
    }

    @Test
    void conditionAMarksQueriesOfTheTableOfChangedItems() {
        when(changeService.changedItems(any(), any())).thenReturn(Set.of("Q1", "Q2"));
        pbidsToReturn = List.of("BETA manid 1234", "BITECA manid 5");

        Detection detection = tracker().detect(now);

        assertEquals(Mode.MARKED, detection.mode());
        assertEquals(2, detection.changedItems());
        verify(queryRepository).markDirtyBySourceTable("% manid %");
        verify(queryRepository, never()).markDirtyBySourceTable("% texid %");
        assertEquals(now, state.getLastChangePollAt());
    }

    @Test
    void itemsWithoutPbidDoNotMarkAnyTable() {
        when(changeService.changedItems(any(), any())).thenReturn(Set.of("Q1"));
        pbidsToReturn = List.of();

        assertEquals(Mode.MARKED, tracker().detect(now).mode());

        verify(queryRepository, never()).markDirtyBySourceTable(any());
    }

    @Test
    void conditionBMarksQueriesHoldingTheChangedItems() {
        when(changeService.changedItems(any(), any())).thenReturn(Set.of("Q1"));
        when(rowRepository.findQueryHashesByItemIdIn(anyCollection())).thenReturn(List.of("h1", "h2"));

        tracker().detect(now);

        verify(queryRepository).markDirtyByHashes(Set.of("h1", "h2"));
    }

    @Test
    void deletedItemsAreResolvedFromTheCachedPayload() {
        when(changeService.deletedItems(any(), any())).thenReturn(Set.of("Q9"));
        when(rowRepository.findPayloadsByItemIdIn(anyCollection()))
                .thenReturn(List.of("{\"pbid\":\"BETA texid 7\"}", "{\"label\":\"no pbid\"}", "not json"));

        tracker().detect(now);

        verify(queryRepository).markDirtyBySourceTable("% texid %");
        verify(queryRepository, never()).markDirtyBySourceTable("% manid %");
    }

    @Test
    void firstRunIsAFullRefreshWithoutCallingFactGrid() {
        state.setLastChangePollAt(null);

        assertEquals(Mode.FULL_REFRESH, tracker().detect(now).mode());

        verify(changeService, never()).changedItems(any(), any());
    }

    @Test
    void fullRefreshWhenTheWeeklyBoundIsReached() {
        state.setLastFullRefreshAt(now.minus(Duration.ofDays(8)));

        assertEquals(Mode.FULL_REFRESH, tracker().detect(now).mode());

        verify(changeService, never()).changedItems(any(), any());
    }

    @Test
    void fullRefreshWhenTooManyItemsChanged() {
        CacheChangeTrackerImpl tracker = tracker();
        tracker.maxChangedItems = 1;
        when(changeService.changedItems(any(), any())).thenReturn(Set.of("Q1", "Q2"));

        Detection detection = tracker.detect(now);

        assertEquals(Mode.FULL_REFRESH, detection.mode());
        assertEquals(2, detection.changedItems());
    }

    @Test
    void windowStartsOverlapMinutesBeforeTheWatermark() {
        CacheChangeTrackerImpl tracker = tracker();
        tracker.overlapMinutes = 60;

        tracker.detect(now);

        verify(changeService).changedItems(now.minus(Duration.ofDays(1)).minus(Duration.ofMinutes(60)), now);
    }

    @Test
    void failureStoresTheErrorAndKeepsTheWatermark() {
        Instant watermark = state.getLastChangePollAt();
        when(changeService.changedItems(any(), any())).thenThrow(new IllegalStateException("reputation challenge"));

        assertEquals(Mode.UNAVAILABLE, tracker().detect(now).mode());

        assertEquals(watermark, state.getLastChangePollAt());
        assertNotNull(state.getLastChangeDetectionErrorAt());
        assertEquals(true, state.getLastChangeDetectionError().contains("reputation challenge"));
        verify(queryRepository, never()).markDirtyByHashes(any());
    }

    @Test
    void sparqlFailureIsHandledLikeAFeedFailure() {
        when(changeService.changedItems(any(), any())).thenReturn(Set.of("Q1"));
        Instant watermark = state.getLastChangePollAt();
        CacheChangeTrackerImpl tracker = new CacheChangeTrackerImpl(stateRepository, queryRepository, rowRepository,
                changeService) {
            @Override
            List<String> fetchPbids(List<String> items) {
                throw new IllegalStateException("sparql down");
            }
        };

        assertEquals(Mode.UNAVAILABLE, tracker.detect(now).mode());
        assertEquals(watermark, state.getLastChangePollAt());
    }

    @Test
    void successClearsThePreviousError() {
        state.setLastChangeDetectionError("old");
        state.setLastChangeDetectionErrorAt(now.minus(Duration.ofDays(1)));

        tracker().detect(now);

        assertNull(state.getLastChangeDetectionError());
        assertNull(state.getLastChangeDetectionErrorAt());
    }

    @Test
    void recordFullRefreshMovesBothClocks() {
        tracker().recordFullRefresh(now);

        assertEquals(now, state.getLastFullRefreshAt());
        assertEquals(now, state.getLastChangePollAt());
        verify(stateRepository).save(state);
    }

    @Test
    void extractsTheTableFromAPbid() {
        assertEquals("manid", CacheChangeTrackerImpl.tableOfPbid("BETA manid 1234"));
        assertNull(CacheChangeTrackerImpl.tableOfPbid("garbage"));
        assertNull(CacheChangeTrackerImpl.tableOfPbid(null));
    }
}
