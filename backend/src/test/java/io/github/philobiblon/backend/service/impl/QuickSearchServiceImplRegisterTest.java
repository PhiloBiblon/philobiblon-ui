package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.entity.SearchItem;
import io.github.philobiblon.backend.service.QuickSearchService.RegistrationResult;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.function.BooleanSupplier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class QuickSearchServiceImplRegisterTest {

    private QuickSearchServiceImpl newService(FakeSearchItemRepository items, FakeSearchFilterRepository filters) {
        QuickSearchServiceImpl service = new QuickSearchServiceImpl(items, filters) {
            @Override
            List<SearchItem> loadLanguage(String filterId, String queryTemplate, String lang, long generation) {
                return List.of(new SearchItem(filterId, "Q1", "P1", lang, "label", "label", null, generation));
            }
        };
        service.retryMaxAttempts = 1;
        service.retryInitialBackoffMs = 1L;
        service.retryBackoffMultiplier = 1.0;
        service.maxFilters = 50;
        service.languages = new String[] {"ca", "en"};
        return service;
    }

    private static void awaitTrue(BooleanSupplier condition) {
        long deadline = System.currentTimeMillis() + 2000;
        while (System.currentTimeMillis() < deadline) {
            if (condition.getAsBoolean()) {
                return;
            }
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
        assertTrue(condition.getAsBoolean(), "Condition not met within timeout");
    }

    @Test
    void registeringANewFilterTriggersAnImmediateAsyncLoad() {
        FakeSearchItemRepository items = new FakeSearchItemRepository();
        FakeSearchFilterRepository filters = new FakeSearchFilterRepository();
        QuickSearchServiceImpl service = newService(items, filters);

        RegistrationResult result = service.register("global", "template-v1");

        assertEquals(RegistrationResult.REGISTERED_NEW, result);
        awaitTrue(() -> items.countByFilterId("global") > 0);
    }

    @Test
    void reRegisteringTheSameTemplateIsANoOp() {
        FakeSearchItemRepository items = new FakeSearchItemRepository();
        FakeSearchFilterRepository filters = new FakeSearchFilterRepository();
        QuickSearchServiceImpl service = newService(items, filters);

        assertEquals(RegistrationResult.REGISTERED_NEW, service.register("global", "template-v1"));
        assertEquals(RegistrationResult.ALREADY_REGISTERED, service.register("global", "template-v1"));
        assertEquals("template-v1", filters.findById("global").orElseThrow().getQueryTemplate());
    }

    @Test
    void reRegisteringWithAChangedTemplateTriggersAReload() {
        FakeSearchItemRepository items = new FakeSearchItemRepository();
        FakeSearchFilterRepository filters = new FakeSearchFilterRepository();
        QuickSearchServiceImpl service = newService(items, filters);

        assertEquals(RegistrationResult.REGISTERED_NEW, service.register("global", "template-v1"));
        RegistrationResult result = service.register("global", "template-v2");

        assertEquals(RegistrationResult.TEMPLATE_UPDATED, result);
        assertEquals("template-v2", filters.findById("global").orElseThrow().getQueryTemplate());
    }

    @Test
    void registrationIsRejectedOnceTheRegistryIsAtCapacity() {
        FakeSearchItemRepository items = new FakeSearchItemRepository();
        FakeSearchFilterRepository filters = new FakeSearchFilterRepository();
        QuickSearchServiceImpl service = newService(items, filters);

        for (int i = 0; i < 50; i++) {
            assertEquals(RegistrationResult.REGISTERED_NEW, service.register("filter-" + i, "template"));
        }

        assertEquals(RegistrationResult.REJECTED_CAP, service.register("filter-50", "template"));
    }

    @Test
    void refreshReloadsEveryRegisteredFilter() {
        FakeSearchItemRepository items = new FakeSearchItemRepository();
        FakeSearchFilterRepository filters = new FakeSearchFilterRepository();
        QuickSearchServiceImpl service = newService(items, filters);

        service.register("global", "template-global");
        service.register("manid_library", "template-library");
        awaitTrue(() -> items.countByFilterId("global") > 0 && items.countByFilterId("manid_library") > 0);

        service.refresh();

        assertTrue(items.countByFilterId("global") > 0);
        assertTrue(items.countByFilterId("manid_library") > 0);
    }
}
