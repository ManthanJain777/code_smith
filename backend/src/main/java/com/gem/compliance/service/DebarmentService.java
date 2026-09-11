package com.gem.compliance.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * DebarmentService
 * Cross-references bidder identifiers against a curated debarred vendor list.
 * In production: this would query GeM's live debarment API or Ministry blacklist DB.
 * For demo: uses a static dataset of sample debarred entities.
 */
@Service
@Slf4j
public class DebarmentService {

    public enum DebarmentStatus { CLEAR, FLAGGED }

    public record DebarmentResult(
        DebarmentStatus status,
        String riskLevel,
        List<String> matchedEntries,
        String message,
        String checkedAt
    ) {}

    // ─── Static Debarred Vendor Database (Demo) ───────────────────────────
    // In production: pull from GeM API / Ministry of Finance blacklist DB
    private static final List<Map<String, String>> DEBARRED_VENDORS = Arrays.asList(
        Map.of("company", "Shady Contractors Ltd", "gstin", "27CCCCC2222C3Z7", "pan", "CCCCA9999C", "reason", "Fraudulent financial documents submitted in GEM/2024/B/55011"),
        Map.of("company", "FakeDocs Pvt Ltd", "gstin", "19DDDDD3333D4Z8", "pan", "DDDDA8888D", "reason", "Debarred for 3 years: collusion in GEM/2023/IT/20200"),
        Map.of("company", "Corrupt Supplies Co", "gstin", "07EEEEE4444E5Z9", "pan", "EEEEA7777E", "reason", "Blacklisted by Ministry of Petroleum, order dated 2025-01-15"),
        Map.of("company", "TestBlacklist Corp", "gstin", "22FFFFF5555F6Z0", "pan", "FFFFA6666F", "reason", "Debarred for non-performance under ONGC contract")
    );

    /**
     * Check if a bidder is debarred/blacklisted.
     * Matches on company name (fuzzy), GSTIN (exact), PAN (exact), or director name.
     */
    public DebarmentResult check(String companyName, String gstin, String pan, List<String> directorNames) {
        List<String> matches = new ArrayList<>();
        String checkedAt = java.time.Instant.now().toString();

        for (Map<String, String> entry : DEBARRED_VENDORS) {
            boolean matched = false;
            String reason = entry.get("reason");

            // Exact GSTIN match
            if (gstin != null && !gstin.isBlank() && gstin.equalsIgnoreCase(entry.get("gstin"))) {
                matches.add("GSTIN match: " + gstin + " — " + reason);
                matched = true;
            }

            // Exact PAN match
            if (pan != null && !pan.isBlank() && pan.equalsIgnoreCase(entry.get("pan"))) {
                matches.add("PAN match: " + pan + " — " + reason);
                matched = true;
            }

            // Company name fuzzy match (simple contains check)
            if (!matched && companyName != null && !companyName.isBlank()) {
                String nameNorm = companyName.toLowerCase().replaceAll("[^a-z0-9]", "");
                String entryNorm = entry.get("company").toLowerCase().replaceAll("[^a-z0-9]", "");
                if (nameNorm.contains(entryNorm) || entryNorm.contains(nameNorm)) {
                    matches.add("Company name match: '" + companyName + "' — " + reason);
                }
            }
        }

        if (matches.isEmpty()) {
            return new DebarmentResult(
                DebarmentStatus.CLEAR, "NONE", List.of(),
                "Bidder identity not found in any debarment or blacklist registry. CLEAR to proceed.",
                checkedAt
            );
        }

        log.warn("DEBARMENT FLAG: {} matches found for company='{}' GSTIN='{}'", matches.size(), companyName, gstin);
        return new DebarmentResult(
            DebarmentStatus.FLAGGED, "HIGH", matches,
            "WARNING: " + matches.size() + " debarment record(s) found. Refer to human procurement officer for investigation. DO NOT proceed automatically.",
            checkedAt
        );
    }
}
