package io.github.philobiblon.backend.repository;

import io.github.philobiblon.backend.entity.SearchFilter;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SearchFilterRepository extends JpaRepository<SearchFilter, String> {
}
