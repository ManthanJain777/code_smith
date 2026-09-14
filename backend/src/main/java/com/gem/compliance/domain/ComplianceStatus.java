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
                return COMPLIANT;
            case "PARTIALLY_COMPLIANT":
                return PARTIALLY_COMPLIANT;
            case "NON_COMPLIANT":
                return NON_COMPLIANT;
            case "NOT_APPLICABLE":
                return NOT_APPLICABLE;
            case "UNVERIFIED":
            default:
                return UNVERIFIED;
        }
    }
}
