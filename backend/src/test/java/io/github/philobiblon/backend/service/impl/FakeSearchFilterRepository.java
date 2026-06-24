package io.github.philobiblon.backend.service.impl;

import io.github.philobiblon.backend.entity.SearchFilter;
import io.github.philobiblon.backend.repository.SearchFilterRepository;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.function.Function;

/** Minimal in-memory fake covering only the methods QuickSearchServiceImpl actually calls. */
class FakeSearchFilterRepository implements SearchFilterRepository {

    private final ConcurrentSkipListMap<String, SearchFilter> byId = new ConcurrentSkipListMap<>();

    @Override
    public <S extends SearchFilter> S save(S entity) {
        byId.put(entity.getFilterId(), entity);
        return entity;
    }

    @Override
    public Optional<SearchFilter> findById(String filterId) {
        return Optional.ofNullable(byId.get(filterId));
    }

    @Override
    public long count() {
        return byId.size();
    }

    @Override
    public List<SearchFilter> findAll() {
        return new ArrayList<>(byId.values());
    }

    @Override
    public <S extends SearchFilter> List<S> saveAll(Iterable<S> entities) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean existsById(String s) {
        throw new UnsupportedOperationException();
    }

    @Override
    public List<SearchFilter> findAllById(Iterable<String> strings) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void deleteById(String s) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void delete(SearchFilter entity) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void deleteAllById(Iterable<? extends String> strings) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void deleteAll(Iterable<? extends SearchFilter> entities) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void deleteAll() {
        throw new UnsupportedOperationException();
    }

    @Override
    public List<SearchFilter> findAll(Sort sort) {
        throw new UnsupportedOperationException();
    }

    @Override
    public org.springframework.data.domain.Page<SearchFilter> findAll(Pageable pageable) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void flush() {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchFilter> S saveAndFlush(S entity) {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchFilter> List<S> saveAllAndFlush(Iterable<S> entities) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void deleteAllInBatch(Iterable<SearchFilter> entities) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void deleteAllByIdInBatch(Iterable<String> strings) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void deleteAllInBatch() {
        throw new UnsupportedOperationException();
    }

    @Override
    public SearchFilter getById(String s) {
        throw new UnsupportedOperationException();
    }

    @Override
    public SearchFilter getOne(String s) {
        throw new UnsupportedOperationException();
    }

    @Override
    public SearchFilter getReferenceById(String s) {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchFilter> Optional<S> findOne(Example<S> example) {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchFilter> List<S> findAll(Example<S> example) {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchFilter> List<S> findAll(Example<S> example, Sort sort) {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchFilter> org.springframework.data.domain.Page<S> findAll(Example<S> example, Pageable pageable) {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchFilter> long count(Example<S> example) {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchFilter> boolean exists(Example<S> example) {
        throw new UnsupportedOperationException();
    }

    @Override
    public <S extends SearchFilter, R> R findBy(Example<S> example, Function<org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery<S>, R> queryFunction) {
        throw new UnsupportedOperationException();
    }
}
