package com.gem.compliance.repository;

import com.gem.compliance.domain.ComplianceResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplianceResultRepository extends JpaRepository<ComplianceResult, String> {
    List<ComplianceResult> findByBidId(String bidId);
    Optional<ComplianceResult> findByRequirementIdAndBidId(String requirementId, String bidId);
}
