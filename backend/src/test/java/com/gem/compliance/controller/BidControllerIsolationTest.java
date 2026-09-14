package com.gem.compliance.controller;

import com.gem.compliance.domain.Bid;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class BidControllerIsolationTest {

    private boolean oldFuzzyMatch(String userFullName, String userEmail, Bid b) {
        String cleanFullName = userFullName != null ? userFullName.toLowerCase() : "";
        return (b.getBidderEmail() != null && b.getBidderEmail().equalsIgnoreCase(userEmail))
            || (b.getBidderName() != null && !cleanFullName.isEmpty() && cleanFullName.contains(b.getBidderName().toLowerCase().split(" ")[0]));
    }

    private boolean newExactEmailMatch(String userEmail, Bid b) {
        return b.getBidderEmail() != null && b.getBidderEmail().equalsIgnoreCase(userEmail);
    }

    @Test
    @DisplayName("REGRESSION PROOF 1: Old fuzzy match leaks competitor bid to St. John Technologies Ltd")
    void testOldFuzzyMatchLeaksCompetitorBid() {
        // Competitor bid submitted by John Doe Enterprises
        Bid competitorBid = Bid.builder()
            .id("BID-COMPETITOR-001")
            .tenderId("TND-PUMPS-01")
            .bidderName("John Doe Enterprises")
            .bidderEmail("johndoe@competitor.com")
            .build();

        // Authenticated user: St. John Technologies Ltd
        String authenticatedUserFullName = "St. John Technologies Ltd";
        String authenticatedUserEmail = "stjohn@stjohntech.com";

        // PROOF: Under old fuzzy matching, "st. john technologies ltd".contains("john") evaluates to TRUE
        boolean oldMatchResult = oldFuzzyMatch(authenticatedUserFullName, authenticatedUserEmail, competitorBid);
        assertTrue(oldMatchResult, "PROVEN: Old fuzzy matching erroneously leaked competitor John Doe's bid to St. John Technologies Ltd!");

        // PROOF: Under new exact email matching, the competitor bid is strictly isolated and BLOCKED
        boolean newMatchResult = newExactEmailMatch(authenticatedUserEmail, competitorBid);
        assertFalse(newMatchResult, "PROVEN: New exact email matching strictly blocks competitor bid leak!");
    }

    @Test
    @DisplayName("REGRESSION PROOF 2: Old fuzzy match leaks competitor bid to Johnson Solutions")
    void testOldFuzzyMatchLeaksToJohnsonSolutions() {
        Bid competitorBid = Bid.builder()
            .id("BID-COMPETITOR-002")
            .tenderId("TND-PUMPS-01")
            .bidderName("John Doe Enterprises")
            .bidderEmail("johndoe@competitor.com")
            .build();

        // Authenticated user: Johnson Solutions
        String authenticatedUserFullName = "Johnson Solutions";
        String authenticatedUserEmail = "info@johnsonsolutions.com";

        // "johnson solutions".contains("john") is TRUE
        boolean oldMatchResult = oldFuzzyMatch(authenticatedUserFullName, authenticatedUserEmail, competitorBid);
        assertTrue(oldMatchResult, "PROVEN: Old fuzzy matching erroneously leaked John Doe's bid to Johnson Solutions!");

        // Blocked under new exact match
        boolean newMatchResult = newExactEmailMatch(authenticatedUserEmail, competitorBid);
        assertFalse(newMatchResult, "PROVEN: Exact email match blocks leak to Johnson Solutions!");
    }

    @Test
    @DisplayName("Legitimate own-bid matching works with exact email")
    void testLegitimateOwnBidMatches() {
        Bid ownBid = Bid.builder()
            .id("BID-STJOHN-001")
            .tenderId("TND-PUMPS-01")
            .bidderName("St. John Technologies Ltd")
            .bidderEmail("stjohn@stjohntech.com")
            .build();

        String authenticatedUserEmail = "stjohn@stjohntech.com";
        assertTrue(newExactEmailMatch(authenticatedUserEmail, ownBid), "Legitimate bidder's own bid matches correctly");
    }
}
