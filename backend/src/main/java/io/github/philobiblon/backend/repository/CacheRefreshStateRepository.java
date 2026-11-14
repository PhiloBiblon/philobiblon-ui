package io.github.philobiblon.backend.repository;

import io.github.philobiblon.backend.entity.CacheRefreshState;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CacheRefreshStateRepository extends JpaRepository<CacheRefreshState, Long> {
}
