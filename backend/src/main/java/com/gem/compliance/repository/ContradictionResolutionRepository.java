package com.gem.compliance.repository;

import com.gem.compliance.domain.ContradictionResolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContradictionResolutionRepository extends JpaRepository<ContradictionResolution, String> {
    List<ContradictionResolution> findByBidId(String bidId);
    List<ContradictionResolution> findByRequirementId(String requirementId);
}
