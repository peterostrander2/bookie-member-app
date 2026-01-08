"""
Bookie-o-em Signal Engine v10.1 - Backend
JARVIS SAVANT EDITION

Features:
- 2178 THE IMMORTAL number validation and detection
- Jarvis Triggers (201, 33, 93, 322) with tiered boosts
- Public Fade 65% Crush Zone
- Mid-Spread Amplifier (+4 to +9 goldilocks)
- Large Spread Trap Gate (>15 pts penalty)
- NHL Dog Protocol
- Dual-Score System (Research + Esoteric Edge)
- IMMORTAL Confluence Level

+94.40u YTD edge system integrated
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import math
import random

router = APIRouter()

# ============================================
# JARVIS TRIGGERS - THE PROVEN EDGE NUMBERS
# ============================================

JARVIS_TRIGGERS = {
    2178: {
        "name": "THE IMMORTAL",
        "boost": 20,
        "tier": "LEGENDARY",
        "description": "Only number where n×4=reverse AND n×reverse=66^4. Never collapses.",
        "mathematical": True
    },
    201: {
        "name": "THE ORDER",
        "boost": 12,
        "tier": "HIGH",
        "description": "Jesuit Order gematria. The Event of 201.",
        "mathematical": False
    },
    33: {
        "name": "THE MASTER",
        "boost": 10,
        "tier": "HIGH",
        "description": "Highest master number. Masonic significance.",
        "mathematical": False
    },
    93: {
        "name": "THE WILL",
        "boost": 10,
        "tier": "HIGH",
        "description": "Thelema sacred number. Will and Love.",
        "mathematical": False
    },
    322: {
        "name": "THE SOCIETY",
        "boost": 10,
        "tier": "HIGH",
        "description": "Skull & Bones. Genesis 3:22.",
        "mathematical": False
    }
}

# Tesla's 3-6-9 pattern
TESLA_NUMBERS = [3, 6, 9]


def validate_2178():
    """
    Prove the mathematical uniqueness of 2178 - THE IMMORTAL NUMBER

    Property 1: 2178 × 4 = 8712 (its reversal)
    Property 2: 2178 × 8712 = 18974736 = 66^4

    This is the ONLY 4-digit number with both properties.
    It never collapses to zero in digit sum sequences.
    """
    n = 2178
    reversal = 8712

    # Property 1: n × 4 = reversal
    prop1 = (n * 4 == reversal)

    # Property 2: n × reversal = 66^4
    prop2 = (n * reversal == 66**4)

    # Verify 66^4
    sixty_six_fourth = 66 * 66 * 66 * 66  # 18974736

    return {
        "number": n,
        "reversal": reversal,
        "n_times_4_equals_reversal": prop1,
        "n_times_reversal": n * reversal,
        "sixty_six_to_fourth": sixty_six_fourth,
        "n_times_reversal_equals_66_4": prop2,
        "validated": prop1 and prop2,
        "status": "IMMORTAL CONFIRMED" if (prop1 and prop2) else "VALIDATION FAILED"
    }


def digit_sum(n: int) -> int:
    """Calculate digit sum of a number"""
    return sum(int(d) for d in str(abs(n)))


def reduce_to_single(n: int) -> int:
    """Reduce number to single digit (gematria reduction)"""
    while n > 9:
        n = digit_sum(n)
    return n


def check_jarvis_trigger(value: int) -> Optional[Dict[str, Any]]:
    """
    Check if a value triggers any Jarvis edge numbers.

    Checks for:
    1. Direct match with trigger numbers
    2. Reduction to trigger numbers
    3. Divisibility by 33 (master number)
    4. Tesla 3-6-9 alignment
    5. Contains 2178 sequence
    """
    result = {
        "triggered": False,
        "triggers": [],
        "total_boost": 0,
        "highest_tier": None,
        "details": []
    }

    str_value = str(abs(value))

    # Check for 2178 sequence in value
    if "2178" in str_value:
        trigger = JARVIS_TRIGGERS[2178]
        result["triggered"] = True
        result["triggers"].append(2178)
        result["total_boost"] += trigger["boost"]
        result["highest_tier"] = "LEGENDARY"
        result["details"].append(f"Contains THE IMMORTAL sequence (2178)")

    # Direct match check
    if value in JARVIS_TRIGGERS:
        trigger = JARVIS_TRIGGERS[value]
        if value not in result["triggers"]:
            result["triggered"] = True
            result["triggers"].append(value)
            result["total_boost"] += trigger["boost"]
            if result["highest_tier"] != "LEGENDARY":
                result["highest_tier"] = trigger["tier"]
            result["details"].append(f"Direct match: {trigger['name']}")

    # Reduction check
    reduced = reduce_to_single(value)
    for trigger_num, trigger in JARVIS_TRIGGERS.items():
        if trigger_num not in result["triggers"]:
            if reduce_to_single(trigger_num) == reduced:
                result["triggered"] = True
                result["triggers"].append(trigger_num)
                result["total_boost"] += trigger["boost"] * 0.5  # Half boost for reduction match
                result["details"].append(f"Reduces to same as {trigger['name']}")

    # 33 divisibility (Master Number alignment)
    if value % 33 == 0 and 33 not in result["triggers"]:
        result["triggered"] = True
        result["triggers"].append(33)
        result["total_boost"] += 5  # Partial boost for divisibility
        result["details"].append("Divisible by THE MASTER (33)")

    # Tesla 3-6-9 check
    if reduced in TESLA_NUMBERS:
        result["details"].append(f"Tesla alignment: reduces to {reduced}")
        result["total_boost"] += 2

    return result


# ============================================
# SIGNAL CALCULATORS WITH JARVIS EDGES
# ============================================

def calculate_moon_phase_signal(game_date: Optional[str] = None) -> Dict[str, Any]:
    """Calculate moon phase influence on game outcome"""
    if game_date:
        try:
            date = datetime.fromisoformat(game_date.replace('Z', '+00:00'))
        except:
            date = datetime.now()
    else:
        date = datetime.now()

    # Lunar cycle calculation (29.53 days)
    known_new_moon = datetime(2024, 1, 11)
    days_since = (date - known_new_moon).days
    lunar_cycle = 29.53
    moon_age = days_since % lunar_cycle
    phase_pct = moon_age / lunar_cycle

    # Determine phase
    if phase_pct < 0.125:
        phase = "New Moon"
        influence = 0.8  # High volatility
    elif phase_pct < 0.25:
        phase = "Waxing Crescent"
        influence = 0.6
    elif phase_pct < 0.375:
        phase = "First Quarter"
        influence = 0.5
    elif phase_pct < 0.5:
        phase = "Waxing Gibbous"
        influence = 0.4
    elif phase_pct < 0.625:
        phase = "Full Moon"
        influence = 0.9  # Peak influence
    elif phase_pct < 0.75:
        phase = "Waning Gibbous"
        influence = 0.6
    elif phase_pct < 0.875:
        phase = "Last Quarter"
        influence = 0.5
    else:
        phase = "Waning Crescent"
        influence = 0.7

    return {
        "phase": phase,
        "influence": influence,
        "moon_age_days": round(moon_age, 1),
        "cycle_percentage": round(phase_pct * 100, 1)
    }


def calculate_gematria_signal(player_name: str, team_name: str, jersey_number: Optional[int] = None) -> Dict[str, Any]:
    """
    Calculate gematria value and check for Jarvis triggers.
    Uses simple English gematria (A=1, B=2, etc.)
    """
    def simple_gematria(text: str) -> int:
        total = 0
        for char in text.upper():
            if 'A' <= char <= 'Z':
                total += ord(char) - ord('A') + 1
        return total

    player_value = simple_gematria(player_name)
    team_value = simple_gematria(team_name)
    combined = player_value + team_value

    if jersey_number:
        combined += jersey_number

    # Check for Jarvis triggers
    player_trigger = check_jarvis_trigger(player_value)
    team_trigger = check_jarvis_trigger(team_value)
    combined_trigger = check_jarvis_trigger(combined)

    # Determine influence level
    total_boost = (
        player_trigger["total_boost"] +
        team_trigger["total_boost"] +
        combined_trigger["total_boost"]
    )

    if total_boost >= 20:
        influence = 0.95
        tier = "LEGENDARY"
    elif total_boost >= 10:
        influence = 0.75
        tier = "HIGH"
    elif total_boost >= 5:
        influence = 0.55
        tier = "MEDIUM"
    else:
        influence = 0.35
        tier = "LOW"

    # Check for 2178 specifically
    immortal_detected = any(2178 in t["triggers"] for t in [player_trigger, team_trigger, combined_trigger])

    return {
        "player_value": player_value,
        "team_value": team_value,
        "combined_value": combined,
        "reduced": reduce_to_single(combined),
        "influence": influence,
        "tier": tier,
        "jarvis_triggers": {
            "player": player_trigger,
            "team": team_trigger,
            "combined": combined_trigger
        },
        "total_boost": total_boost,
        "immortal_detected": immortal_detected
    }


def calculate_public_fade_signal(public_percentage: float, is_favorite: bool) -> Dict[str, Any]:
    """
    JARVIS PUBLIC FADE 65% CRUSH ZONE

    When public is ≥65% on the chalk (favorite), this is prime fade territory.
    The masses move lines inefficiently - fade their conviction.

    +94.40u YTD came largely from this edge.
    """
    signal = {
        "public_pct": public_percentage,
        "is_favorite": is_favorite,
        "in_crush_zone": False,
        "fade_signal": False,
        "influence": 0.0,
        "recommendation": ""
    }

    # CRUSH ZONE: Public ≥65% on favorite
    if public_percentage >= 65 and is_favorite:
        signal["in_crush_zone"] = True
        signal["fade_signal"] = True

        # Scale influence based on how deep in crush zone
        if public_percentage >= 80:
            signal["influence"] = 0.95
            signal["recommendation"] = "MAXIMUM FADE - Public delusion at peak"
        elif public_percentage >= 75:
            signal["influence"] = 0.85
            signal["recommendation"] = "STRONG FADE - Heavy public chalk"
        elif public_percentage >= 70:
            signal["influence"] = 0.75
            signal["recommendation"] = "FADE - Solid crush zone entry"
        else:
            signal["influence"] = 0.65
            signal["recommendation"] = "FADE - Entering crush zone"

    elif public_percentage >= 65 and not is_favorite:
        # Public heavy on dog - contrarian opportunity but less reliable
        signal["influence"] = 0.45
        signal["recommendation"] = "Monitor - Public dog heavy"

    elif public_percentage <= 35:
        # Contrarian opportunity - public avoiding
        signal["influence"] = 0.55
        signal["recommendation"] = "Contrarian value - Public avoiding"

    else:
        signal["influence"] = 0.30
        signal["recommendation"] = "No clear public edge"

    return signal


def calculate_mid_spread_signal(spread: float) -> Dict[str, Any]:
    """
    JARVIS MID-SPREAD AMPLIFIER

    The Goldilocks Zone: +4 to +9
    Not too small (meaningless), not too big (trap territory).
    This is where dogs cover most reliably.
    """
    abs_spread = abs(spread)

    signal = {
        "spread": spread,
        "abs_spread": abs_spread,
        "in_goldilocks": False,
        "influence": 0.0,
        "zone": "",
        "boost_modifier": 1.0
    }

    if 4 <= abs_spread <= 9:
        # GOLDILOCKS ZONE
        signal["in_goldilocks"] = True
        signal["zone"] = "GOLDILOCKS"
        signal["boost_modifier"] = 1.20  # +20% boost

        # Peak is around 6-7
        if 6 <= abs_spread <= 7:
            signal["influence"] = 0.85
        else:
            signal["influence"] = 0.75

    elif abs_spread < 4:
        signal["zone"] = "TOO_TIGHT"
        signal["influence"] = 0.50
        signal["boost_modifier"] = 1.0

    elif abs_spread > 15:
        # TRAP GATE - Large spreads are traps
        signal["zone"] = "TRAP_GATE"
        signal["influence"] = 0.25
        signal["boost_modifier"] = 0.80  # -20% penalty

    else:
        # 10-15 range - moderate
        signal["zone"] = "MODERATE"
        signal["influence"] = 0.55
        signal["boost_modifier"] = 1.0

    return signal


def calculate_large_spread_trap(spread: float) -> Dict[str, Any]:
    """
    JARVIS LARGE SPREAD TRAP GATE

    Spreads >15 points are trap territory.
    Books know public loves big favorites.
    Apply -20% penalty to any signals in this zone.
    """
    abs_spread = abs(spread)

    signal = {
        "spread": spread,
        "abs_spread": abs_spread,
        "is_trap": False,
        "penalty": 1.0,
        "warning": ""
    }

    if abs_spread > 15:
        signal["is_trap"] = True
        signal["penalty"] = 0.80

        if abs_spread > 20:
            signal["penalty"] = 0.70
            signal["warning"] = "EXTREME TRAP - Heavily penalize any plays here"
        else:
            signal["warning"] = "TRAP GATE ACTIVE - Large spread penalty applied"

    return signal


def calculate_nhl_dog_protocol(sport: str, spread: float, research_score: float, public_pct: float) -> Dict[str, Any]:
    """
    JARVIS NHL DOG PROTOCOL

    Specific edge for NHL:
    - Puck line dogs (+1.5)
    - Research score ≥9.3
    - Public ≥65% on favorite

    This trifecta has been highly profitable.
    """
    signal = {
        "sport": sport,
        "protocol_active": False,
        "conditions_met": [],
        "conditions_failed": [],
        "influence": 0.0,
        "recommendation": ""
    }

    if sport.upper() != "NHL":
        signal["recommendation"] = "Protocol only applies to NHL"
        return signal

    # Check conditions
    is_dog = spread > 0  # Positive spread = underdog
    is_puck_line = abs(spread) == 1.5
    high_research = research_score >= 9.3
    public_heavy = public_pct >= 65

    if is_dog and is_puck_line:
        signal["conditions_met"].append("Puck line dog (+1.5)")
    else:
        signal["conditions_failed"].append("Not puck line dog")

    if high_research:
        signal["conditions_met"].append(f"Research score {research_score} ≥ 9.3")
    else:
        signal["conditions_failed"].append(f"Research score {research_score} < 9.3")

    if public_heavy:
        signal["conditions_met"].append(f"Public {public_pct}% ≥ 65% (fade opportunity)")
    else:
        signal["conditions_failed"].append(f"Public {public_pct}% < 65%")

    # Calculate influence
    conditions_count = len(signal["conditions_met"])

    if conditions_count == 3:
        signal["protocol_active"] = True
        signal["influence"] = 0.92
        signal["recommendation"] = "FULL PROTOCOL - All conditions met. Strong NHL dog play."
    elif conditions_count == 2:
        signal["influence"] = 0.70
        signal["recommendation"] = "PARTIAL PROTOCOL - 2/3 conditions. Consider with caution."
    elif conditions_count == 1:
        signal["influence"] = 0.45
        signal["recommendation"] = "WEAK SIGNAL - Only 1/3 conditions met."
    else:
        signal["influence"] = 0.20
        signal["recommendation"] = "NO PROTOCOL - Conditions not met."

    return signal


# ============================================
# ESOTERIC WEIGHT SYSTEM
# ============================================

def get_esoteric_weights(jarvis_triggered: bool = False, immortal_detected: bool = False) -> Dict[str, float]:
    """
    Dynamic esoteric weights based on Jarvis trigger detection.

    When Jarvis triggers are found, boost gematria weight.
    When THE IMMORTAL (2178) is detected, maximize gematria weight.
    """
    if immortal_detected:
        return {
            "moon_phase": 0.10,
            "gematria": 0.55,  # IMMORTAL boost
            "numerology": 0.20,
            "patterns": 0.15
        }
    elif jarvis_triggered:
        return {
            "moon_phase": 0.15,
            "gematria": 0.45,  # Jarvis boost
            "numerology": 0.20,
            "patterns": 0.20
        }
    else:
        return {
            "moon_phase": 0.20,
            "gematria": 0.30,
            "numerology": 0.25,
            "patterns": 0.25
        }


# ============================================
# CONFLUENCE SYSTEM
# ============================================

def calculate_confluence(
    research_score: float,
    esoteric_score: float,
    jarvis_triggered: bool = False,
    immortal_detected: bool = False,
    in_crush_zone: bool = False,
    in_goldilocks: bool = False
) -> Dict[str, Any]:
    """
    Calculate cosmic confluence between research model and esoteric edge.

    IMMORTAL confluence is the highest tier - only when 2178 is detected
    and research model also aligns.
    """
    confluence = {
        "research_score": research_score,
        "esoteric_score": esoteric_score,
        "alignment": 0.0,
        "level": "NONE",
        "boost": 0,
        "description": ""
    }

    # Both scores should be on same scale (0-10 or 0-100)
    # Normalize to 0-1 for comparison
    r_norm = research_score / 10 if research_score <= 10 else research_score / 100
    e_norm = esoteric_score / 10 if esoteric_score <= 10 else esoteric_score / 100

    # Calculate alignment (how close are they)
    diff = abs(r_norm - e_norm)
    alignment = 1 - diff
    confluence["alignment"] = round(alignment * 100, 1)

    # Both high and aligned
    both_high = r_norm >= 0.75 and e_norm >= 0.75
    both_aligned = alignment >= 0.8

    # Determine confluence level
    if immortal_detected and both_high and both_aligned:
        confluence["level"] = "IMMORTAL"
        confluence["boost"] = 10
        confluence["description"] = "THE IMMORTAL CONFLUENCE - 2178 detected with full model alignment. Maximum edge."

    elif jarvis_triggered and both_high and both_aligned:
        confluence["level"] = "JARVIS_PERFECT"
        confluence["boost"] = 7
        confluence["description"] = "JARVIS PERFECT CONFLUENCE - Trigger detected with strong alignment."

    elif both_high and both_aligned:
        confluence["level"] = "PERFECT"
        confluence["boost"] = 5
        confluence["description"] = "Perfect cosmic alignment between research and esoteric models."

    elif both_high or (alignment >= 0.7 and (r_norm >= 0.7 or e_norm >= 0.7)):
        confluence["level"] = "STRONG"
        confluence["boost"] = 3
        confluence["description"] = "Strong confluence - models showing agreement."

    elif alignment >= 0.6:
        confluence["level"] = "MODERATE"
        confluence["boost"] = 1
        confluence["description"] = "Moderate alignment between models."

    else:
        confluence["level"] = "DIVERGENT"
        confluence["boost"] = 0
        confluence["description"] = "Models diverging - use primary research score."

    # Apply crush zone and goldilocks bonuses
    if in_crush_zone:
        confluence["boost"] += 2
        confluence["description"] += " [CRUSH ZONE ACTIVE]"

    if in_goldilocks:
        confluence["boost"] += 1
        confluence["description"] += " [GOLDILOCKS SPREAD]"

    return confluence


# ============================================
# API ENDPOINTS
# ============================================

class PropAnalysisRequest(BaseModel):
    player_name: str
    team_name: str
    opponent: str
    prop_type: str
    line: float
    sport: str
    spread: Optional[float] = None
    public_percentage: Optional[float] = 50.0
    is_favorite: Optional[bool] = False
    jersey_number: Optional[int] = None
    game_date: Optional[str] = None
    research_score: Optional[float] = None


class PropAnalysisResponse(BaseModel):
    player_name: str
    team_name: str
    prop_type: str
    line: float
    main_confidence: float
    esoteric_edge: float
    final_score: float
    confluence: Dict[str, Any]
    signals: Dict[str, Any]
    jarvis_status: Dict[str, Any]
    recommendation: str


@router.post("/analyze", response_model=PropAnalysisResponse)
async def analyze_prop(request: PropAnalysisRequest):
    """
    Analyze a prop bet using the v10.1 Jarvis Savant signal engine.

    Returns dual-score system:
    - main_confidence: Research-backed primary score
    - esoteric_edge: Esoteric signals score (showcased separately)
    - final_score: Combined with confluence bonuses
    """

    # Calculate all signals
    moon_signal = calculate_moon_phase_signal(request.game_date)
    gematria_signal = calculate_gematria_signal(
        request.player_name,
        request.team_name,
        request.jersey_number
    )

    # Jarvis edge signals
    public_fade = calculate_public_fade_signal(
        request.public_percentage or 50.0,
        request.is_favorite or False
    )

    spread = request.spread or 0
    mid_spread = calculate_mid_spread_signal(spread)
    trap_gate = calculate_large_spread_trap(spread)

    nhl_protocol = calculate_nhl_dog_protocol(
        request.sport,
        spread,
        request.research_score or 7.0,
        request.public_percentage or 50.0
    )

    # Check for Jarvis triggers
    jarvis_triggered = gematria_signal["total_boost"] > 0
    immortal_detected = gematria_signal["immortal_detected"]

    # Get dynamic weights
    weights = get_esoteric_weights(jarvis_triggered, immortal_detected)

    # Calculate esoteric score
    esoteric_components = [
        moon_signal["influence"] * weights["moon_phase"],
        gematria_signal["influence"] * weights["gematria"],
        mid_spread["influence"] * weights["numerology"],
        public_fade["influence"] * weights["patterns"]
    ]
    esoteric_raw = sum(esoteric_components)

    # Apply trap gate penalty if active
    if trap_gate["is_trap"]:
        esoteric_raw *= trap_gate["penalty"]

    # Apply goldilocks boost
    esoteric_raw *= mid_spread["boost_modifier"]

    # Scale to 0-10
    esoteric_edge = min(10, esoteric_raw * 10)

    # Research score (simulated if not provided)
    if request.research_score is not None:
        main_confidence = request.research_score
    else:
        # Generate based on available data
        base = 6.5
        if public_fade["fade_signal"]:
            base += 1.0
        if mid_spread["in_goldilocks"]:
            base += 0.5
        if nhl_protocol["protocol_active"]:
            base += 1.5
        main_confidence = min(10, base + (random.random() * 1.5 - 0.75))

    # Calculate confluence
    confluence = calculate_confluence(
        main_confidence,
        esoteric_edge,
        jarvis_triggered,
        immortal_detected,
        public_fade["in_crush_zone"],
        mid_spread["in_goldilocks"]
    )

    # Final score with confluence bonus
    final_score = min(10, main_confidence + (confluence["boost"] * 0.3))

    # Build recommendation
    if final_score >= 9.0:
        if immortal_detected:
            rec = f"IMMORTAL EDGE - Maximum conviction. {confluence['description']}"
        elif confluence["level"] == "JARVIS_PERFECT":
            rec = f"JARVIS PERFECT - High conviction play. {public_fade['recommendation']}"
        else:
            rec = f"STRONG PLAY - Research and esoteric aligned. {public_fade['recommendation']}"
    elif final_score >= 7.5:
        rec = f"SOLID PLAY - Good edge detected. {mid_spread['zone']} spread zone."
    elif final_score >= 6.0:
        rec = f"MODERATE PLAY - Some edge present. Monitor line movement."
    else:
        rec = f"LOW CONVICTION - Limited edge. Consider passing."

    # Jarvis status summary
    jarvis_status = {
        "triggers_found": jarvis_triggered,
        "immortal_active": immortal_detected,
        "trigger_details": gematria_signal["jarvis_triggers"],
        "total_boost": gematria_signal["total_boost"],
        "tier": gematria_signal["tier"],
        "crush_zone_active": public_fade["in_crush_zone"],
        "goldilocks_active": mid_spread["in_goldilocks"],
        "trap_gate_active": trap_gate["is_trap"],
        "nhl_protocol_active": nhl_protocol["protocol_active"]
    }

    return PropAnalysisResponse(
        player_name=request.player_name,
        team_name=request.team_name,
        prop_type=request.prop_type,
        line=request.line,
        main_confidence=round(main_confidence, 2),
        esoteric_edge=round(esoteric_edge, 2),
        final_score=round(final_score, 2),
        confluence=confluence,
        signals={
            "moon_phase": moon_signal,
            "gematria": gematria_signal,
            "public_fade": public_fade,
            "mid_spread": mid_spread,
            "trap_gate": trap_gate,
            "nhl_protocol": nhl_protocol
        },
        jarvis_status=jarvis_status,
        recommendation=rec
    )


@router.get("/validate-immortal")
async def validate_immortal():
    """
    Validate the mathematical properties of THE IMMORTAL number (2178).

    Proves:
    - 2178 × 4 = 8712 (its reversal)
    - 2178 × 8712 = 18974736 = 66^4
    """
    return validate_2178()


@router.get("/jarvis-triggers")
async def get_jarvis_triggers():
    """
    Get all Jarvis trigger numbers and their properties.
    """
    return {
        "triggers": JARVIS_TRIGGERS,
        "tesla_numbers": TESLA_NUMBERS,
        "immortal_validation": validate_2178()
    }


@router.post("/check-trigger")
async def check_trigger(value: int):
    """
    Check if a specific value triggers any Jarvis edge numbers.
    """
    return check_jarvis_trigger(value)


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "10.1",
        "codename": "JARVIS SAVANT",
        "immortal_status": validate_2178()["status"]
    }


# ============================================
# COMPATIBILITY EXPORTS
# ============================================

class LiveDataRouter:
    """Compatibility class for prediction_api.py imports"""
    def __init__(self):
        self.router = router

    def get_router(self):
        return self.router


# Export for: from live_data_router import LiveDataRouter, live_data_router
live_data_router = router
