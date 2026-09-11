package com.gem.compliance.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gem.compliance.domain.Seller;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GovernmentVerificationService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── GSTN ─────────────────────────────────────────────────────────────
    public String queryGstnConnector(String gstin, String legalName) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("connector", "GSTN_PORTAL");
        resp.put("gstin", gstin);
        if (gstin != null && gstin.startsWith("07AAAAA")) {
            resp.put("status", "ACTIVE");
            resp.put("tradeName", "Apex Pumps & Motors Pvt Ltd");
            resp.put("taxpayerType", "Regular");
            resp.put("registrationDate", "2017-07-01");
            resp.put("lastReturnFiledDate", "2026-08-20");
            resp.put("pendingReturns", 0);
            resp.put("complianceScore", 98.5);
            resp.put("matched", true);
        } else if (gstin != null && gstin.startsWith("07AAACX")) {
            resp.put("status", "ACTIVE");
            resp.put("tradeName", "XYZ Infrastructure Pvt Ltd");
            resp.put("taxpayerType", "Regular");
            resp.put("registrationDate", "2015-04-12");
            resp.put("lastReturnFiledDate", "2026-08-25");
            resp.put("pendingReturns", 0);
            resp.put("complianceScore", 99.0);
            resp.put("matched", true);
        } else if (gstin != null && gstin.startsWith("27DDDDD")) {
            resp.put("status", "CANCELLED_TAX_DEFAULT");
            resp.put("tradeName", "Vortex Corp");
            resp.put("taxpayerType", "Regular");
            resp.put("cancellationDate", "2026-01-15");
            resp.put("pendingReturns", 8);
            resp.put("complianceScore", 30.0);
            resp.put("matched", false);
        } else {
            resp.put("status", "ACTIVE");
            resp.put("tradeName", legalName != null ? legalName : "Registered Entity");
            resp.put("taxpayerType", "Regular");
            resp.put("lastReturnFiledDate", "2026-08-15");
            resp.put("pendingReturns", 0);
            resp.put("complianceScore", 85.0);
            resp.put("matched", true);
        }
        return toJson(resp);
    }

    // ── PAN & INCOME TAX ─────────────────────────────────────────────────
    public String queryPanIncomeTaxConnector(String pan, String legalName) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("connector", "PAN_INCOME_TAX_PORTAL");
        resp.put("pan", pan);
        if (pan == null || pan.isBlank()) {
            resp.put("panStatus", "NOT_FOUND");
            resp.put("itrFilingStatus", "NOT_FOUND");
            resp.put("matched", false);
        } else if (pan.toUpperCase().startsWith("AAACA") || pan.toUpperCase().startsWith("AAACX")) {
            resp.put("panStatus", "ACTIVE");
            resp.put("panHolder", legalName != null ? legalName : "Registered Entity");
            resp.put("assessmentYear", "AY2025-26");
            resp.put("itrFilingStatus", "FILED");
            resp.put("itrFiledDate", "2025-10-28");
            resp.put("taxDefaultStatus", "NIL");
            resp.put("tdsCompliance", "COMPLIANT");
            resp.put("matched", true);
        } else if (pan.toUpperCase().startsWith("AAACG") || pan.toUpperCase().startsWith("AAACV")) {
            resp.put("panStatus", "ACTIVE");
            resp.put("assessmentYear", "AY2025-26");
            resp.put("itrFilingStatus", "OVERDUE");
            resp.put("taxDefaultStatus", "DEMAND_RAISED");
            resp.put("outstandingDemandAmount", 2450000);
            resp.put("matched", false);
        } else {
            resp.put("panStatus", "ACTIVE");
            resp.put("panHolder", legalName != null ? legalName : "Registered Entity");
            resp.put("assessmentYear", "AY2025-26");
            resp.put("itrFilingStatus", "FILED");
            resp.put("itrFiledDate", "2025-10-15");
            resp.put("taxDefaultStatus", "NIL");
            resp.put("matched", true);
        }
        return toJson(resp);
    }

    // ── MCA21 ─────────────────────────────────────────────────────────────
    public String queryMca21Connector(String cin, String legalName) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("connector", "MCA21_CORPORATE_REGISTRY");
        resp.put("cin", cin);
        resp.put("companyStatus", "ACTIVE");
        resp.put("classOfCompany", "Private");
        resp.put("incorporationDate", "2015-03-22");
        resp.put("authorizedCapital", 100000000);
        resp.put("paidUpCapital", 50000000);
        resp.put("activeDirectorsCount", 3);
        resp.put("lastAgmDate", "2025-09-30");
        resp.put("annualReturnFiled", true);
        resp.put("matched", cin != null && !cin.isBlank());
        return toJson(resp);
    }

    // ── UDYAM / MSME ─────────────────────────────────────────────────────
    public String queryUdyamConnector(String udyamNo, String legalName) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("connector", "UDYAM_MSME_PORTAL");
        resp.put("udyamRegistrationNumber", udyamNo);
        resp.put("enterpriseType", udyamNo != null && udyamNo.contains("04") ? "MICRO" : "MEDIUM");
        resp.put("majorActivity", "MANUFACTURING");
        resp.put("socialCategory", "GENERAL");
        resp.put("validUntil", "LIFETIME");
        resp.put("nic2008Code", "28121");
        resp.put("msmeExemptions", new String[]{"EMD_WAIVER", "PERFORMANCE_SECURITY_REDUCTION"});
        resp.put("matched", udyamNo != null && !udyamNo.isBlank());
        return toJson(resp);
    }

    // ── STARTUP INDIA / DPIIT ─────────────────────────────────────────────
    public String queryDpiitConnector(String dpiitNo) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("connector", "DPIIT_STARTUP_INDIA");
        resp.put("dpiitRegistrationNumber", dpiitNo);
        resp.put("startupRecognized", dpiitNo != null && !dpiitNo.isBlank());
        resp.put("taxExemptionStatus", dpiitNo != null && !dpiitNo.isBlank() ? "GRANTED" : "NOT_APPLICABLE");
        resp.put("sectorClassification", "Industrial Machinery");
        resp.put("recognitionDate", "2021-04-01");
        resp.put("matched", dpiitNo != null && !dpiitNo.isBlank());
        return toJson(resp);
    }

    // ── NSIC ─────────────────────────────────────────────────────────────
    public String queryNsicConnector(String nsicRegNo, String legalName) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("connector", "NSIC_REGISTRATION");
        resp.put("nsicRegistrationNumber", nsicRegNo);
        if (nsicRegNo != null && !nsicRegNo.isBlank()) {
            resp.put("registrationStatus", "ACTIVE");
            resp.put("registeredItems", new String[]{"Centrifugal Pumps", "Submersible Pumps", "Motor Control Panels"});
            resp.put("validityDate", "2027-03-31");
            resp.put("monetaryLimit", "Rs. 50 Crore");
            resp.put("nsicSinglePointRegistration", true);
            resp.put("benefits", new String[]{"EMD_EXEMPTION", "TENDER_FEE_EXEMPTION", "PRICE_PREFERENCE"});
            resp.put("matched", true);
        } else {
            resp.put("registrationStatus", "NOT_REGISTERED");
            resp.put("matched", false);
        }
        return toJson(resp);
    }

    // ── OEM AUTHORIZATION ─────────────────────────────────────────────────
    public String queryOemAuthorizationConnector(String oemAuthRef, String manufacturerName) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("connector", "OEM_AUTHORIZATION_REGISTRY");
        resp.put("oemAuthorizationReference", oemAuthRef);
        if (oemAuthRef != null && !oemAuthRef.isBlank()) {
            resp.put("authorizationStatus", "VALID");
            resp.put("originalEquipmentManufacturer", manufacturerName != null ? manufacturerName : "Registered OEM");
            resp.put("authorizedDealer", true);
            resp.put("productCategories", new String[]{"Industrial Pumps", "Submersible Motors"});
            resp.put("validFrom", "2024-04-01");
            resp.put("validUntil", "2027-03-31");
            resp.put("geographicScope", "PAN India");
            resp.put("matched", true);
        } else {
            resp.put("authorizationStatus", "NOT_FOUND");
            resp.put("matched", false);
        }
        return toJson(resp);
    }

    // ── MAKE IN INDIA / LOCAL CONTENT ─────────────────────────────────────
    public String queryMakeInIndiaConnector(String miiRegNo, String legalName) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("connector", "MAKE_IN_INDIA_DPIIT_PORTAL");
        resp.put("miiRegistrationNumber", miiRegNo);
        if (miiRegNo != null && !miiRegNo.isBlank()) {
            resp.put("miiStatus", "REGISTERED");
            resp.put("localContentPercentage", 72.5);
            resp.put("localContentThreshold", 50.0);
            resp.put("localContentCompliant", true);
            resp.put("productCategory", "Class III — Industrial Machinery (Pumps & Motors)");
            resp.put("selfCertificationDate", "2026-04-01");
            resp.put("dpiitApprovalStatus", "APPROVED");
            resp.put("matched", true);
        } else {
            resp.put("miiStatus", "NOT_REGISTERED");
            resp.put("localContentCompliant", false);
            resp.put("matched", false);
        }
        return toJson(resp);
    }

    // ── BIS / DPIIT Standard Mark ─────────────────────────────────────────
    public String queryBisConnector(String bisLicense) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("connector", "BIS_STANDARD_MARK");
        resp.put("bisLicenseNumber", bisLicense);
        resp.put("standardNumber", "IS 1520:2002");
        resp.put("validityStatus", bisLicense != null && !bisLicense.isBlank() ? "VALID" : "NOT_FOUND");
        resp.put("productCategory", "Centrifugal Pumps for Clear Cold Fresh Water");
        resp.put("validityDate", "2027-06-30");
        resp.put("matched", bisLicense != null && !bisLicense.isBlank());
        return toJson(resp);
    }

    // ── EPFO ─────────────────────────────────────────────────────────────
    public String queryEpfoConnector(String epfoCode) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("connector", "EPFO_COMPLIANCE_PORTAL");
        resp.put("establishmentCode", epfoCode);
        resp.put("activeWorkersCount", epfoCode != null && !epfoCode.isBlank() ? 142 : 0);
        resp.put("lastEcrReturnMonth", "2026-08");
        resp.put("pendingECRs", 0);
        resp.put("complianceStatus", epfoCode != null && !epfoCode.isBlank() ? "COMPLIANT" : "NON_COMPLIANT");
        resp.put("defaultAmount", 0);
        resp.put("matched", epfoCode != null && !epfoCode.isBlank());
        return toJson(resp);
    }

    // ── ESIC ─────────────────────────────────────────────────────────────
    public String queryEsicConnector(String esicCode, String legalName) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("connector", "ESIC_COMPLIANCE_PORTAL");
        resp.put("esicCode", esicCode);
        if (esicCode != null && !esicCode.isBlank()) {
            resp.put("registrationStatus", "ACTIVE");
            resp.put("insuredEmployees", 138);
            resp.put("lastContributionMonth", "2026-08");
            resp.put("pendingContributions", 0);
            resp.put("complianceStatus", "COMPLIANT");
            resp.put("defaultAmount", 0);
            resp.put("matched", true);
        } else {
            resp.put("registrationStatus", "NOT_REGISTERED");
            resp.put("complianceStatus", "NOT_APPLICABLE");
            resp.put("matched", false);
        }
        return toJson(resp);
    }

    // ── DIGILOCKER ────────────────────────────────────────────────────────
    public String queryDigiLockerConnector(String docChecksum) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("connector", "DIGILOCKER_VERIFIABLE_CREDENTIALS");
        resp.put("credentialHash", docChecksum);
        resp.put("digitalSignatureValid", true);
        resp.put("issuerAuthority", "Controller of Certifying Authorities (CCA)");
        resp.put("documentType", "Udyam Registration Certificate");
        resp.put("issuedDate", "2021-07-01");
        resp.put("verificationTimestamp", java.time.Instant.now().toString());
        resp.put("matched", true);
        return toJson(resp);
    }

    // ── DEBARMENT / BLACKLIST ─────────────────────────────────────────────
    public String queryDebarmentConnector(String pan, String cin) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("connector", "GEM_DEBARMENT_BLACKLIST");
        resp.put("pan", pan);
        resp.put("cin", cin);
        boolean isDebarred = (pan != null && pan.toUpperCase().startsWith("AAACG"));
        resp.put("debarmentStatus", isDebarred ? "DEBARRED" : "CLEAR");
        resp.put("blacklistedPortals", isDebarred ? new String[]{"GeM", "CPPP"} : new String[]{});
        resp.put("debarmentReason", isDebarred ? "Fraud and Misrepresentation (MoF Order 2024)" : null);
        resp.put("debarmentUntil", isDebarred ? "2028-12-31" : null);
        resp.put("matched", true);
        return toJson(resp);
    }

    // ── ORCHESTRATOR: All-Portal Full Verification ─────────────────────────
    public Map<String, Object> runAllPortalChecks(Seller seller) {
        Map<String, Object> report = new LinkedHashMap<>();
        String pan = extractPan(seller.getCinOrPan());

        report.put("GSTN", parseJson(queryGstnConnector(seller.getGstin(), seller.getOrganizationName())));
        report.put("PAN_INCOME_TAX", parseJson(queryPanIncomeTaxConnector(pan, seller.getOrganizationName())));
        report.put("MCA21", parseJson(queryMca21Connector(seller.getCinOrPan(), seller.getOrganizationName())));
        report.put("UDYAM_MSME", parseJson(queryUdyamConnector(seller.getUdyamRegistration(), seller.getOrganizationName())));
        report.put("STARTUP_INDIA_DPIIT", parseJson(queryDpiitConnector(seller.getDpiitNumber())));
        report.put("NSIC", parseJson(queryNsicConnector(null, seller.getOrganizationName())));
        report.put("OEM_AUTHORIZATION", parseJson(queryOemAuthorizationConnector(null, seller.getOrganizationName())));
        report.put("MAKE_IN_INDIA", parseJson(queryMakeInIndiaConnector(null, seller.getOrganizationName())));
        report.put("BIS_DPIIT", parseJson(queryBisConnector(seller.getBisLicense())));
        report.put("EPFO", parseJson(queryEpfoConnector(seller.getEpfoCode())));
        report.put("ESIC", parseJson(queryEsicConnector(null, seller.getOrganizationName())));
        report.put("DIGILOCKER", parseJson(queryDigiLockerConnector("SHA256-DEMO-" + (seller.getId() != null ? seller.getId() : "000"))));
        report.put("DEBARMENT_BLACKLIST", parseJson(queryDebarmentConnector(pan, seller.getCinOrPan())));

        long matched = report.values().stream()
                .filter(v -> v instanceof Map && Boolean.TRUE.equals(((Map<?, ?>) v).get("matched")))
                .count();
        report.put("_summary", Map.of(
                "totalPortalsChecked", report.size() - 1,
                "matched", matched,
                "portalComplianceScore", Math.round((matched * 100.0) / (report.size() - 1))
        ));
        return report;
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    private String extractPan(String cinOrPan) {
        if (cinOrPan == null) return null;
        String[] parts = cinOrPan.split("/");
        for (String part : parts) {
            String trimmed = part.trim();
            if (trimmed.length() == 10 && trimmed.matches("[A-Z]{5}[0-9]{4}[A-Z]")) return trimmed;
        }
        return cinOrPan.trim();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJson(String json) {
        try {
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            return Map.of("error", "parse_failed");
        }
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{\"error\":\"JSON serialization failed\"}";
        }
    }
}
