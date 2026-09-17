package com.wanderplan.poll;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    Boolean existsByPollIdAndUserId(Long pollId, Long userId);
    Optional<Vote> findByPollIdAndUserId(Long pollId, Long userId);
    List<Vote> findByPollId(Long pollId);
    long countByOptionId(Long optionId);
}
