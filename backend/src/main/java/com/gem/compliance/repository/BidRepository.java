package com.gem.compliance.repository;

import com.gem.compliance.domain.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, String> {
    List<Bid> findByTenderId(String tenderId);
    List<Bid> findByBidderGstin(String gstin);
    List<Bid> findByBidderPan(String pan);
    List<Bid> findByStatus(String status);

    @Query("SELECT b FROM Bid b WHERE b.tenderId = :tenderId AND b.status != 'REJECTED'")
    List<Bid> findActiveBidsForTender(String tenderId);
}
