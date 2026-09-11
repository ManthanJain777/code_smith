package com.gem.compliance.repository;

import com.gem.compliance.domain.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, String> {
    List<Seller> findByVerificationStatus(String verificationStatus);
    Optional<Seller> findByGstin(String gstin);

    @org.springframework.data.jpa.repository.Query("SELECT s FROM Seller s WHERE s.cinOrPan = :cinOrPan")
    Optional<Seller> findByCinOrPan(@org.springframework.data.repository.query.Param("cinOrPan") String cinOrPan);
}
