"""
Bookie-o-em v14.0 - NOOSPHERE VELOCITY EDITION
FastAPI Backend Server

Features:
- v10.1 Research-optimized weights (+94.40u YTD)
- Standalone Esoteric Edge (Gematria/Numerology/Astro)
- v10.4 SCALAR-SAVANT (6 modules)
- v11.0 OMNI-GLITCH (6 modules)
- v13.0 GANN PHYSICS (3 modules)
- v14.0 NOOSPHERE VELOCITY (3 modules - MAIN MODEL)

Total: 18 esoteric modules
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from live_data_router import router as live_router

app = FastAPI(
    title="Bookie-o-em API",
    description="AI Sports Prop Betting Service - v14.0 NOOSPHERE VELOCITY",
    version="14.0"
)

# CORS - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the live data router
app.include_router(live_router)

# Root endpoint
@app.get("/")
async def root():
    return {
        "name": "Bookie-o-em",
        "version": "14.0",
        "codename": "NOOSPHERE_VELOCITY",
        "status": "operational",
        "message": "Someone always knows.",
        "endpoints": {
            "health": "/live/health",
            "props": "/live/props/{sport}",
            "best_bets": "/live/best-bets/{sport}",
            "esoteric_edge": "/live/esoteric-edge",
            "noosphere": "/live/noosphere/status",
            "gann_physics": "/live/gann-physics-status"
        }
    }

# Health check at root level (some frontends expect this)
@app.get("/health")
async def health():
    return {"status": "healthy", "version": "14.0"}

# Esoteric today energy (frontend expects this at /esoteric/today-energy)
@app.get("/esoteric/today-energy")
async def esoteric_today_energy():
    from live_data_router import (
        calculate_date_numerology, get_moon_phase, get_daily_energy,
        ESOTERIC_WEIGHTS, MOON_PHASE_LOGIC, PLANETARY_RULERS, MASTER_NUMBERS
    )
    from datetime import datetime

    today = datetime.now()
    moon_phase = get_moon_phase()
    daily_energy = get_daily_energy()
    date_numerology = calculate_date_numerology()
    zodiac_info = PLANETARY_RULERS.get(today.weekday(), PLANETARY_RULERS[6])
    moon_logic = MOON_PHASE_LOGIC.get(moon_phase, MOON_PHASE_LOGIC["first_quarter"])

    return {
        "date_numerology": date_numerology,
        "moon_phase": moon_phase,
        "daily_energy": daily_energy,
        # v2.0 Esoteric Edge weights
        "esoteric_weights": {
            "formula": "Gematria 35% + Moon Phase 20% + Numerology 20% + Sacred Geometry 15% + Zodiac 10%",
            "version": "2.0",
            "weights": ESOTERIC_WEIGHTS
        },
        "moon_phase_logic": moon_logic,
        "zodiac_today": {
            "planet": zodiac_info["planet"],
            "ruler": zodiac_info["ruler"],
            "energy": zodiac_info["energy"],
            "bias": zodiac_info["bias"],
            "aggression": zodiac_info["aggression"]
        },
        "master_number_active": date_numerology.get("life_path") in MASTER_NUMBERS
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
