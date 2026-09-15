"""
SIH26100 — Government Portal Verification Engine
Implements the SIH-mandated multi-portal integration simulation for all 13 government portals.
"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime


class PortalCheckResult(BaseModel):
    portal_name: str
    connector: str
    status: str  # VERIFIED, RISK_IDENTIFIED, NOT_REGISTERED, NOT_APPLICABLE
    finding: str
    risk_contribution: float  # 0.0 (no risk) to 1.0 (maximum risk)
    key_data: Dict[str, Any]
    verified_at: str
    is_simulated: bool = True
    adapter_mode: str = "SIMULATED_PROTOTYPE"
    source_url: Optional[str] = "https://gem.gov.in/api/simulated/statutory"
    request_id: Optional[str] = None


class PortalVerificationReport(BaseModel):
    seller_id: str
    organization_name: str
    total_portals: int
    verified_count: int
    risk_count: int
    compliance_score: float  # 0–100
    risk_level: str          # LOW, MEDIUM, HIGH, CRITICAL
    portal_results: List[PortalCheckResult]
    generated_at: str
    is_simulated: bool = True
    disclaimer: str = "13 statutory verification adapters are simulated in this SIH prototype; production build integrates authenticated government API endpoints."


def _now() -> str:
    return datetime.utcnow().isoformat() + "Z"


def run_portal_verification(
    seller_id: str,
    organization_name: str,
    gstin: Optional[str] = None,
    pan: Optional[str] = None,
    cin: Optional[str] = None,
    udyam_no: Optional[str] = None,
    dpiit_no: Optional[str] = None,
    epfo_code: Optional[str] = None,
    esic_code: Optional[str] = None,
    bis_license: Optional[str] = None,
    nsic_reg: Optional[str] = None,
    oem_auth_ref: Optional[str] = None,
    mii_reg: Optional[str] = None,
) -> PortalVerificationReport:
    results: List[PortalCheckResult] = []

    # 1. GSTN
    gstn_active = gstin and not gstin.startswith("27DDDDD")
    results.append(PortalCheckResult(
        portal_name="GST Registration & Return Filing",
        connector="GSTN_PORTAL",
        status="VERIFIED" if gstn_active else "RISK_IDENTIFIED",
        finding=f"GSTIN {gstin} is {'ACTIVE with returns filed up to Aug 2026' if gstn_active else 'CANCELLED — Tax Default. Returns pending: 8'}.",
        risk_contribution=0.0 if gstn_active else 0.9,
        key_data={"gstin": gstin, "status": "ACTIVE" if gstn_active else "CANCELLED", "last_return": "2026-08-20" if gstn_active else None},
        verified_at=_now(),
    ))

    # 2. PAN & Income Tax
    pan_ok = pan and not (pan.upper().startswith("AAACG") or pan.upper().startswith("AAACV"))
    results.append(PortalCheckResult(
        portal_name="PAN & Income Tax Compliance",
        connector="PAN_INCOME_TAX_PORTAL",
        status="VERIFIED" if pan_ok else "RISK_IDENTIFIED",
        finding=f"PAN {pan}: ITR {'filed for AY2025-26, no tax defaults' if pan_ok else 'OVERDUE — demand raised Rs. 24.5L'}.",
        risk_contribution=0.0 if pan_ok else 0.85,
        key_data={"pan": pan, "itr_status": "FILED" if pan_ok else "OVERDUE", "tax_default": "NIL" if pan_ok else "DEMAND_RAISED"},
        verified_at=_now(),
    ))

    # 3. MCA21
    mca_ok = bool(cin)
    results.append(PortalCheckResult(
        portal_name="MCA21 Corporate Registry",
        connector="MCA21_CORPORATE_REGISTRY",
        status="VERIFIED" if mca_ok else "NOT_APPLICABLE",
        finding=f"Company status {'ACTIVE, annual return filed' if mca_ok else 'Not registered under MCA21'}.",
        risk_contribution=0.0 if mca_ok else 0.1,
        key_data={"cin": cin, "company_status": "ACTIVE" if mca_ok else None, "annual_return_filed": True if mca_ok else None},
        verified_at=_now(),
    ))

    # 4. Udyam / MSME
    udyam_ok = bool(udyam_no)
    results.append(PortalCheckResult(
        portal_name="Udyam / MSME Registration",
        connector="UDYAM_MSME_PORTAL",
        status="VERIFIED" if udyam_ok else "NOT_REGISTERED",
        finding=f"{'MEDIUM enterprise, lifetime registration. EMD waiver applicable.' if udyam_ok else 'Not registered under MSME/Udyam portal.'}",
        risk_contribution=0.0 if udyam_ok else 0.15,
        key_data={"udyam_no": udyam_no, "enterprise_type": "MEDIUM" if udyam_ok else None, "exemptions": ["EMD_WAIVER"] if udyam_ok else []},
        verified_at=_now(),
    ))

    # 5. Startup India / DPIIT
    dpiit_ok = bool(dpiit_no)
    results.append(PortalCheckResult(
        portal_name="Startup India / DPIIT Recognition",
        connector="DPIIT_STARTUP_INDIA",
        status="VERIFIED" if dpiit_ok else "NOT_APPLICABLE",
        finding=f"{'DPIIT recognized startup, tax exemption granted.' if dpiit_ok else 'Not registered under Startup India scheme.'}",
        risk_contribution=0.0,
        key_data={"dpiit_no": dpiit_no, "recognized": dpiit_ok, "tax_exemption": "GRANTED" if dpiit_ok else "NOT_APPLICABLE"},
        verified_at=_now(),
    ))

    # 6. NSIC
    nsic_ok = bool(nsic_reg)
    results.append(PortalCheckResult(
        portal_name="NSIC Single-Point Registration",
        connector="NSIC_REGISTRATION",
        status="VERIFIED" if nsic_ok else "NOT_REGISTERED",
        finding=f"{'NSIC registered — EMD exemption, tender fee exemption applicable.' if nsic_ok else 'Not registered under NSIC scheme.'}",
        risk_contribution=0.0,
        key_data={"nsic_reg": nsic_reg, "status": "ACTIVE" if nsic_ok else "NOT_REGISTERED", "benefits": ["EMD_EXEMPTION", "TENDER_FEE_EXEMPTION"] if nsic_ok else []},
        verified_at=_now(),
    ))

    # 7. OEM Authorization
    oem_ok = bool(oem_auth_ref)
    results.append(PortalCheckResult(
        portal_name="OEM Authorization",
        connector="OEM_AUTHORIZATION_REGISTRY",
        status="VERIFIED" if oem_ok else "NOT_APPLICABLE",
        finding=f"{'OEM authorization letter valid through 2027-03-31.' if oem_ok else 'OEM authorization not applicable or not submitted.'}",
        risk_contribution=0.0,
        key_data={"oem_ref": oem_auth_ref, "status": "VALID" if oem_ok else "NOT_APPLICABLE"},
        verified_at=_now(),
    ))

    # 8. Make in India / Local Content
    mii_ok = bool(mii_reg)
    results.append(PortalCheckResult(
        portal_name="Make in India / Local Content",
        connector="MAKE_IN_INDIA_DPIIT_PORTAL",
        status="VERIFIED" if mii_ok else "NOT_APPLICABLE",
        finding=f"{'Local content: 72.5% (threshold: 50%). Class III Compliant.' if mii_ok else 'Make in India registration not submitted.'}",
        risk_contribution=0.0 if mii_ok else 0.1,
        key_data={"mii_reg": mii_reg, "local_content_pct": 72.5 if mii_ok else None, "compliant": mii_ok},
        verified_at=_now(),
    ))

    # 9. BIS / Standard Mark
    bis_ok = bool(bis_license)
    results.append(PortalCheckResult(
        portal_name="BIS / IS Standard Mark",
        connector="BIS_STANDARD_MARK",
        status="VERIFIED" if bis_ok else "NOT_APPLICABLE",
        finding=f"{'BIS license IS 1520:2002 valid until 2027-06-30.' if bis_ok else 'BIS certification not submitted or not applicable.'}",
        risk_contribution=0.0,
        key_data={"bis_license": bis_license, "standard": "IS 1520:2002", "valid_until": "2027-06-30" if bis_ok else None},
        verified_at=_now(),
    ))

    # 10. EPFO
    epfo_ok = bool(epfo_code)
    results.append(PortalCheckResult(
        portal_name="EPFO Compliance",
        connector="EPFO_COMPLIANCE_PORTAL",
        status="VERIFIED" if epfo_ok else "NOT_APPLICABLE",
        finding=f"{'142 active workers, ECR returns filed for Aug 2026. No defaults.' if epfo_ok else 'EPFO not applicable (below threshold).'}",
        risk_contribution=0.0 if epfo_ok else 0.05,
        key_data={"epfo_code": epfo_code, "workers": 142 if epfo_ok else 0, "last_ecr": "2026-08" if epfo_ok else None, "status": "COMPLIANT" if epfo_ok else "NOT_APPLICABLE"},
        verified_at=_now(),
    ))

    # 11. ESIC
    esic_ok = bool(esic_code)
    results.append(PortalCheckResult(
        portal_name="ESIC Compliance",
        connector="ESIC_COMPLIANCE_PORTAL",
        status="VERIFIED" if esic_ok else "NOT_APPLICABLE",
        finding=f"{'138 insured employees, contributions current through Aug 2026.' if esic_ok else 'ESIC not applicable or not registered.'}",
        risk_contribution=0.0,
        key_data={"esic_code": esic_code, "insured_employees": 138 if esic_ok else 0, "status": "COMPLIANT" if esic_ok else "NOT_APPLICABLE"},
        verified_at=_now(),
    ))

    # 12. DigiLocker
    results.append(PortalCheckResult(
        portal_name="DigiLocker Document Verification",
        connector="DIGILOCKER_VERIFIABLE_CREDENTIALS",
        status="VERIFIED",
        finding="Digital signature verified. Issuer: Controller of Certifying Authorities (CCA). Document authentic.",
        risk_contribution=0.0,
        key_data={"signature_valid": True, "issuer": "CCA", "document": "Udyam Registration Certificate"},
        verified_at=_now(),
    ))

    # 13. Debarment / Blacklist
    is_debarred = pan and pan.upper().startswith("AAACG")
    results.append(PortalCheckResult(
        portal_name="Debarment & Blacklist Check",
        connector="GEM_DEBARMENT_BLACKLIST",
        status="RISK_IDENTIFIED" if is_debarred else "VERIFIED",
        finding=f"{'DEBARRED: Fraud and Misrepresentation (MoF Order 2024). Barred until 2028-12-31.' if is_debarred else 'No debarment or blacklisting recorded on GeM, CPPP, or MoF portals.'}",
        risk_contribution=1.0 if is_debarred else 0.0,
        key_data={"debarment_status": "DEBARRED" if is_debarred else "CLEAR", "portals_checked": ["GeM", "CPPP", "MoF"]},
        verified_at=_now(),
    ))

    # Aggregate
    verified = sum(1 for r in results if r.status == "VERIFIED")
    risk_found = sum(1 for r in results if r.status == "RISK_IDENTIFIED")
    total = len(results)

    avg_risk = sum(r.risk_contribution for r in results) / total
    score = round((1 - avg_risk) * 100, 1)

    if score < 40 or is_debarred:
        risk_level = "CRITICAL"
    elif score < 60:
        risk_level = "HIGH"
    elif score < 80:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return PortalVerificationReport(
        seller_id=seller_id,
        organization_name=organization_name,
        total_portals=total,
        verified_count=verified,
        risk_count=risk_found,
        compliance_score=score,
        risk_level=risk_level,
        portal_results=results,
        generated_at=_now(),
    )
