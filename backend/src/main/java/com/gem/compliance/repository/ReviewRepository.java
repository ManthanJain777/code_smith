package com.gem.compliance.repository;

import com.gem.compliance.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByComplianceResultId(String complianceResultId);
    List<Review> findByReviewerId(String reviewerId);
}
