package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.entity.SearchItem;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class QuickSearchServiceImplTest {

    @Test
    void retriesAndEventuallySucceeds() {
        AtomicInteger calls = new AtomicInteger();
        QuickSearchServiceImpl service = new QuickSearchServiceImpl(null, null) {
            @Override
            List<SearchItem> loadLanguage(String filterId, String queryTemplate, String lang, long generation) {
                if (calls.incrementAndGet() < 3) {
                    throw new RuntimeException("simulated 429");
                }
                return List.of(new SearchItem(filterId, "Q1", "P1", lang, "label", "label", null, generation));
            }
        };
        service.retryMaxAttempts = 3;
        service.retryInitialBackoffMs = 1L;
        service.retryBackoffMultiplier = 1.0;

        List<SearchItem> result = service.loadLanguageWithRetry("global", "template", "ca", 123L);

        assertEquals(1, result.size());
        assertEquals(3, calls.get());
    }

    @Test
    void givesUpAfterMaxAttemptsAndReturnsNull() {
        AtomicInteger calls = new AtomicInteger();
        QuickSearchServiceImpl service = new QuickSearchServiceImpl(null, null) {
            @Override
            List<SearchItem> loadLanguage(String filterId, String queryTemplate, String lang, long generation) {
                calls.incrementAndGet();
                throw new RuntimeException("simulated 429");
            }
        };
        service.retryMaxAttempts = 3;
        service.retryInitialBackoffMs = 1L;
        service.retryBackoffMultiplier = 1.0;

        List<SearchItem> result = service.loadLanguageWithRetry("global", "template", "gl", 123L);

        assertNull(result);
        assertEquals(3, calls.get());
    }

    @Test
    void succeedsOnFirstAttemptWithoutRetrying() {
        AtomicInteger calls = new AtomicInteger();
        QuickSearchServiceImpl service = new QuickSearchServiceImpl(null, null) {
            @Override
            List<SearchItem> loadLanguage(String filterId, String queryTemplate, String lang, long generation) {
                calls.incrementAndGet();
                return List.of();
            }
        };
        service.retryMaxAttempts = 3;
        service.retryInitialBackoffMs = 1L;
        service.retryBackoffMultiplier = 1.0;

        List<SearchItem> result = service.loadLanguageWithRetry("global", "template", "en", 123L);

        assertEquals(0, result.size());
        assertEquals(1, calls.get());
    }
}
