package com.gem.compliance.domain;

public enum ComplianceStatus {
    COMPLIANT,
    PARTIALLY_COMPLIANT,
    NON_COMPLIANT,
    UNVERIFIED,
    NOT_APPLICABLE;

    public static ComplianceStatus fromString(String val) {
        if (val == null) return UNVERIFIED;
        String clean = val.trim().toUpperCase();
        switch (clean) {
            case "COMPLIANT":
            case "PASS":
                return COMPLIANT;
            case "PARTIALLY_COMPLIANT":
            case "PARTIAL":
            case "PARTIALLY":
                return PARTIALLY_COMPLIANT;
            case "NON_COMPLIANT":
            case "FAIL":
            case "FAILED":
                return NON_COMPLIANT;
            case "NOT_APPLICABLE":
            case "NA":
                return NOT_APPLICABLE;
            case "UNVERIFIED":
            default:
                return UNVERIFIED;
        }
    }
}
