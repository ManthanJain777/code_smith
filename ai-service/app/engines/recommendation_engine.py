"""
SIH26100 — AI Recommendation Engine
Generates structured procurement recommendations for officers based on compliance results.
"""
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class AiRecommendation(BaseModel):
    bid_id: str
    recommendation_type: str   # RECOMMEND_QUALIFY | RECOMMEND_REJECT | REFER_FOR_REVIEW
    summary: str
    gaps: List[str]
    strengths: List[str]
    basis: str
    confidence_score: float
    disclaimer: str
    generated_at: str


DISCLAIMER = (
    "The final qualification/disqualification decision rests solely with the Procurement Officer. "
    "This AI recommendation is decision-support only and does not constitute an automated determination."
)


def generate_recommendation(
    bid_id: str,
    compliance_score: float,
    risk_level: str,
    total_requirements: int,
    compliant_count: int,
    non_compliant_count: int,
    unverified_count: int,
    partially_compliant_count: int,
    gaps: Optional[List[str]] = None,
    strengths: Optional[List[str]] = None,
) -> AiRecommendation:
    gaps = gaps or []
    strengths = strengths or []
    now = datetime.utcnow().isoformat() + "Z"

    unresolved = unverified_count + partially_compliant_count

    if non_compliant_count > 0:
        recommendation_type = "RECOMMEND_REJECT"
        summary = (
            f"AI analysis identifies {non_compliant_count} mandatory non-compliant requirement(s) with "
            f"an overall compliance score of {compliance_score:.1f}% (Risk Level: {risk_level}). "
            f"Based on deterministic verification and evidence analysis, rejection is recommended. "
            f"The final disqualification decision rests with the Procurement Officer."
        )
        confidence = 0.92
    elif unresolved > 0:
        recommendation_type = "REFER_FOR_REVIEW"
        summary = (
            f"AI analysis identifies {unresolved} unresolved item(s) requiring human verification. "
            f"Overall compliance score: {compliance_score:.1f}% (Risk Level: {risk_level}). "
            f"Refer to the Human Review Queue before issuing a final decision. "
            f"No automated determination can be made until evidence gaps are resolved."
        )
        confidence = 0.85
    else:
        recommendation_type = "RECOMMEND_QUALIFY"
        summary = (
            f"All {compliant_count} verified requirements are compliant. "
            f"Compliance score: {compliance_score:.1f}% (Risk Level: {risk_level}). "
            f"AI recommends qualification subject to Procurement Officer's final review and decision."
        )
        confidence = 0.95

    basis = (
        f"Deterministic verification + AI language analysis of {total_requirements} requirement(s). "
        f"Compliant: {compliant_count}, Non-Compliant: {non_compliant_count}, "
        f"Unverified: {unverified_count}, Partial: {partially_compliant_count}."
    )

    return AiRecommendation(
        bid_id=bid_id,
        recommendation_type=recommendation_type,
        summary=summary,
        gaps=gaps,
        strengths=strengths,
        basis=basis,
        confidence_score=confidence,
        disclaimer=DISCLAIMER,
        generated_at=now,
    )
