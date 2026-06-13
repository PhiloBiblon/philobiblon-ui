package io.github.philobiblon.backend.repository;

import io.github.philobiblon.backend.entity.SearchItem;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface SearchItemRepository extends JpaRepository<SearchItem, Long> {

    @Query("SELECT s FROM SearchItem s " +
            "WHERE s.lang = :lang AND s.generation = :generation " +
            "AND s.searchText LIKE CONCAT('%', :term, '%') ESCAPE '\\\\' " +
            "ORDER BY LOCATE(:term, s.searchText), LENGTH(s.label), s.label")
    List<SearchItem> search(@Param("lang") String lang,
                            @Param("generation") long generation,
                            @Param("term") String term,
                            Limit limit);

    @Query("SELECT MAX(s.generation) FROM SearchItem s")
    Long findMaxGeneration();

    @Transactional
    long deleteByGenerationNot(long generation);
}
