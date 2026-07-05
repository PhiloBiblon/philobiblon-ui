package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.entity.SearchItem;
import io.github.philobiblon.backend.repository.SearchItemRepository;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

/** Minimal in-memory fake covering only the methods QuickSearchServiceImpl actually calls. */
class FakeSearchItemRepository implements SearchItemRepository {

    private final List<SearchItem> items = new ArrayList<>();

    @Override
    public List<SearchItem> search(String filterId, String lang, long generation, String term, Limit limit) {
        throw new UnsupportedOperationException();
    }

    @Override
    public Long findMaxGenerationByFilterIdAndLang(String filterId, String lang) {
        return items.stream()
                .filter(i -> i.getFilterId().equals(filterId) && i.getLang().equals(lang))
                .map(SearchItem::getGeneration)
                .max(Long::compareTo)
                .orElse(null);
    }

    @Override
    public long deleteByFilterIdAndLangAndGenerationNot(String filterId, String lang, long generation) {
        int before = items.size();
        items.removeIf(i -> i.getFilterId().equals(filterId) && i.getLang().equals(lang) && i.getGeneration() != generation);
        return before - items.size();
    }

    @Override
    public long countByFilterId(String filterId) {
        return items.stream().filter(i -> i.getFilterId().equals(filterId)).count();
    }

    @Override
    public <S extends SearchItem> List<S> saveAll(Iterable<S> entities) {
        List<S> saved = new ArrayList<>();
        for (S entity : entities) {
            items.add(entity);
            saved.add(entity);
        }
        return saved;
    }

    @Override
    public <S extends SearchItem> S save(S entity) {
        items.add(entity);
        return entity;
    }

    @Override
    public Optional<SearchItem> findById(Long id) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean existsById(Long id) {
        throw new UnsupportedOperationException();
    }

    @Override
    public List<SearchItem> findAll() {
        return new ArrayList<>(items);
    }

    @Override
    public List<SearchItem> findAllById(Iterable<Long> longs) {
        throw new UnsupportedOperationException();
    }

    @Override
    public long count() {
        return items.size();
    }

    @Override
    public void deleteById(Long id) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void delete(SearchItem entity) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void deleteAllById(Iterable<? extends Long> longs) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void deleteAll(Iterable<? extends SearchItem> entities) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void deleteAll() {
        throw new UnsupportedOperationException();
    }

    @Override
    public List<SearchItem> findAll(Sort sort) {
        throw new UnsupportedOperationException();
    }

    @Override
    public org.springframework.data.domain.Page<SearchItem> findAll(Pageable pageable) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void flush() {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchItem> S saveAndFlush(S entity) {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchItem> List<S> saveAllAndFlush(Iterable<S> entities) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void deleteAllInBatch(Iterable<SearchItem> entities) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void deleteAllByIdInBatch(Iterable<Long> longs) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void deleteAllInBatch() {
        throw new UnsupportedOperationException();
    }

    @Override
    public SearchItem getById(Long id) {
        throw new UnsupportedOperationException();
    }

    @Override
    public SearchItem getOne(Long id) {
        throw new UnsupportedOperationException();
    }

    @Override
    public SearchItem getReferenceById(Long id) {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchItem> Optional<S> findOne(Example<S> example) {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchItem> List<S> findAll(Example<S> example) {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchItem> List<S> findAll(Example<S> example, Sort sort) {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchItem> org.springframework.data.domain.Page<S> findAll(Example<S> example, Pageable pageable) {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchItem> long count(Example<S> example) {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchItem> boolean exists(Example<S> example) {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchItem, R> R findBy(Example<S> example, Function<org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery<S>, R> queryFunction) {
        throw new UnsupportedOperationException();
    }
}
