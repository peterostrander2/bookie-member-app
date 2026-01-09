# live_data_router.py v10.3 - JARVIS SAVANT + RESONANCE LAYER
# Research-Optimized + Esoteric Edge Module + Confluence Alerts + Resonance Layer
# v10.1 weights preserved | Esoteric as standalone clickable feature
# +94.40u YTD edge system | Twitter gematria community insights integrated
# NEW: Founder's Echo + Life Path Sync = Cosmic Resonance Layer

from fastapi import APIRouter, HTTPException
from typing import Optional, List, Dict, Any
import httpx
import asyncio
from datetime import datetime, timedelta
import math
import random

router = APIRouter(prefix="/live", tags=["live"])

ODDS_API_KEY = "ceb2e3a6a3302e0f38fd0d34150294e9"
ODDS_API_BASE = "https://api.the-odds-api.com/v4"

# ============================================================================
# JARVIS TRIGGERS - THE PROVEN EDGE NUMBERS (v10.1 preserved)
# ============================================================================

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

# Extended power numbers from Twitter gematria community
POWER_NUMBERS = {
    "master": [11, 22, 33, 44, 55, 66, 77, 88, 99],
    "tesla": [3, 6, 9, 27, 36, 63, 72, 81, 108, 144, 216, 369],
    "fibonacci": [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377],
    "sacred": [7, 12, 40, 72, 153, 666, 777, 888],
    "jarvis": [2178, 201, 33, 93, 322],
    "super_bowl": [56, 131, 58, 59],  # Super Bowl gematria markers
    "nfl_favorites": [13, 17, 23, 32, 42]  # Common NFL narrative numbers
}

TESLA_NUMBERS = [3, 6, 9]

# ============================================================================
# FRANCHISE FOUNDING DATES DATABASE - v10.3 RESONANCE LAYER
# Used for Founder's Echo - when franchise founding date resonates with game date
# Format: (month, day, year) - Using official establishment/founding dates
# ============================================================================

FRANCHISE_FOUNDING_DATES = {
    # NFL Teams (32 teams)
    "Arizona Cardinals": (1898, 9, 1),      # Founded as Morgan Athletic Club
    "Atlanta Falcons": (1965, 6, 30),
    "Baltimore Ravens": (1996, 2, 9),
    "Buffalo Bills": (1960, 10, 28),
    "Carolina Panthers": (1993, 10, 26),
    "Chicago Bears": (1920, 9, 17),         # Decatur Staleys
    "Cincinnati Bengals": (1968, 5, 24),
    "Cleveland Browns": (1946, 6, 4),
    "Dallas Cowboys": (1960, 1, 28),
    "Denver Broncos": (1960, 8, 14),
    "Detroit Lions": (1930, 7, 12),
    "Green Bay Packers": (1919, 8, 11),
    "Houston Texans": (1999, 10, 6),
    "Indianapolis Colts": (1953, 1, 23),    # Baltimore Colts
    "Jacksonville Jaguars": (1993, 11, 30),
    "Kansas City Chiefs": (1960, 8, 14),    # Dallas Texans
    "Las Vegas Raiders": (1960, 1, 30),     # Oakland Raiders
    "Los Angeles Chargers": (1960, 8, 14),
    "Los Angeles Rams": (1936, 2, 12),      # Cleveland Rams
    "Miami Dolphins": (1965, 8, 16),
    "Minnesota Vikings": (1960, 1, 28),
    "New England Patriots": (1959, 11, 16),
    "New Orleans Saints": (1966, 11, 1),    # All Saints Day!
    "New York Giants": (1925, 8, 1),
    "New York Jets": (1960, 8, 14),         # Titans of New York
    "Philadelphia Eagles": (1933, 7, 8),
    "Pittsburgh Steelers": (1933, 7, 8),
    "San Francisco 49ers": (1946, 6, 4),
    "Seattle Seahawks": (1974, 6, 4),
    "Tampa Bay Buccaneers": (1974, 4, 24),
    "Tennessee Titans": (1960, 8, 14),      # Houston Oilers
    "Washington Commanders": (1932, 7, 9),

    # NBA Teams (30 teams)
    "Atlanta Hawks": (1946, 8, 1),          # Tri-Cities Blackhawks
    "Boston Celtics": (1946, 6, 6),
    "Brooklyn Nets": (1967, 8, 17),         # New Jersey Americans
    "Charlotte Hornets": (1988, 4, 22),
    "Chicago Bulls": (1966, 1, 16),
    "Cleveland Cavaliers": (1970, 2, 10),
    "Dallas Mavericks": (1980, 1, 14),
    "Denver Nuggets": (1967, 2, 5),         # Denver Rockets
    "Detroit Pistons": (1941, 1, 1),        # Fort Wayne Zollner Pistons
    "Golden State Warriors": (1946, 6, 6),  # Philadelphia Warriors
    "Houston Rockets": (1967, 2, 5),        # San Diego Rockets
    "Indiana Pacers": (1967, 2, 2),
    "LA Clippers": (1970, 6, 15),           # Buffalo Braves
    "Los Angeles Lakers": (1947, 1, 1),     # Minneapolis Lakers
    "Memphis Grizzlies": (1995, 4, 27),     # Vancouver Grizzlies
    "Miami Heat": (1988, 4, 22),
    "Milwaukee Bucks": (1968, 1, 22),
    "Minnesota Timberwolves": (1989, 4, 22),
    "New Orleans Pelicans": (2002, 5, 11),  # Charlotte Bobcats -> Hornets -> Pelicans split
    "New York Knicks": (1946, 6, 6),
    "Oklahoma City Thunder": (1967, 2, 5),  # Seattle SuperSonics
    "Orlando Magic": (1989, 4, 22),
    "Philadelphia 76ers": (1946, 8, 1),     # Syracuse Nationals
    "Phoenix Suns": (1968, 1, 22),
    "Portland Trail Blazers": (1970, 2, 6),
    "Sacramento Kings": (1923, 1, 1),       # Rochester Seagrams
    "San Antonio Spurs": (1967, 2, 5),      # Dallas Chaparrals
    "Toronto Raptors": (1995, 4, 27),
    "Utah Jazz": (1974, 6, 7),              # New Orleans Jazz
    "Washington Wizards": (1961, 12, 19),   # Chicago Packers

    # MLB Teams (30 teams)
    "Arizona Diamondbacks": (1998, 3, 9),
    "Atlanta Braves": (1871, 3, 17),        # Boston Red Stockings
    "Baltimore Orioles": (1901, 1, 28),     # Milwaukee Brewers (original)
    "Boston Red Sox": (1901, 1, 28),
    "Chicago Cubs": (1876, 2, 2),           # Chicago White Stockings
    "Chicago White Sox": (1901, 1, 28),
    "Cincinnati Reds": (1881, 11, 2),
    "Cleveland Guardians": (1901, 1, 28),   # Cleveland Indians
    "Colorado Rockies": (1991, 7, 5),
    "Detroit Tigers": (1901, 1, 28),
    "Houston Astros": (1962, 10, 17),       # Houston Colt .45s
    "Kansas City Royals": (1969, 1, 11),
    "Los Angeles Angels": (1961, 12, 6),
    "Los Angeles Dodgers": (1883, 1, 1),    # Brooklyn Atlantics
    "Miami Marlins": (1991, 7, 5),          # Florida Marlins
    "Milwaukee Brewers": (1969, 3, 28),     # Seattle Pilots
    "Minnesota Twins": (1901, 1, 28),       # Washington Senators
    "New York Mets": (1962, 10, 17),
    "New York Yankees": (1901, 1, 28),      # Baltimore Orioles (original)
    "Oakland Athletics": (1901, 1, 28),     # Philadelphia Athletics
    "Philadelphia Phillies": (1883, 1, 1),
    "Pittsburgh Pirates": (1881, 10, 15),
    "San Diego Padres": (1969, 5, 27),
    "San Francisco Giants": (1883, 1, 1),   # New York Gothams
    "Seattle Mariners": (1977, 2, 7),
    "St. Louis Cardinals": (1882, 1, 1),    # St. Louis Brown Stockings
    "Tampa Bay Rays": (1998, 3, 9),         # Tampa Bay Devil Rays
    "Texas Rangers": (1961, 12, 6),         # Washington Senators (second)
    "Toronto Blue Jays": (1977, 1, 15),
    "Washington Nationals": (1969, 4, 14),  # Montreal Expos

    # NHL Teams (32 teams)
    "Anaheim Ducks": (1993, 3, 1),          # Mighty Ducks of Anaheim
    "Arizona Coyotes": (1972, 6, 23),       # Winnipeg Jets (original)
    "Boston Bruins": (1924, 11, 1),
    "Buffalo Sabres": (1970, 5, 22),
    "Calgary Flames": (1972, 6, 6),         # Atlanta Flames
    "Carolina Hurricanes": (1972, 2, 9),    # New England Whalers
    "Chicago Blackhawks": (1926, 9, 25),
    "Colorado Avalanche": (1972, 2, 9),     # Quebec Nordiques
    "Columbus Blue Jackets": (1997, 6, 25),
    "Dallas Stars": (1967, 2, 9),           # Minnesota North Stars
    "Detroit Red Wings": (1926, 9, 25),     # Detroit Cougars
    "Edmonton Oilers": (1972, 6, 22),
    "Florida Panthers": (1993, 4, 14),
    "Los Angeles Kings": (1967, 2, 9),
    "Minnesota Wild": (2000, 6, 25),
    "Montreal Canadiens": (1909, 12, 4),
    "Nashville Predators": (1998, 5, 4),
    "New Jersey Devils": (1974, 6, 11),     # Kansas City Scouts
    "New York Islanders": (1972, 6, 6),
    "New York Rangers": (1926, 5, 15),
    "Ottawa Senators": (1992, 12, 16),      # Modern expansion
    "Philadelphia Flyers": (1967, 2, 9),
    "Pittsburgh Penguins": (1967, 2, 9),
    "San Jose Sharks": (1991, 5, 9),
    "Seattle Kraken": (2018, 12, 4),
    "St. Louis Blues": (1967, 2, 9),
    "Tampa Bay Lightning": (1992, 12, 16),
    "Toronto Maple Leafs": (1917, 11, 22),  # Toronto Arenas
    "Vancouver Canucks": (1970, 5, 22),
    "Vegas Golden Knights": (2016, 6, 22),
    "Washington Capitals": (1974, 6, 11),
    "Winnipeg Jets": (2011, 5, 31),         # Atlanta Thrashers relocated
}

# Alternative name mappings for matching
TEAM_NAME_ALIASES = {
    "cardinals": "Arizona Cardinals",
    "falcons": "Atlanta Falcons",
    "ravens": "Baltimore Ravens",
    "bills": "Buffalo Bills",
    "panthers": "Carolina Panthers",
    "bears": "Chicago Bears",
    "bengals": "Cincinnati Bengals",
    "browns": "Cleveland Browns",
    "cowboys": "Dallas Cowboys",
    "broncos": "Denver Broncos",
    "lions": "Detroit Lions",
    "packers": "Green Bay Packers",
    "texans": "Houston Texans",
    "colts": "Indianapolis Colts",
    "jaguars": "Jacksonville Jaguars",
    "chiefs": "Kansas City Chiefs",
    "raiders": "Las Vegas Raiders",
    "chargers": "Los Angeles Chargers",
    "rams": "Los Angeles Rams",
    "dolphins": "Miami Dolphins",
    "vikings": "Minnesota Vikings",
    "patriots": "New England Patriots",
    "saints": "New Orleans Saints",
    "giants": "New York Giants",
    "jets": "New York Jets",
    "eagles": "Philadelphia Eagles",
    "steelers": "Pittsburgh Steelers",
    "49ers": "San Francisco 49ers",
    "niners": "San Francisco 49ers",
    "seahawks": "Seattle Seahawks",
    "buccaneers": "Tampa Bay Buccaneers",
    "bucs": "Tampa Bay Buccaneers",
    "titans": "Tennessee Titans",
    "commanders": "Washington Commanders",
    "redskins": "Washington Commanders",
    "football team": "Washington Commanders",
    # NBA
    "hawks": "Atlanta Hawks",
    "celtics": "Boston Celtics",
    "nets": "Brooklyn Nets",
    "hornets": "Charlotte Hornets",
    "bulls": "Chicago Bulls",
    "cavaliers": "Cleveland Cavaliers",
    "cavs": "Cleveland Cavaliers",
    "mavericks": "Dallas Mavericks",
    "mavs": "Dallas Mavericks",
    "nuggets": "Denver Nuggets",
    "pistons": "Detroit Pistons",
    "warriors": "Golden State Warriors",
    "dubs": "Golden State Warriors",
    "rockets": "Houston Rockets",
    "pacers": "Indiana Pacers",
    "clippers": "LA Clippers",
    "lakers": "Los Angeles Lakers",
    "grizzlies": "Memphis Grizzlies",
    "heat": "Miami Heat",
    "bucks": "Milwaukee Bucks",
    "timberwolves": "Minnesota Timberwolves",
    "wolves": "Minnesota Timberwolves",
    "pelicans": "New Orleans Pelicans",
    "knicks": "New York Knicks",
    "thunder": "Oklahoma City Thunder",
    "okc": "Oklahoma City Thunder",
    "magic": "Orlando Magic",
    "76ers": "Philadelphia 76ers",
    "sixers": "Philadelphia 76ers",
    "suns": "Phoenix Suns",
    "blazers": "Portland Trail Blazers",
    "trail blazers": "Portland Trail Blazers",
    "kings": "Sacramento Kings",
    "spurs": "San Antonio Spurs",
    "raptors": "Toronto Raptors",
    "jazz": "Utah Jazz",
    "wizards": "Washington Wizards",
    # NHL
    "ducks": "Anaheim Ducks",
    "coyotes": "Arizona Coyotes",
    "bruins": "Boston Bruins",
    "sabres": "Buffalo Sabres",
    "flames": "Calgary Flames",
    "hurricanes": "Carolina Hurricanes",
    "canes": "Carolina Hurricanes",
    "blackhawks": "Chicago Blackhawks",
    "avalanche": "Colorado Avalanche",
    "avs": "Colorado Avalanche",
    "blue jackets": "Columbus Blue Jackets",
    "cbj": "Columbus Blue Jackets",
    "stars": "Dallas Stars",
    "red wings": "Detroit Red Wings",
    "oilers": "Edmonton Oilers",
    "panthers hockey": "Florida Panthers",
    "la kings": "Los Angeles Kings",
    "wild": "Minnesota Wild",
    "canadiens": "Montreal Canadiens",
    "habs": "Montreal Canadiens",
    "predators": "Nashville Predators",
    "preds": "Nashville Predators",
    "devils": "New Jersey Devils",
    "islanders": "New York Islanders",
    "isles": "New York Islanders",
    "rangers": "New York Rangers",
    "senators": "Ottawa Senators",
    "sens": "Ottawa Senators",
    "flyers": "Philadelphia Flyers",
    "penguins": "Pittsburgh Penguins",
    "pens": "Pittsburgh Penguins",
    "sharks": "San Jose Sharks",
    "kraken": "Seattle Kraken",
    "blues": "St. Louis Blues",
    "lightning": "Tampa Bay Lightning",
    "bolts": "Tampa Bay Lightning",
    "maple leafs": "Toronto Maple Leafs",
    "leafs": "Toronto Maple Leafs",
    "canucks": "Vancouver Canucks",
    "golden knights": "Vegas Golden Knights",
    "vgk": "Vegas Golden Knights",
    "capitals": "Washington Capitals",
    "caps": "Washington Capitals",
    "wpg jets": "Winnipeg Jets",
    # MLB
    "diamondbacks": "Arizona Diamondbacks",
    "dbacks": "Arizona Diamondbacks",
    "braves": "Atlanta Braves",
    "orioles": "Baltimore Orioles",
    "os": "Baltimore Orioles",
    "red sox": "Boston Red Sox",
    "cubs": "Chicago Cubs",
    "white sox": "Chicago White Sox",
    "sox": "Chicago White Sox",
    "reds": "Cincinnati Reds",
    "guardians": "Cleveland Guardians",
    "indians": "Cleveland Guardians",
    "rockies": "Colorado Rockies",
    "tigers": "Detroit Tigers",
    "astros": "Houston Astros",
    "stros": "Houston Astros",
    "royals": "Kansas City Royals",
    "angels": "Los Angeles Angels",
    "halos": "Los Angeles Angels",
    "dodgers": "Los Angeles Dodgers",
    "marlins": "Miami Marlins",
    "brewers": "Milwaukee Brewers",
    "crew": "Milwaukee Brewers",
    "twins": "Minnesota Twins",
    "mets": "New York Mets",
    "yankees": "New York Yankees",
    "yanks": "New York Yankees",
    "athletics": "Oakland Athletics",
    "a's": "Oakland Athletics",
    "phillies": "Philadelphia Phillies",
    "phils": "Philadelphia Phillies",
    "pirates": "Pittsburgh Pirates",
    "bucs baseball": "Pittsburgh Pirates",
    "padres": "San Diego Padres",
    "friars": "San Diego Padres",
    "mariners": "Seattle Mariners",
    "m's": "Seattle Mariners",
    "cardinals baseball": "St. Louis Cardinals",
    "cards": "St. Louis Cardinals",
    "rays": "Tampa Bay Rays",
    "texas rangers": "Texas Rangers",
    "blue jays": "Toronto Blue Jays",
    "jays": "Toronto Blue Jays",
    "nationals": "Washington Nationals",
    "nats": "Washington Nationals",
}

def get_team_founding(team_name: str) -> dict:
    """Get franchise founding date for a team"""
    # Try direct match first
    if team_name in FRANCHISE_FOUNDING_DATES:
        year, month, day = FRANCHISE_FOUNDING_DATES[team_name]
        return {"found": True, "team": team_name, "year": year, "month": month, "day": day}

    # Try alias matching
    team_lower = team_name.lower()
    for alias, full_name in TEAM_NAME_ALIASES.items():
        if alias in team_lower or team_lower in alias:
            if full_name in FRANCHISE_FOUNDING_DATES:
                year, month, day = FRANCHISE_FOUNDING_DATES[full_name]
                return {"found": True, "team": full_name, "year": year, "month": month, "day": day}

    # Try partial match
    for full_name in FRANCHISE_FOUNDING_DATES:
        if team_lower in full_name.lower() or full_name.lower() in team_lower:
            year, month, day = FRANCHISE_FOUNDING_DATES[full_name]
            return {"found": True, "team": full_name, "year": year, "month": month, "day": day}

    return {"found": False, "team": team_name, "year": None, "month": None, "day": None}

# ============================================================================
# TWITTER GEMATRIA COMMUNITY - 6 CIPHER SYSTEM
# Sources: @gematriasports, @psgematria, @SportsGematria, @SGDecodes
# ============================================================================

def cipher_ordinal(text: str) -> int:
    """Ordinal: A=1, B=2, ... Z=26 (most common cipher)"""
    return sum(ord(c) - 64 for c in (text or "").upper() if 65 <= ord(c) <= 90)

def cipher_reduction(text: str) -> int:
    """Reduction/Pythagorean: Reduce to single digits (purest form)"""
    total = 0
    for c in (text or "").upper():
        if 65 <= ord(c) <= 90:
            val = ord(c) - 64
            while val > 9:
                val = sum(int(d) for d in str(val))
            total += val
    return total

def cipher_reverse_ordinal(text: str) -> int:
    """Reverse Ordinal: Z=1, Y=2, ... A=26"""
    return sum(27 - (ord(c) - 64) for c in (text or "").upper() if 65 <= ord(c) <= 90)

def cipher_reverse_reduction(text: str) -> int:
    """Reverse Reduction: Reverse + reduce to single digits"""
    total = 0
    for c in (text or "").upper():
        if 65 <= ord(c) <= 90:
            val = 27 - (ord(c) - 64)
            while val > 9:
                val = sum(int(d) for d in str(val))
            total += val
    return total

def cipher_sumerian(text: str) -> int:
    """Sumerian: Multiply by 6 (A=6, B=12, ... Z=156)"""
    return sum((ord(c) - 64) * 6 for c in (text or "").upper() if 65 <= ord(c) <= 90)

def cipher_jewish(text: str) -> int:
    """Jewish/Hebrew: Traditional Kabbalistic values"""
    values = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'K': 10, 'L': 20, 'M': 30, 'N': 40, 'O': 50, 'P': 60, 'Q': 70, 'R': 80,
        'S': 90, 'T': 100, 'U': 200, 'V': 300, 'W': 400, 'X': 500, 'Y': 600, 'Z': 700, 'J': 600
    }
    return sum(values.get(c, 0) for c in (text or "").upper())

def get_all_ciphers(text: str) -> dict:
    """Calculate all 6 ciphers for a text string"""
    return {
        "ordinal": cipher_ordinal(text),
        "reduction": cipher_reduction(text),
        "reverse_ordinal": cipher_reverse_ordinal(text),
        "reverse_reduction": cipher_reverse_reduction(text),
        "sumerian": cipher_sumerian(text),
        "jewish": cipher_jewish(text)
    }

# ============================================================================
# DATE NUMEROLOGY - Twitter Community Standard
# ============================================================================

def calculate_date_numerology(date: datetime = None) -> dict:
    """
    Full date numerology breakdown used by @gematriasports, @SportsGematria
    """
    if date is None:
        date = datetime.now()

    day = date.day
    month = date.month
    year = date.year
    year_short = year % 100

    # Standard reductions
    def reduce(n):
        while n > 9 and n not in [11, 22, 33]:
            n = sum(int(d) for d in str(n))
        return n

    # Multiple date formats used by community
    formats = {
        "full": month + day + year,           # 1+9+2026
        "short": month + day + year_short,    # 1+9+26
        "day_month": day + month,             # 9+1
        "month_day": month * 100 + day,       # 109
    }

    reductions = {k: reduce(v) for k, v in formats.items()}

    # Life path number
    life_path = reduce(sum(int(d) for d in f"{year}{month:02d}{day:02d}"))

    # Check for power alignments
    alignments = []
    for fmt_name, value in formats.items():
        if value in POWER_NUMBERS["master"]:
            alignments.append(f"{fmt_name}={value} (MASTER)")
        if value in POWER_NUMBERS["tesla"]:
            alignments.append(f"{fmt_name}={value} (TESLA)")
        if value in JARVIS_TRIGGERS:
            alignments.append(f"{fmt_name}={value} (JARVIS: {JARVIS_TRIGGERS[value]['name']})")

    for fmt_name, value in reductions.items():
        if value in [3, 6, 9]:
            alignments.append(f"{fmt_name} reduces to {value} (TESLA)")
        if value in [11, 22, 33]:
            alignments.append(f"{fmt_name} reduces to {value} (MASTER)")

    return {
        "date": date.strftime("%Y-%m-%d"),
        "display": date.strftime("%a %b %d, %Y"),
        "day": day,
        "month": month,
        "year": year,
        "formats": formats,
        "reductions": reductions,
        "life_path": life_path,
        "alignments": alignments,
        "is_power_date": len(alignments) >= 2
    }

# ============================================================================
# JERSEY NUMBER ANALYSIS - Key Twitter Community Method
# ============================================================================

def analyze_jersey_number(jersey: int, date: datetime = None) -> dict:
    """
    Jersey number analysis - matches jersey to date numerology
    Used by @gematriasports, @SGDecodes for player props
    """
    if date is None:
        date = datetime.now()

    date_info = calculate_date_numerology(date)

    # Reduce jersey
    jersey_reduced = jersey
    while jersey_reduced > 9 and jersey_reduced not in [11, 22, 33]:
        jersey_reduced = sum(int(d) for d in str(jersey_reduced))

    alignments = []
    alignment_score = 0

    # Direct match to date components
    if jersey == date_info["day"]:
        alignments.append(f"Jersey {jersey} = Day of month")
        alignment_score += 25

    if jersey == date_info["month"]:
        alignments.append(f"Jersey {jersey} = Month")
        alignment_score += 20

    if jersey == date_info["life_path"]:
        alignments.append(f"Jersey {jersey} = Life path number")
        alignment_score += 30

    # Reduction matches
    for fmt_name, red_value in date_info["reductions"].items():
        if jersey_reduced == red_value:
            alignments.append(f"Jersey reduces to {jersey_reduced} = {fmt_name} reduction")
            alignment_score += 15

    # Power number check
    if jersey in POWER_NUMBERS["master"]:
        alignments.append(f"Jersey {jersey} = MASTER NUMBER")
        alignment_score += 20

    if jersey in POWER_NUMBERS["nfl_favorites"]:
        alignments.append(f"Jersey {jersey} = NFL narrative number")
        alignment_score += 10

    # Jarvis trigger check
    if jersey in JARVIS_TRIGGERS:
        trigger = JARVIS_TRIGGERS[jersey]
        alignments.append(f"Jersey {jersey} = JARVIS {trigger['name']}")
        alignment_score += trigger["boost"]

    return {
        "jersey": jersey,
        "jersey_reduced": jersey_reduced,
        "date": date_info["display"],
        "alignments": alignments,
        "alignment_score": min(100, alignment_score),
        "has_alignment": len(alignments) > 0,
        "recommendation": "STRONG ALIGNMENT" if alignment_score >= 40 else "MODERATE" if alignment_score >= 20 else "WEAK"
    }

# ============================================================================
# BEST STORYLINE ANALYSIS - Twitter Community Narrative Method
# ============================================================================

def analyze_storyline(home_team: str, away_team: str, context: dict = None) -> dict:
    """
    "Best Storyline" analysis - what narrative would the league push?
    Based on @psgematria, Gematria Effect Sports methodology
    """
    context = context or {}

    storylines = []
    home_score = 50
    away_score = 50

    # Get all ciphers for both teams
    home_ciphers = get_all_ciphers(home_team)
    away_ciphers = get_all_ciphers(away_team)

    # Check for championship/milestone narratives
    championship_keywords = ["first", "revenge", "repeat", "dynasty", "historic", "record"]

    # Cipher value analysis
    for cipher_name, home_val in home_ciphers.items():
        away_val = away_ciphers[cipher_name]

        # Check Jarvis triggers
        if home_val in JARVIS_TRIGGERS:
            trigger = JARVIS_TRIGGERS[home_val]
            storylines.append({
                "team": home_team,
                "type": "JARVIS_TRIGGER",
                "cipher": cipher_name,
                "value": home_val,
                "detail": f"{home_team} {cipher_name}={home_val} ({trigger['name']})"
            })
            home_score += trigger["boost"]

        if away_val in JARVIS_TRIGGERS:
            trigger = JARVIS_TRIGGERS[away_val]
            storylines.append({
                "team": away_team,
                "type": "JARVIS_TRIGGER",
                "cipher": cipher_name,
                "value": away_val,
                "detail": f"{away_team} {cipher_name}={away_val} ({trigger['name']})"
            })
            away_score += trigger["boost"]

        # Master numbers
        if home_val in POWER_NUMBERS["master"]:
            storylines.append({
                "team": home_team,
                "type": "MASTER_NUMBER",
                "cipher": cipher_name,
                "value": home_val,
                "detail": f"{home_team} {cipher_name}={home_val} (Master)"
            })
            home_score += 8

        if away_val in POWER_NUMBERS["master"]:
            storylines.append({
                "team": away_team,
                "type": "MASTER_NUMBER",
                "cipher": cipher_name,
                "value": away_val,
                "detail": f"{away_team} {cipher_name}={away_val} (Master)"
            })
            away_score += 8

        # Tesla alignment (difference)
        diff = abs(home_val - away_val)
        if diff in POWER_NUMBERS["tesla"]:
            storylines.append({
                "team": "matchup",
                "type": "TESLA_ALIGNMENT",
                "cipher": cipher_name,
                "value": diff,
                "detail": f"{cipher_name} difference = {diff} (Tesla)"
            })

    # Determine favored team
    if home_score > away_score + 10:
        favored = "home"
        favored_team = home_team
        reasoning = f"{home_team} has stronger gematria storyline ({home_score} vs {away_score})"
    elif away_score > home_score + 10:
        favored = "away"
        favored_team = away_team
        reasoning = f"{away_team} has stronger gematria storyline ({away_score} vs {home_score})"
    else:
        favored = "neutral"
        favored_team = None
        reasoning = "No clear storyline advantage"

    return {
        "home_team": home_team,
        "away_team": away_team,
        "home_ciphers": home_ciphers,
        "away_ciphers": away_ciphers,
        "storylines": storylines[:10],  # Top 10
        "home_score": min(100, home_score),
        "away_score": min(100, away_score),
        "favored": favored,
        "favored_team": favored_team,
        "reasoning": reasoning
    }

# ============================================================================
# FOUNDER'S ECHO - v10.3 RESONANCE LAYER
# Checks if franchise founding date resonates with today's game date
# Major insight from Twitter gematria community: founding dates are scripted
# ============================================================================

def analyze_founders_echo(team_name: str, game_date: datetime = None) -> dict:
    """
    FOUNDER'S ECHO - v10.3 Resonance Layer

    Checks for cosmic resonance between a franchise's founding date
    and the current game date. The Twitter gematria community has shown
    that leagues script outcomes around founding date alignments.

    Resonance Types:
    - EXACT DAY MATCH: Founding day = Game day (e.g., founded 8th, playing 8th)
    - MONTH MATCH: Same month as founding
    - ANNIVERSARY: Exact date match (month + day)
    - MILESTONE YEAR: Playing on a round anniversary (25, 50, 75, 100 years)
    - LIFE PATH SYNC: Founding date life path = Game date life path
    - NUMEROLOGICAL ECHO: Founding date reduces to same as game date
    """
    if game_date is None:
        game_date = datetime.now()

    founding_info = get_team_founding(team_name)

    if not founding_info["found"]:
        return {
            "team": team_name,
            "has_echo": False,
            "echo_score": 0,
            "echos": [],
            "message": "Franchise founding date not found",
            "founding_info": founding_info
        }

    found_year = founding_info["year"]
    found_month = founding_info["month"]
    found_day = founding_info["day"]

    game_day = game_date.day
    game_month = game_date.month
    game_year = game_date.year

    echos = []
    echo_score = 0

    # 1. EXACT DAY MATCH - Same day of month (MASSIVE RESONANCE)
    if found_day == game_day:
        echos.append({
            "type": "EXACT_DAY_MATCH",
            "detail": f"Founded on the {found_day}th, playing on the {game_day}th",
            "boost": 30,
            "tier": "LEGENDARY"
        })
        echo_score += 30

    # 2. MONTH MATCH - Same month
    if found_month == game_month:
        echos.append({
            "type": "MONTH_MATCH",
            "detail": f"Founded in month {found_month}, playing in month {game_month}",
            "boost": 20,
            "tier": "HIGH"
        })
        echo_score += 20

    # 3. ANNIVERSARY - Exact date match (month AND day) - ULTRA RARE
    if found_month == game_month and found_day == game_day:
        echos.append({
            "type": "ANNIVERSARY",
            "detail": f"Playing on franchise birthday! ({found_month}/{found_day})",
            "boost": 50,
            "tier": "IMMORTAL"
        })
        echo_score += 50  # Additional 50 on top of day/month matches

    # 4. MILESTONE YEAR - Round anniversary years
    years_since_founding = game_year - found_year
    milestone_years = [25, 50, 75, 100, 125, 150]
    if years_since_founding in milestone_years:
        echos.append({
            "type": "MILESTONE_YEAR",
            "detail": f"{years_since_founding}th anniversary season!",
            "boost": 25,
            "tier": "HIGH"
        })
        echo_score += 25

    # Near milestone (within 1 year)
    for milestone in milestone_years:
        if abs(years_since_founding - milestone) == 1:
            echos.append({
                "type": "NEAR_MILESTONE",
                "detail": f"Approaching/just passed {milestone}th anniversary ({years_since_founding} years)",
                "boost": 10,
                "tier": "MODERATE"
            })
            echo_score += 10
            break

    # 5. LIFE PATH SYNC - Founding date life path matches game date life path
    def calculate_life_path(year, month, day):
        total = sum(int(d) for d in f"{year}{month:02d}{day:02d}")
        while total > 9 and total not in [11, 22, 33]:
            total = sum(int(d) for d in str(total))
        return total

    founding_life_path = calculate_life_path(found_year, found_month, found_day)
    game_life_path = calculate_life_path(game_year, game_month, game_day)

    if founding_life_path == game_life_path:
        echos.append({
            "type": "LIFE_PATH_SYNC",
            "detail": f"Founding life path ({founding_life_path}) = Game life path ({game_life_path})",
            "boost": 25,
            "tier": "HIGH"
        })
        echo_score += 25

    # 6. NUMEROLOGICAL ECHO - Date sums match
    founding_sum = found_month + found_day + (found_year % 100)
    game_sum = game_month + game_day + (game_year % 100)

    def reduce(n):
        while n > 9:
            n = sum(int(d) for d in str(n))
        return n

    if reduce(founding_sum) == reduce(game_sum):
        echos.append({
            "type": "NUMEROLOGICAL_ECHO",
            "detail": f"Founding date reduces to {reduce(founding_sum)}, game date reduces to {reduce(game_sum)}",
            "boost": 15,
            "tier": "MODERATE"
        })
        echo_score += 15

    # 7. TESLA ALIGNMENT - Days or months divisible by 3, 6, or 9
    if found_day in [3, 6, 9, 12, 15, 18, 21, 24, 27, 30] and game_day in [3, 6, 9, 12, 15, 18, 21, 24, 27, 30]:
        echos.append({
            "type": "TESLA_DAY_ALIGNMENT",
            "detail": f"Both days Tesla-aligned: {found_day} and {game_day}",
            "boost": 10,
            "tier": "MODERATE"
        })
        echo_score += 10

    # 8. MASTER NUMBER YEAR - Year sum = 11, 22, or 33
    if years_since_founding in [11, 22, 33, 44, 55, 66, 77, 88, 99]:
        echos.append({
            "type": "MASTER_NUMBER_YEAR",
            "detail": f"{years_since_founding} years since founding (Master Number)",
            "boost": 20,
            "tier": "HIGH"
        })
        echo_score += 20

    # Cap at 100
    echo_score = min(100, echo_score)

    # Determine tier
    if echo_score >= 80:
        overall_tier = "LEGENDARY"
        emoji = "🏛️⚡"
        message = f"MASSIVE FOUNDER'S ECHO - {founding_info['team']} ({found_year})"
    elif echo_score >= 50:
        overall_tier = "HIGH"
        emoji = "🏛️✨"
        message = f"Strong Founder's Echo - {founding_info['team']}"
    elif echo_score >= 25:
        overall_tier = "MODERATE"
        emoji = "🏛️"
        message = f"Founder's Echo present - {founding_info['team']}"
    elif echo_score > 0:
        overall_tier = "MILD"
        emoji = "🏢"
        message = f"Minor Founder's resonance - {founding_info['team']}"
    else:
        overall_tier = "NONE"
        emoji = "📊"
        message = "No Founder's Echo detected"

    return {
        "team": team_name,
        "matched_team": founding_info["team"],
        "has_echo": echo_score > 0,
        "echo_score": echo_score,
        "tier": overall_tier,
        "emoji": emoji,
        "message": message,
        "echos": echos,
        "founding_info": {
            "year": found_year,
            "month": found_month,
            "day": found_day,
            "full_date": f"{found_month}/{found_day}/{found_year}",
            "years_since": game_year - found_year,
            "life_path": founding_life_path
        },
        "game_info": {
            "year": game_year,
            "month": game_month,
            "day": game_day,
            "full_date": f"{game_month}/{game_day}/{game_year}",
            "life_path": game_life_path
        }
    }

# ============================================================================
# LIFE PATH SYNC - v10.3 RESONANCE LAYER
# Checks if star player's life path matches game numerology
# Based on Twitter gematria insight: birthdates determine destiny games
# ============================================================================

# Star player birthdates database - key players per team
STAR_PLAYER_BIRTHDATES = {
    # NBA Stars
    "LeBron James": (1984, 12, 30),
    "Stephen Curry": (1988, 3, 14),
    "Kevin Durant": (1988, 9, 29),
    "Giannis Antetokounmpo": (1994, 12, 6),
    "Luka Doncic": (1999, 2, 28),
    "Jayson Tatum": (1998, 3, 3),
    "Joel Embiid": (1994, 3, 16),
    "Nikola Jokic": (1995, 2, 19),
    "Anthony Edwards": (2001, 8, 5),
    "Shai Gilgeous-Alexander": (1998, 7, 12),
    "Devin Booker": (1996, 10, 30),
    "Donovan Mitchell": (1996, 9, 7),
    "Ja Morant": (1999, 8, 10),
    "Trae Young": (1998, 9, 19),
    "Damian Lillard": (1990, 7, 15),
    "Jimmy Butler": (1989, 9, 14),
    "Bam Adebayo": (1997, 7, 18),
    "Paul George": (1990, 5, 2),
    "Kawhi Leonard": (1991, 6, 29),
    "Anthony Davis": (1993, 3, 11),
    "De'Aaron Fox": (1997, 12, 20),
    "Victor Wembanyama": (2004, 1, 4),
    "Paolo Banchero": (2002, 11, 12),
    "Tyrese Haliburton": (2000, 2, 29),
    "Domantas Sabonis": (1996, 5, 3),
    "Karl-Anthony Towns": (1995, 11, 15),
    "Cade Cunningham": (2001, 9, 25),
    "Jalen Brunson": (1996, 8, 31),
    "RJ Barrett": (2000, 6, 14),
    "Zion Williamson": (2000, 7, 6),

    # NFL Stars
    "Patrick Mahomes": (1995, 9, 17),
    "Josh Allen": (1996, 5, 21),
    "Lamar Jackson": (1997, 1, 7),
    "Jalen Hurts": (1998, 8, 7),
    "Joe Burrow": (1996, 12, 10),
    "Justin Herbert": (1998, 3, 10),
    "Trevor Lawrence": (1999, 10, 6),
    "Dak Prescott": (1993, 7, 29),
    "CJ Stroud": (2001, 10, 3),
    "Jordan Love": (1998, 11, 2),
    "Travis Kelce": (1989, 10, 5),
    "Tyreek Hill": (1994, 3, 1),
    "Davante Adams": (1992, 12, 24),
    "Justin Jefferson": (1999, 6, 16),
    "Ja'Marr Chase": (2000, 3, 1),
    "CeeDee Lamb": (1999, 4, 8),
    "Derrick Henry": (1994, 1, 4),
    "Christian McCaffrey": (1996, 6, 7),
    "Saquon Barkley": (1997, 2, 9),
    "Nick Bosa": (1997, 10, 23),
    "Micah Parsons": (1999, 5, 26),
    "TJ Watt": (1994, 10, 11),
    "Aaron Donald": (1991, 5, 23),
    "Myles Garrett": (1995, 12, 29),

    # NHL Stars
    "Connor McDavid": (1997, 1, 13),
    "Nathan MacKinnon": (1995, 9, 1),
    "Auston Matthews": (1997, 9, 17),
    "Leon Draisaitl": (1995, 10, 27),
    "Nikita Kucherov": (1993, 6, 17),
    "David Pastrnak": (1996, 5, 25),
    "Mikko Rantanen": (1996, 10, 29),
    "Mitch Marner": (1997, 5, 5),
    "Alex Ovechkin": (1985, 9, 17),
    "Sidney Crosby": (1987, 8, 7),
    "Cale Makar": (1998, 10, 30),
    "Quinn Hughes": (1999, 10, 14),
    "Adam Fox": (1998, 2, 17),
    "Andrei Vasilevskiy": (1994, 7, 25),
    "Igor Shesterkin": (1995, 12, 30),
    "Connor Hellebuyck": (1993, 5, 19),

    # MLB Stars
    "Shohei Ohtani": (1994, 7, 5),
    "Mike Trout": (1991, 8, 7),
    "Mookie Betts": (1992, 10, 7),
    "Ronald Acuna Jr": (1997, 12, 18),
    "Juan Soto": (1998, 10, 25),
    "Corey Seager": (1994, 4, 27),
    "Trea Turner": (1993, 6, 30),
    "Freddie Freeman": (1989, 9, 12),
    "Bryce Harper": (1992, 10, 16),
    "Aaron Judge": (1992, 4, 26),
    "Vladimir Guerrero Jr": (1999, 3, 16),
    "Bo Bichette": (1998, 3, 5),
    "Julio Rodriguez": (2000, 12, 29),
    "Bobby Witt Jr": (2000, 6, 14),
    "Gunnar Henderson": (2001, 6, 29),
    "Elly De La Cruz": (2002, 1, 11),
    "Corbin Carroll": (2000, 8, 21),
    "Pete Alonso": (1994, 12, 7),
    "Matt Olson": (1994, 3, 29),
    "Marcus Semien": (1990, 9, 17),
}

def get_player_birthdate(player_name: str) -> dict:
    """Get player's birthdate from database"""
    # Try direct match
    if player_name in STAR_PLAYER_BIRTHDATES:
        year, month, day = STAR_PLAYER_BIRTHDATES[player_name]
        return {"found": True, "player": player_name, "year": year, "month": month, "day": day}

    # Try partial match
    player_lower = player_name.lower()
    for known_player in STAR_PLAYER_BIRTHDATES:
        if player_lower in known_player.lower() or known_player.lower() in player_lower:
            year, month, day = STAR_PLAYER_BIRTHDATES[known_player]
            return {"found": True, "player": known_player, "year": year, "month": month, "day": day}

    # Try last name match
    player_parts = player_name.split()
    if player_parts:
        last_name = player_parts[-1].lower()
        for known_player in STAR_PLAYER_BIRTHDATES:
            if last_name in known_player.lower():
                year, month, day = STAR_PLAYER_BIRTHDATES[known_player]
                return {"found": True, "player": known_player, "year": year, "month": month, "day": day}

    return {"found": False, "player": player_name, "year": None, "month": None, "day": None}

def calculate_life_path_number(year: int, month: int, day: int) -> int:
    """Calculate life path number from birthdate"""
    total = sum(int(d) for d in f"{year}{month:02d}{day:02d}")
    while total > 9 and total not in [11, 22, 33]:
        total = sum(int(d) for d in str(total))
    return total

def analyze_life_path_sync(player_name: str, game_date: datetime = None) -> dict:
    """
    LIFE PATH SYNC - v10.3 Resonance Layer

    Checks if a star player's life path number syncs with the game's numerology.
    The Twitter gematria community has documented that players have "destiny games"
    when their life path aligns with the date.

    Sync Types:
    - EXACT LIFE PATH MATCH: Player life path = Game life path
    - BIRTHDAY MATCH: Playing on their birthday (or same day of month)
    - DESTINY NUMBER: Player jersey reduces to game day
    - AGE SYNC: Player's current age relates to game numerology
    """
    if game_date is None:
        game_date = datetime.now()

    player_info = get_player_birthdate(player_name)

    if not player_info["found"]:
        return {
            "player": player_name,
            "has_sync": False,
            "sync_score": 0,
            "syncs": [],
            "message": "Player birthdate not in database",
            "player_info": player_info
        }

    birth_year = player_info["year"]
    birth_month = player_info["month"]
    birth_day = player_info["day"]

    game_day = game_date.day
    game_month = game_date.month
    game_year = game_date.year

    # Calculate life paths
    player_life_path = calculate_life_path_number(birth_year, birth_month, birth_day)
    game_life_path = calculate_life_path_number(game_year, game_month, game_day)

    # Calculate current age
    player_age = game_year - birth_year
    if game_month < birth_month or (game_month == birth_month and game_day < birth_day):
        player_age -= 1

    syncs = []
    sync_score = 0

    # 1. EXACT LIFE PATH MATCH (MASSIVE SYNC)
    if player_life_path == game_life_path:
        syncs.append({
            "type": "EXACT_LIFE_PATH",
            "detail": f"Player life path ({player_life_path}) = Game life path ({game_life_path})",
            "boost": 35,
            "tier": "LEGENDARY"
        })
        sync_score += 35

    # 2. BIRTHDAY - Playing on actual birthday
    if birth_month == game_month and birth_day == game_day:
        syncs.append({
            "type": "BIRTHDAY_GAME",
            "detail": f"Playing on birthday! ({birth_month}/{birth_day})",
            "boost": 50,
            "tier": "IMMORTAL"
        })
        sync_score += 50

    # 3. SAME DAY OF MONTH
    elif birth_day == game_day:
        syncs.append({
            "type": "DAY_SYNC",
            "detail": f"Born on {birth_day}th, playing on {game_day}th",
            "boost": 25,
            "tier": "HIGH"
        })
        sync_score += 25

    # 4. SAME MONTH
    if birth_month == game_month and birth_day != game_day:
        syncs.append({
            "type": "BIRTHDAY_MONTH",
            "detail": f"Playing in birthday month ({birth_month})",
            "boost": 15,
            "tier": "MODERATE"
        })
        sync_score += 15

    # 5. AGE SYNC - Age matches game day or life path
    if player_age == game_day:
        syncs.append({
            "type": "AGE_DAY_SYNC",
            "detail": f"Player is {player_age} years old, playing on day {game_day}",
            "boost": 20,
            "tier": "HIGH"
        })
        sync_score += 20

    # Reduce age to single digit
    age_reduced = player_age
    while age_reduced > 9:
        age_reduced = sum(int(d) for d in str(age_reduced))

    if age_reduced == game_life_path:
        syncs.append({
            "type": "AGE_LIFE_PATH_SYNC",
            "detail": f"Age {player_age} reduces to {age_reduced} = game life path {game_life_path}",
            "boost": 15,
            "tier": "MODERATE"
        })
        sync_score += 15

    # 6. MASTER NUMBER PLAYER - Life path is 11, 22, or 33
    if player_life_path in [11, 22, 33]:
        syncs.append({
            "type": "MASTER_NUMBER_PLAYER",
            "detail": f"Player has Master Number life path ({player_life_path})",
            "boost": 15,
            "tier": "HIGH"
        })
        sync_score += 15

    # 7. TESLA ALIGNMENT - Life path is 3, 6, or 9
    if player_life_path in [3, 6, 9] and game_life_path in [3, 6, 9]:
        syncs.append({
            "type": "TESLA_SYNC",
            "detail": f"Both player ({player_life_path}) and game ({game_life_path}) are Tesla numbers",
            "boost": 20,
            "tier": "HIGH"
        })
        sync_score += 20

    # 8. PRIME AGE - Player at a prime number age
    primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
    if player_age in primes:
        syncs.append({
            "type": "PRIME_AGE",
            "detail": f"Player at prime age {player_age}",
            "boost": 10,
            "tier": "MODERATE"
        })
        sync_score += 10

    # 9. JERSEY DESTINY - If we have jersey number context
    # This would be passed in from the main function

    # Cap at 100
    sync_score = min(100, sync_score)

    # Determine tier
    if sync_score >= 80:
        overall_tier = "LEGENDARY"
        emoji = "🌟👤"
        message = f"MASSIVE LIFE PATH SYNC - {player_info['player']} DESTINY GAME"
    elif sync_score >= 50:
        overall_tier = "HIGH"
        emoji = "✨👤"
        message = f"Strong Life Path Sync - {player_info['player']}"
    elif sync_score >= 25:
        overall_tier = "MODERATE"
        emoji = "👤"
        message = f"Life Path Sync present - {player_info['player']}"
    elif sync_score > 0:
        overall_tier = "MILD"
        emoji = "📊"
        message = f"Minor numerological sync - {player_info['player']}"
    else:
        overall_tier = "NONE"
        emoji = "📊"
        message = "No Life Path Sync detected"

    return {
        "player": player_name,
        "matched_player": player_info["player"],
        "has_sync": sync_score > 0,
        "sync_score": sync_score,
        "tier": overall_tier,
        "emoji": emoji,
        "message": message,
        "syncs": syncs,
        "player_info": {
            "birth_year": birth_year,
            "birth_month": birth_month,
            "birth_day": birth_day,
            "birthdate": f"{birth_month}/{birth_day}/{birth_year}",
            "life_path": player_life_path,
            "current_age": player_age,
            "age_reduced": age_reduced
        },
        "game_info": {
            "year": game_year,
            "month": game_month,
            "day": game_day,
            "game_date": f"{game_month}/{game_day}/{game_year}",
            "life_path": game_life_path
        }
    }

# ============================================================================
# IMMORTAL 2178 VALIDATION
# ============================================================================

def validate_2178() -> dict:
    """Prove the mathematical uniqueness of 2178"""
    n = 2178
    reversal = 8712
    prop1 = (n * 4 == reversal)
    prop2 = (n * reversal == 66**4)

    return {
        "number": n,
        "reversal": reversal,
        "n_times_4_equals_reversal": prop1,
        "n_times_reversal": n * reversal,
        "sixty_six_to_fourth": 66**4,
        "n_times_reversal_equals_66_4": prop2,
        "validated": prop1 and prop2,
        "status": "IMMORTAL CONFIRMED" if (prop1 and prop2) else "VALIDATION FAILED"
    }

def digit_sum(n: int) -> int:
    return sum(int(d) for d in str(abs(n)))

def reduce_to_single(n: int) -> int:
    while n > 9:
        n = digit_sum(n)
    return n

def check_jarvis_trigger(value: int) -> dict:
    """Check if a value triggers any Jarvis edge numbers"""
    result = {
        "triggered": False,
        "triggers": [],
        "total_boost": 0,
        "highest_tier": None,
        "details": []
    }

    str_value = str(abs(value))

    if "2178" in str_value:
        trigger = JARVIS_TRIGGERS[2178]
        result["triggered"] = True
        result["triggers"].append(2178)
        result["total_boost"] += trigger["boost"]
        result["highest_tier"] = "LEGENDARY"
        result["details"].append("Contains THE IMMORTAL sequence (2178)")

    if value in JARVIS_TRIGGERS:
        trigger = JARVIS_TRIGGERS[value]
        if value not in result["triggers"]:
            result["triggered"] = True
            result["triggers"].append(value)
            result["total_boost"] += trigger["boost"]
            if result["highest_tier"] != "LEGENDARY":
                result["highest_tier"] = trigger["tier"]
            result["details"].append(f"Direct match: {trigger['name']}")

    reduced = reduce_to_single(value)
    for trigger_num, trigger in JARVIS_TRIGGERS.items():
        if trigger_num not in result["triggers"]:
            if reduce_to_single(trigger_num) == reduced:
                result["triggered"] = True
                result["triggers"].append(trigger_num)
                result["total_boost"] += trigger["boost"] * 0.5
                result["details"].append(f"Reduces to same as {trigger['name']}")

    if value % 33 == 0 and 33 not in result["triggers"]:
        result["triggered"] = True
        result["triggers"].append(33)
        result["total_boost"] += 5
        result["details"].append("Divisible by THE MASTER (33)")

    if reduced in TESLA_NUMBERS:
        result["details"].append(f"Tesla alignment: reduces to {reduced}")
        result["total_boost"] += 2

    return result

# ============================================================================
# MOON PHASE & DAILY ENERGY
# ============================================================================

def get_moon_phase() -> str:
    known_new_moon = datetime(2024, 1, 11)
    days_since = (datetime.now() - known_new_moon).days
    lunar_cycle = 29.53
    phase_num = (days_since % lunar_cycle) / lunar_cycle * 8
    phases = ['new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
              'full', 'waning_gibbous', 'last_quarter', 'waning_crescent']
    return phases[int(phase_num) % 8]

def get_daily_energy(date: datetime = None) -> dict:
    """Daily planetary energy - used by Twitter gematria community"""
    if date is None:
        date = datetime.now()

    day_energies = {
        0: {"planet": "Moon", "energy": "intuition", "bias": "home teams", "emoji": "🌙"},
        1: {"planet": "Mars", "energy": "aggression", "bias": "overs", "emoji": "♂️"},
        2: {"planet": "Mercury", "energy": "speed", "bias": "high-pace teams", "emoji": "☿"},
        3: {"planet": "Jupiter", "energy": "expansion", "bias": "underdogs", "emoji": "♃"},
        4: {"planet": "Venus", "energy": "harmony", "bias": "close games", "emoji": "♀"},
        5: {"planet": "Saturn", "energy": "discipline", "bias": "unders", "emoji": "♄"},
        6: {"planet": "Sun", "energy": "victory", "bias": "favorites", "emoji": "☉"}
    }

    return day_energies[date.weekday()]

# ============================================================================
# JARVIS SAVANT ESOTERIC WEIGHTS - +94.40u YTD PRESERVED
# These weights produced the winning edge - DO NOT CHANGE
# ============================================================================

JARVIS_ESOTERIC_WEIGHTS = {
    "gematria": 0.52,      # Boss approved - dominant
    "numerology": 0.20,
    "astro": 0.13,
    "vedic": 0.10,
    "sacred": 0.05,
    "fib_phi": 0.05,
    "vortex": 0.05
}

# Public Fade (Exoteric King) - ≥65% chalk = crush
PUBLIC_FADE_PENALTY = -0.13

# Mid-Spread Priority (Boss zone) - +4 to +9 strongest
MID_SPREAD_AMPLIFIER = 0.20

# NHL Pivot v5.9
NHL_ML_DOG_THRESHOLD_RS = 9.3
NHL_ML_DOG_THRESHOLD_PUBLIC = 65

# Betting thresholds
GOLD_STAR_THRESHOLD = 72  # 2u
EDGE_LEAN_THRESHOLD = 68  # 1u

# Large Spread Trap Gate (Kings 41-pt, Rice 31-pt lessons)
LARGE_SPREAD_TRAP_PENALTY = -0.20

# ============================================================================
# STANDALONE ESOTERIC EDGE MODULE (v10.2 NEW)
# Complete analysis tool with Jarvis Savant +94.40u weights
# ============================================================================

def calculate_standalone_esoteric(
    home_team: str,
    away_team: str,
    spread: float = None,
    total: float = None,
    player_name: str = None,
    jersey_number: int = None,
    prop_line: float = None,
    sport: str = "NBA",
    game_date: datetime = None
) -> dict:
    """
    STANDALONE ESOTERIC EDGE MODULE v10.3

    Complete gematria/numerology analysis as its own feature.
    Users can click into this to see full esoteric breakdown.
    Does NOT affect main research confidence score.

    v10.3 NEW: RESONANCE LAYER
    - Founder's Echo: Franchise founding date vs game date
    - Life Path Sync: Star player life path vs game numerology

    Integrates insights from:
    - @gematriasports
    - @psgematria
    - @SportsGematria
    - @SGDecodes
    - Gematria Effect Sports
    """
    if game_date is None:
        game_date = datetime.now()

    # 1. DATE NUMEROLOGY
    date_analysis = calculate_date_numerology(game_date)

    # 2. TEAM GEMATRIA (all 6 ciphers)
    home_ciphers = get_all_ciphers(home_team)
    away_ciphers = get_all_ciphers(away_team)

    # 3. STORYLINE ANALYSIS
    storyline = analyze_storyline(home_team, away_team)

    # 4. JERSEY NUMBER ANALYSIS (if provided)
    jersey_analysis = None
    if jersey_number:
        jersey_analysis = analyze_jersey_number(jersey_number, game_date)

    # 5. PLAYER GEMATRIA (if provided)
    player_analysis = None
    life_path_sync = None
    if player_name:
        player_ciphers = get_all_ciphers(player_name)
        player_jarvis = {}
        for cipher_name, value in player_ciphers.items():
            player_jarvis[cipher_name] = check_jarvis_trigger(value)

        player_analysis = {
            "name": player_name,
            "ciphers": player_ciphers,
            "jarvis_checks": player_jarvis,
            "has_jarvis_trigger": any(j["triggered"] for j in player_jarvis.values())
        }

        # v10.3 NEW: LIFE PATH SYNC for player
        life_path_sync = analyze_life_path_sync(player_name, game_date)

    # 6. MOON & PLANETARY
    moon_phase = get_moon_phase()
    daily_energy = get_daily_energy(game_date)

    # 7. v10.3 NEW: FOUNDER'S ECHO for both teams
    home_founders_echo = analyze_founders_echo(home_team, game_date)
    away_founders_echo = analyze_founders_echo(away_team, game_date)

    moon_emoji = {
        'new': '🌑', 'waxing_crescent': '🌒', 'first_quarter': '🌓', 'waxing_gibbous': '🌔',
        'full': '🌕', 'waning_gibbous': '🌖', 'last_quarter': '🌗', 'waning_crescent': '🌘'
    }.get(moon_phase, '🌙')

    # 7. LINE GEOMETRY (spread/total analysis)
    line_analysis = None
    if spread is not None or total is not None:
        line = spread if spread is not None else total
        line_abs = abs(line) if line else 0
        line_rounded = round(line_abs)

        line_insights = []
        if line_rounded in POWER_NUMBERS["fibonacci"]:
            line_insights.append(f"Line {line_rounded} = Fibonacci (natural harmony)")
        if line_rounded % 3 == 0:
            line_insights.append(f"Line {line_rounded} = Tesla divisible (3-6-9)")
        if line_rounded in POWER_NUMBERS["sacred"]:
            line_insights.append(f"Line {line_rounded} = Sacred number")
        if line_rounded in POWER_NUMBERS["master"]:
            line_insights.append(f"Line {line_rounded} = Master number")

        line_jarvis = check_jarvis_trigger(line_rounded)

        line_analysis = {
            "spread": spread,
            "total": total,
            "analyzed_line": line_rounded,
            "insights": line_insights,
            "jarvis_check": line_jarvis
        }

    # 8. CALCULATE ESOTERIC SCORE (standalone) - USING JARVIS SAVANT +94.40u WEIGHTS

    # Calculate component scores (0-100 scale)
    gematria_score = min(100, storyline["home_score"] if storyline["favored"] == "home" else storyline["away_score"])
    numerology_score = min(100, 50 + len(date_analysis["alignments"]) * 10)
    astro_score = 70 if moon_phase in ['full', 'new'] else 55 if moon_phase in ['waxing_gibbous', 'first_quarter'] else 50
    vedic_score = 50 + (date_analysis["life_path"] * 3) if date_analysis["life_path"] in [3, 6, 9, 11, 22, 33] else 50
    sacred_score = 60 if line_analysis and line_analysis["insights"] else 50
    fib_phi_score = 70 if line_analysis and any("Fibonacci" in i for i in line_analysis.get("insights", [])) else 50
    vortex_score = 65 if any("TESLA" in str(a) for a in date_analysis.get("alignments", [])) else 50

    # Apply JARVIS SAVANT WEIGHTS (the +94.40u formula)
    weighted_score = (
        gematria_score * JARVIS_ESOTERIC_WEIGHTS["gematria"] +
        numerology_score * JARVIS_ESOTERIC_WEIGHTS["numerology"] +
        astro_score * JARVIS_ESOTERIC_WEIGHTS["astro"] +
        vedic_score * JARVIS_ESOTERIC_WEIGHTS["vedic"] +
        sacred_score * JARVIS_ESOTERIC_WEIGHTS["sacred"] +
        fib_phi_score * JARVIS_ESOTERIC_WEIGHTS["fib_phi"] +
        vortex_score * JARVIS_ESOTERIC_WEIGHTS["vortex"]
    )

    esoteric_score = round(weighted_score)

    # Apply MID-SPREAD AMPLIFIER (+20% for +4 to +9 spreads)
    if spread is not None and 4 <= abs(spread) <= 9:
        esoteric_score = min(100, round(esoteric_score * (1 + MID_SPREAD_AMPLIFIER)))

    # Apply LARGE SPREAD TRAP GATE (-20% for >15 spreads)
    if spread is not None and abs(spread) > 15:
        esoteric_score = max(0, round(esoteric_score * (1 + LARGE_SPREAD_TRAP_PENALTY)))

    # Jersey alignment bonus
    if jersey_analysis and jersey_analysis["has_alignment"]:
        esoteric_score = min(100, esoteric_score + round(jersey_analysis["alignment_score"] * 0.2))

    # Player Jarvis trigger bonus
    if player_analysis and player_analysis["has_jarvis_trigger"]:
        esoteric_score = min(100, esoteric_score + 10)

    # v10.3 NEW: RESONANCE LAYER BONUSES

    # Founder's Echo bonus - team with stronger founding resonance gets boost
    resonance_bonus = 0
    resonance_favored = None

    if home_founders_echo["has_echo"] or away_founders_echo["has_echo"]:
        home_echo_score = home_founders_echo["echo_score"]
        away_echo_score = away_founders_echo["echo_score"]

        if home_echo_score > away_echo_score + 10:
            resonance_favored = "home"
            resonance_bonus = min(15, round(home_echo_score * 0.15))
        elif away_echo_score > home_echo_score + 10:
            resonance_favored = "away"
            resonance_bonus = min(15, round(away_echo_score * 0.15))

        # Apply resonance bonus to score
        esoteric_score = min(100, esoteric_score + resonance_bonus)

    # Life Path Sync bonus - if player has destiny game alignment
    life_path_bonus = 0
    if life_path_sync and life_path_sync["has_sync"]:
        life_path_bonus = min(10, round(life_path_sync["sync_score"] * 0.1))
        esoteric_score = min(100, esoteric_score + life_path_bonus)

    # Build resonance layer summary
    resonance_layer = {
        "active": resonance_bonus > 0 or life_path_bonus > 0,
        "total_bonus": resonance_bonus + life_path_bonus,
        "founders_echo": {
            "home": home_founders_echo,
            "away": away_founders_echo,
            "favored": resonance_favored,
            "bonus_applied": resonance_bonus
        },
        "life_path_sync": life_path_sync if life_path_sync else {"has_sync": False, "message": "No player specified"},
        "life_path_bonus": life_path_bonus
    }

    # Determine tier using JARVIS THRESHOLDS
    if esoteric_score >= GOLD_STAR_THRESHOLD:
        tier = "GOLD_STAR"
        emoji = "⭐⭐"
        badge = "2u GOLD STAR"
        bet_recommendation = "2u"
    elif esoteric_score >= EDGE_LEAN_THRESHOLD:
        tier = "EDGE_LEAN"
        emoji = "⭐"
        badge = "1u EDGE LEAN"
        bet_recommendation = "1u"
    elif esoteric_score >= 60:
        tier = "MILD_ALIGNMENT"
        emoji = "✨"
        badge = "WATCH"
        bet_recommendation = "0.5u or pass"
    else:
        tier = "NEUTRAL"
        emoji = "🔮"
        badge = "PASS"
        bet_recommendation = "pass"

    # Check for NHL ML Dog special play
    nhl_ml_dog = None
    if sport.upper() == "NHL" and spread and spread > 0:  # Underdog
        if esoteric_score >= NHL_ML_DOG_THRESHOLD_RS * 10:  # Scale RS to 0-100
            nhl_ml_dog = {
                "active": True,
                "bet": "0.5u ML Dog of the Day",
                "reasoning": f"NHL dog with RS {esoteric_score}% meets {NHL_ML_DOG_THRESHOLD_RS * 10}% threshold"
            }

    # Build top insights
    top_insights = []
    if storyline["storylines"]:
        top_insights.append(storyline["storylines"][0]["detail"])
    if date_analysis["alignments"]:
        top_insights.append(date_analysis["alignments"][0])
    if jersey_analysis and jersey_analysis["alignments"]:
        top_insights.append(jersey_analysis["alignments"][0])

    # v10.3 NEW: Add resonance layer insights
    if home_founders_echo["has_echo"] and home_founders_echo["echos"]:
        top_insights.append(f"🏛️ {home_founders_echo['echos'][0]['detail']}")
    if away_founders_echo["has_echo"] and away_founders_echo["echos"]:
        top_insights.append(f"🏛️ {away_founders_echo['echos'][0]['detail']}")
    if life_path_sync and life_path_sync["has_sync"] and life_path_sync["syncs"]:
        top_insights.append(f"👤 {life_path_sync['syncs'][0]['detail']}")

    top_insights.append(f"{moon_emoji} {moon_phase.replace('_', ' ').title()} Moon - {daily_energy['bias']}")

    return {
        "esoteric_score": esoteric_score,
        "tier": tier,
        "emoji": emoji,
        "badge": badge,
        "bet_recommendation": bet_recommendation,
        "top_insights": top_insights[:5],

        # JARVIS SAVANT +94.40u WEIGHTS BREAKDOWN
        "jarvis_weights": {
            "formula": "Gematria 52% + Numerology 20% + Astro 13% + Vedic 10% + Sacred 5% + Fib/Phi 5% + Vortex 5%",
            "ytd_record": "+94.40u",
            "components": {
                "gematria": {"score": gematria_score, "weight": "52%"},
                "numerology": {"score": numerology_score, "weight": "20%"},
                "astro": {"score": astro_score, "weight": "13%"},
                "vedic": {"score": vedic_score, "weight": "10%"},
                "sacred": {"score": sacred_score, "weight": "5%"},
                "fib_phi": {"score": fib_phi_score, "weight": "5%"},
                "vortex": {"score": vortex_score, "weight": "5%"}
            },
            "modifiers_applied": {
                "mid_spread_amplifier": spread is not None and 4 <= abs(spread) <= 9,
                "large_spread_trap": spread is not None and abs(spread) > 15
            }
        },

        # NHL ML Dog special play
        "nhl_ml_dog": nhl_ml_dog,

        # Full breakdowns for clickable detail
        "date_numerology": date_analysis,
        "team_analysis": {
            "home": {
                "team": home_team,
                "ciphers": home_ciphers
            },
            "away": {
                "team": away_team,
                "ciphers": away_ciphers
            }
        },
        "storyline": storyline,
        "jersey_analysis": jersey_analysis,
        "player_analysis": player_analysis,
        "line_analysis": line_analysis,

        # v10.3 NEW: RESONANCE LAYER
        "resonance_layer": resonance_layer,

        "cosmic": {
            "moon_phase": moon_phase,
            "moon_emoji": moon_emoji,
            "planetary_ruler": daily_energy["planet"],
            "daily_energy": daily_energy["energy"],
            "natural_bias": daily_energy["bias"],
            "planet_emoji": daily_energy["emoji"]
        },
        "immortal_status": validate_2178()["status"],

        # Favored pick from esoteric
        "esoteric_pick": {
            "favored": storyline["favored"],
            "favored_team": storyline["favored_team"],
            "reasoning": storyline["reasoning"]
        },

        # Thresholds used
        "thresholds": {
            "gold_star": GOLD_STAR_THRESHOLD,
            "edge_lean": EDGE_LEAN_THRESHOLD
        }
    }

# ============================================================================
# CONFLUENCE ALERT SYSTEM (v10.2 NEW)
# Shows when research model and esoteric align - informational only
# ============================================================================

def check_confluence_alert(
    main_confidence: int,
    main_pick: str,  # "home", "away", or team name
    esoteric_score: int,
    esoteric_pick: str  # "home", "away", or team name
) -> dict:
    """
    CONFLUENCE ALERT SYSTEM

    Checks if research model and esoteric edge point same direction.
    This is INFORMATIONAL ONLY - does not boost the main score.
    Users can decide if they want to factor this in.
    """

    # Normalize picks for comparison
    main_norm = main_pick.lower() if main_pick else ""
    esoteric_norm = esoteric_pick.lower() if esoteric_pick else ""

    same_direction = main_norm == esoteric_norm and main_norm != "" and main_norm != "neutral"

    # Both must be strong
    main_strong = main_confidence >= 70
    esoteric_strong = esoteric_score >= 65

    if same_direction and main_strong and esoteric_strong:
        # FULL CONFLUENCE
        if main_confidence >= 80 and esoteric_score >= 80:
            return {
                "has_confluence": True,
                "level": "PERFECT",
                "emoji": "🌟🔥⚡",
                "badge": "PERFECT CONFLUENCE",
                "message": "Research model and cosmic forces in PERFECT alignment",
                "color": "gold",
                "show_alert": True
            }
        elif main_confidence >= 75 and esoteric_score >= 70:
            return {
                "has_confluence": True,
                "level": "STRONG",
                "emoji": "⭐💪",
                "badge": "STRONG CONFLUENCE",
                "message": "Research and esoteric both favor same side",
                "color": "green",
                "show_alert": True
            }
        else:
            return {
                "has_confluence": True,
                "level": "MODERATE",
                "emoji": "✨",
                "badge": "CONFLUENCE",
                "message": "Models aligned - additional conviction",
                "color": "blue",
                "show_alert": True
            }

    elif same_direction and (main_strong or esoteric_strong):
        return {
            "has_confluence": False,
            "level": "PARTIAL",
            "emoji": "🔮",
            "badge": "PARTIAL ALIGNMENT",
            "message": "Same direction but not both strong",
            "color": "gray",
            "show_alert": False
        }

    elif not same_direction and main_strong and esoteric_strong:
        return {
            "has_confluence": False,
            "level": "DIVERGENT",
            "emoji": "⚡",
            "badge": "DIVERGENCE",
            "message": "Research and esoteric point different directions",
            "color": "orange",
            "show_alert": True  # Show as warning
        }

    else:
        return {
            "has_confluence": False,
            "level": "NONE",
            "emoji": "📊",
            "badge": "NO ALERT",
            "message": "No significant alignment or divergence",
            "color": "gray",
            "show_alert": False
        }

# ============================================================================
# V10.1 SIGNAL WEIGHTS - PRESERVED
# ============================================================================

SIGNAL_WEIGHTS = {
    "sharp_money": 22,
    "line_edge": 18,
    "injury_vacuum": 16,
    "game_pace": 15,
    "travel_fatigue": 14,
    "back_to_back": 13,
    "defense_vs_position": 12,
    "public_fade": 11,
    "steam_moves": 10,
    "home_court": 10,
    "weather": 10,
    "minutes_projection": 10,
    "referee": 8,
    "game_script": 8,
    "ensemble_ml": 8,
    "gematria": 3,
    "moon_phase": 2,
    "numerology": 2,
    "sacred_geometry": 2,
    "zodiac": 1,
    "jarvis_trigger": 5,
    "crush_zone": 4,
    "goldilocks": 3,
    "nhl_protocol": 4
}

# ============================================================================
# V10.1 JARVIS EDGE SIGNALS - PRESERVED
# ============================================================================

def calculate_public_fade_signal(public_percentage: float, is_favorite: bool) -> dict:
    signal = {
        "public_pct": public_percentage,
        "is_favorite": is_favorite,
        "in_crush_zone": False,
        "fade_signal": False,
        "influence": 0.0,
        "recommendation": ""
    }

    if public_percentage >= 65 and is_favorite:
        signal["in_crush_zone"] = True
        signal["fade_signal"] = True
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
        signal["influence"] = 0.45
        signal["recommendation"] = "Monitor - Public dog heavy"
    elif public_percentage <= 35:
        signal["influence"] = 0.55
        signal["recommendation"] = "Contrarian value - Public avoiding"
    else:
        signal["influence"] = 0.30
        signal["recommendation"] = "No clear public edge"

    return signal

def calculate_mid_spread_signal(spread: float) -> dict:
    abs_spread = abs(spread) if spread else 0
    signal = {
        "spread": spread,
        "abs_spread": abs_spread,
        "in_goldilocks": False,
        "influence": 0.0,
        "zone": "",
        "boost_modifier": 1.0
    }

    if 4 <= abs_spread <= 9:
        signal["in_goldilocks"] = True
        signal["zone"] = "GOLDILOCKS"
        signal["boost_modifier"] = 1.20
        signal["influence"] = 0.85 if 6 <= abs_spread <= 7 else 0.75
    elif abs_spread < 4:
        signal["zone"] = "TOO_TIGHT"
        signal["influence"] = 0.50
    elif abs_spread > 15:
        signal["zone"] = "TRAP_GATE"
        signal["influence"] = 0.25
        signal["boost_modifier"] = 0.80
    else:
        signal["zone"] = "MODERATE"
        signal["influence"] = 0.55

    return signal

def calculate_large_spread_trap(spread: float) -> dict:
    abs_spread = abs(spread) if spread else 0
    signal = {"spread": spread, "abs_spread": abs_spread, "is_trap": False, "penalty": 1.0, "warning": ""}

    if abs_spread > 15:
        signal["is_trap"] = True
        signal["penalty"] = 0.70 if abs_spread > 20 else 0.80
        signal["warning"] = "EXTREME TRAP" if abs_spread > 20 else "TRAP GATE ACTIVE"

    return signal

def calculate_nhl_dog_protocol(sport: str, spread: float, research_score: float, public_pct: float) -> dict:
    signal = {"sport": sport, "protocol_active": False, "conditions_met": [], "conditions_failed": [], "influence": 0.0, "recommendation": ""}

    if sport.upper() != "NHL":
        signal["recommendation"] = "Protocol only applies to NHL"
        return signal

    is_dog = spread > 0 if spread else False
    is_puck_line = abs(spread) == 1.5 if spread else False

    if is_dog and is_puck_line:
        signal["conditions_met"].append("Puck line dog (+1.5)")
    else:
        signal["conditions_failed"].append("Not puck line dog")

    if research_score >= 9.3:
        signal["conditions_met"].append(f"Research score {research_score} ≥ 9.3")
    else:
        signal["conditions_failed"].append(f"Research score {research_score} < 9.3")

    if public_pct >= 65:
        signal["conditions_met"].append(f"Public {public_pct}% ≥ 65%")
    else:
        signal["conditions_failed"].append(f"Public {public_pct}% < 65%")

    count = len(signal["conditions_met"])
    if count == 3:
        signal["protocol_active"] = True
        signal["influence"] = 0.92
        signal["recommendation"] = "FULL PROTOCOL"
    elif count == 2:
        signal["influence"] = 0.70
        signal["recommendation"] = "PARTIAL PROTOCOL"
    elif count == 1:
        signal["influence"] = 0.45
        signal["recommendation"] = "WEAK SIGNAL"
    else:
        signal["influence"] = 0.20
        signal["recommendation"] = "NO PROTOCOL"

    return signal

# ============================================================================
# V10.1 MAIN CONFIDENCE CALCULATION - PRESERVED
# ============================================================================

def calculate_main_confidence(game_data: dict, context: dict = None) -> dict:
    context = context or {}
    signals = {}

    # Sharp money
    sharp_data = context.get("sharp_data", {})
    if sharp_data:
        divergence = abs(sharp_data.get("money_pct", 50) - sharp_data.get("ticket_pct", 50))
        if divergence >= 25:
            signals["sharp_money"] = {"score": 95, "contribution": f"STRONG SHARP: {divergence}% divergence"}
        elif divergence >= 20:
            signals["sharp_money"] = {"score": 88, "contribution": f"Sharp detected: {divergence}% split"}
        elif divergence >= 15:
            signals["sharp_money"] = {"score": 75, "contribution": f"Moderate sharp lean: {divergence}%"}
        else:
            signals["sharp_money"] = {"score": 50, "contribution": "No significant sharp action"}
    else:
        signals["sharp_money"] = {"score": 50, "contribution": "No sharp data"}

    # Line edge
    odds = game_data.get("spread_odds", -110)
    if odds >= -100:
        signals["line_edge"] = {"score": 95, "contribution": f"ELITE odds: {odds}"}
    elif odds >= -105:
        signals["line_edge"] = {"score": 82, "contribution": f"Great odds: {odds}"}
    elif odds >= -110:
        signals["line_edge"] = {"score": 55, "contribution": f"Standard odds: {odds}"}
    else:
        signals["line_edge"] = {"score": 40, "contribution": f"Poor odds: {odds}"}

    # Game pace
    total = game_data.get("total", 220)
    if total >= 235:
        signals["game_pace"] = {"score": 88, "contribution": f"High pace: O/U {total}"}
    elif total >= 228:
        signals["game_pace"] = {"score": 72, "contribution": f"Above avg pace: O/U {total}"}
    elif total <= 210:
        signals["game_pace"] = {"score": 75, "contribution": f"Slow pace: O/U {total}"}
    else:
        signals["game_pace"] = {"score": 55, "contribution": f"Normal pace: O/U {total}"}

    # Home court
    home_team = (game_data.get("home_team") or "").lower()
    altitude_teams = ["nuggets", "denver", "jazz", "utah"]
    if any(t in home_team for t in altitude_teams):
        signals["home_court"] = {"score": 82, "contribution": "Altitude advantage"}
    else:
        signals["home_court"] = {"score": 58, "contribution": "Standard home court"}

    # Jarvis edges
    spread = game_data.get("spread", 0)
    public_pct = game_data.get("public_pct", 50)
    is_fav = game_data.get("is_favorite", False)
    sport = game_data.get("sport", "NBA")

    public_fade = calculate_public_fade_signal(public_pct, is_fav)
    if public_fade["in_crush_zone"]:
        signals["public_fade"] = {"score": 88, "contribution": public_fade["recommendation"]}
    elif public_fade["fade_signal"]:
        signals["public_fade"] = {"score": 72, "contribution": public_fade["recommendation"]}
    else:
        signals["public_fade"] = {"score": 50, "contribution": public_fade["recommendation"]}

    mid_spread = calculate_mid_spread_signal(spread)
    if mid_spread["in_goldilocks"]:
        signals["goldilocks"] = {"score": 78, "contribution": f"GOLDILOCKS ZONE: {abs(spread)} spread"}
    elif mid_spread["zone"] == "TRAP_GATE":
        signals["goldilocks"] = {"score": 30, "contribution": f"TRAP GATE: {abs(spread)} spread too large"}
    else:
        signals["goldilocks"] = {"score": 50, "contribution": f"{mid_spread['zone']} spread"}

    if sport.upper() == "NHL":
        nhl = calculate_nhl_dog_protocol(sport, spread, 70, public_pct)
        if nhl["protocol_active"]:
            signals["nhl_protocol"] = {"score": 92, "contribution": "FULL NHL DOG PROTOCOL"}
        elif len(nhl["conditions_met"]) >= 2:
            signals["nhl_protocol"] = {"score": 70, "contribution": "Partial NHL protocol"}
        else:
            signals["nhl_protocol"] = {"score": 50, "contribution": "NHL protocol inactive"}

    # Fill remaining
    for signal in ["injury_vacuum", "travel_fatigue", "back_to_back", "defense_vs_position",
                   "steam_moves", "weather", "minutes_projection", "referee", "game_script", "ensemble_ml"]:
        if signal not in signals:
            signals[signal] = {"score": 50, "contribution": "No data available"}

    # Calculate weighted average
    total_weight = 0
    weighted_sum = 0
    for signal_name, signal_data in signals.items():
        weight = SIGNAL_WEIGHTS.get(signal_name, 1)
        total_weight += weight
        weighted_sum += signal_data["score"] * weight

    confidence = round(weighted_sum / total_weight) if total_weight > 0 else 50

    if game_data.get("spread_odds") or game_data.get("over_odds"):
        confidence = min(100, confidence + 5)

    # Tier
    if confidence >= 80:
        tier = "GOLDEN_CONVERGENCE"
    elif confidence >= 70:
        tier = "SUPER_SIGNAL"
    elif confidence >= 60:
        tier = "HARMONIC_ALIGNMENT"
    else:
        tier = "PARTIAL_ALIGNMENT"

    # Recommendation
    if confidence >= 80:
        recommendation = "SMASH"
    elif confidence >= 70:
        recommendation = "STRONG"
    elif confidence >= 60:
        recommendation = "PLAY"
    elif confidence >= 55:
        recommendation = "LEAN"
    else:
        recommendation = "PASS"

    return {
        "confidence": confidence,
        "tier": tier,
        "recommendation": recommendation,
        "signals": signals,
        "top_signals": sorted(signals.items(), key=lambda x: x[1]["score"] * SIGNAL_WEIGHTS.get(x[0], 1), reverse=True)[:3]
    }

# ============================================================================
# API ENDPOINTS
# ============================================================================

@router.get("/today-energy")
async def get_today_energy():
    """Get today's esoteric reading"""
    date = datetime.now()
    return {
        "date_numerology": calculate_date_numerology(date),
        "moon_phase": get_moon_phase(),
        "daily_energy": get_daily_energy(date),
        "immortal_status": validate_2178()["status"]
    }

@router.get("/validate-immortal")
async def validate_immortal_endpoint():
    """Validate THE IMMORTAL number (2178)"""
    return validate_2178()

@router.get("/jarvis-triggers")
async def get_jarvis_triggers_endpoint():
    """Get all Jarvis trigger numbers"""
    return {
        "triggers": JARVIS_TRIGGERS,
        "power_numbers": POWER_NUMBERS,
        "tesla_numbers": TESLA_NUMBERS,
        "immortal_validation": validate_2178()
    }

@router.post("/check-trigger")
async def check_trigger_endpoint(data: dict):
    """Check if a value triggers Jarvis edges"""
    value = data.get("value", 0)
    return check_jarvis_trigger(int(value))

@router.post("/calculate-ciphers")
async def calculate_ciphers_endpoint(data: dict):
    """Calculate all 6 ciphers for any text"""
    text = data.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="text required")
    return {
        "text": text,
        "ciphers": get_all_ciphers(text),
        "jarvis_check": {cipher: check_jarvis_trigger(val) for cipher, val in get_all_ciphers(text).items()}
    }

@router.post("/date-numerology")
async def date_numerology_endpoint(data: dict):
    """Calculate date numerology"""
    date_str = data.get("date")
    if date_str:
        date = datetime.fromisoformat(date_str)
    else:
        date = datetime.now()
    return calculate_date_numerology(date)

# ============================================================================
# v10.3 NEW: RESONANCE LAYER ENDPOINTS
# ============================================================================

@router.post("/founders-echo")
async def founders_echo_endpoint(data: dict):
    """
    FOUNDER'S ECHO - v10.3 Resonance Layer

    Check if franchise founding date resonates with game date.
    Massive resonance = franchise playing on founding day/month/anniversary.
    """
    team = data.get("team", "")
    if not team:
        raise HTTPException(status_code=400, detail="team required")

    date_str = data.get("date")
    date = datetime.fromisoformat(date_str) if date_str else datetime.now()

    return analyze_founders_echo(team, date)

@router.post("/life-path-sync")
async def life_path_sync_endpoint(data: dict):
    """
    LIFE PATH SYNC - v10.3 Resonance Layer

    Check if star player's life path number matches game numerology.
    Strong sync = player in a "destiny game" with cosmic alignment.
    """
    player = data.get("player", "")
    if not player:
        raise HTTPException(status_code=400, detail="player required")

    date_str = data.get("date")
    date = datetime.fromisoformat(date_str) if date_str else datetime.now()

    return analyze_life_path_sync(player, date)

@router.get("/star-players")
async def get_star_players():
    """Get list of star players with birthdates in our database"""
    return {
        "total_players": len(STAR_PLAYER_BIRTHDATES),
        "players": [
            {
                "name": name,
                "birthdate": f"{month}/{day}/{year}",
                "life_path": calculate_life_path_number(year, month, day)
            }
            for name, (year, month, day) in STAR_PLAYER_BIRTHDATES.items()
        ]
    }

@router.get("/franchise-dates")
async def get_franchise_dates():
    """Get list of all franchise founding dates"""
    return {
        "total_franchises": len(FRANCHISE_FOUNDING_DATES),
        "franchises": [
            {
                "team": team,
                "founded": f"{month}/{day}/{year}",
                "years_since": datetime.now().year - year
            }
            for team, (year, month, day) in FRANCHISE_FOUNDING_DATES.items()
        ]
    }

@router.post("/jersey-analysis")
async def jersey_analysis_endpoint(data: dict):
    """Analyze jersey number alignment"""
    jersey = data.get("jersey")
    if not jersey:
        raise HTTPException(status_code=400, detail="jersey required")
    date_str = data.get("date")
    date = datetime.fromisoformat(date_str) if date_str else datetime.now()
    return analyze_jersey_number(int(jersey), date)

# ============================================================================
# STANDALONE ESOTERIC EDGE ENDPOINT (v10.2 NEW)
# ============================================================================

@router.post("/esoteric-edge")
async def esoteric_edge_endpoint(data: dict):
    """
    STANDALONE ESOTERIC EDGE ANALYSIS

    Complete gematria/numerology breakdown for any matchup.
    This is its own feature - click to explore the cosmic alignments.
    """
    home_team = data.get("home_team", "")
    away_team = data.get("away_team", "")

    if not home_team or not away_team:
        raise HTTPException(status_code=400, detail="home_team and away_team required")

    return calculate_standalone_esoteric(
        home_team=home_team,
        away_team=away_team,
        spread=data.get("spread"),
        total=data.get("total"),
        player_name=data.get("player_name"),
        jersey_number=data.get("jersey_number"),
        prop_line=data.get("prop_line"),
        sport=data.get("sport", "NBA"),
        game_date=datetime.fromisoformat(data["game_date"]) if data.get("game_date") else None
    )

# ============================================================================
# CONFLUENCE ALERT ENDPOINT (v10.2 NEW)
# ============================================================================

@router.post("/confluence-alert")
async def confluence_alert_endpoint(data: dict):
    """
    Check for confluence between research model and esoteric edge.
    Informational only - helps users see when both systems align.
    """
    return check_confluence_alert(
        main_confidence=data.get("main_confidence", 50),
        main_pick=data.get("main_pick", ""),
        esoteric_score=data.get("esoteric_score", 50),
        esoteric_pick=data.get("esoteric_pick", "")
    )

# ============================================================================
# MAIN ENDPOINTS WITH CONFLUENCE ALERTS
# ============================================================================

@router.get("/props/{sport}")
async def get_live_props(sport: str, limit: int = 5):
    """Get live props with v10.1 confidence + v10.2 standalone esoteric + confluence alerts"""
    sport_keys = {
        "nba": "basketball_nba",
        "nfl": "americanfootball_nfl",
        "mlb": "baseball_mlb",
        "nhl": "icehockey_nhl",
        "ncaab": "basketball_ncaab"
    }

    sport_key = sport_keys.get(sport.lower())
    if not sport_key:
        raise HTTPException(status_code=400, detail=f"Unsupported sport: {sport}")

    async with httpx.AsyncClient(timeout=30.0) as client:
        events_resp = await client.get(
            f"{ODDS_API_BASE}/sports/{sport_key}/events",
            params={"apiKey": ODDS_API_KEY, "dateFormat": "iso"}
        )

        if events_resp.status_code != 200:
            return {"props": [], "message": "Failed to fetch events"}

        events = events_resp.json()
        if not events:
            return {"props": [], "message": "No upcoming events"}

        all_props = []

        for event in events[:5]:
            event_id = event.get("id")
            home_team = event.get("home_team", "")
            away_team = event.get("away_team", "")
            commence_time = event.get("commence_time")

            props_resp = await client.get(
                f"{ODDS_API_BASE}/sports/{sport_key}/events/{event_id}/odds",
                params={
                    "apiKey": ODDS_API_KEY,
                    "regions": "us",
                    "markets": "player_points,player_rebounds,player_assists,player_threes",
                    "oddsFormat": "american"
                }
            )

            if props_resp.status_code != 200:
                continue

            props_data = props_resp.json()
            bookmakers = props_data.get("bookmakers", [])

            for bookmaker in bookmakers[:1]:
                for market in bookmaker.get("markets", []):
                    market_key = market.get("key", "")

                    for outcome in market.get("outcomes", []):
                        player_name = outcome.get("description", "Unknown")
                        prop_type = market_key.replace("player_", "").replace("_", " ").title()
                        line = outcome.get("point", 0)
                        price = outcome.get("price", -110)
                        bet_type = outcome.get("name", "Over")

                        # v10.1 Main confidence
                        game_data = {
                            "home_team": home_team,
                            "away_team": away_team,
                            "spread_odds": price,
                            "total": 220,
                            "sport": sport.upper()
                        }
                        main_result = calculate_main_confidence(game_data)

                        # v10.2 Standalone esoteric
                        esoteric_result = calculate_standalone_esoteric(
                            home_team=home_team,
                            away_team=away_team,
                            prop_line=line,
                            player_name=player_name,
                            sport=sport.upper()
                        )

                        # v10.2 Confluence alert
                        main_pick = "home" if main_result["recommendation"] in ["SMASH", "STRONG"] else "away"
                        confluence = check_confluence_alert(
                            main_confidence=main_result["confidence"],
                            main_pick=main_pick,
                            esoteric_score=esoteric_result["esoteric_score"],
                            esoteric_pick=esoteric_result["esoteric_pick"]["favored"]
                        )

                        # Only 70%+ confidence
                        if main_result["confidence"] >= 70:
                            all_props.append({
                                "player": player_name,
                                "team": home_team,
                                "opponent": away_team,
                                "prop_type": prop_type,
                                "line": line,
                                "bet_type": bet_type,
                                "price": price,

                                # v10.1 Main model
                                "confidence": main_result["confidence"],
                                "tier": main_result["tier"],
                                "recommendation": main_result["recommendation"],

                                # v10.2 Standalone esoteric (clickable)
                                "esoteric_edge": {
                                    "score": esoteric_result["esoteric_score"],
                                    "tier": esoteric_result["tier"],
                                    "emoji": esoteric_result["emoji"],
                                    "badge": esoteric_result["badge"],
                                    "top_insights": esoteric_result["top_insights"],
                                    "favored": esoteric_result["esoteric_pick"]["favored"]
                                },

                                # v10.2 Confluence alert
                                "confluence_alert": confluence,

                                "game_time": commence_time,
                                "bookmaker": bookmaker.get("title", "Unknown")
                            })

        all_props.sort(key=lambda x: x["confidence"], reverse=True)

        return {
            "props": all_props[:limit],
            "total_analyzed": len(all_props),
            "engine_version": "10.2",
            "codename": "JARVIS_SAVANT_ESOTERIC",
            "features": {
                "main_model": "v10.1 research-optimized weights",
                "esoteric_edge": "Standalone clickable module",
                "confluence_alerts": "Informational alignment system"
            },
            "daily_energy": {
                "date_numerology": calculate_date_numerology(),
                "moon_phase": get_moon_phase(),
                "planetary": get_daily_energy()
            }
        }

@router.get("/best-bets/{sport}")
async def get_best_bets(sport: str):
    """Get best bets with v10.1 confidence + v10.2 standalone esoteric + confluence alerts"""
    sport_keys = {
        "nba": "basketball_nba",
        "nfl": "americanfootball_nfl",
        "mlb": "baseball_mlb",
        "nhl": "icehockey_nhl"
    }

    sport_key = sport_keys.get(sport.lower())
    if not sport_key:
        raise HTTPException(status_code=400, detail=f"Unsupported sport: {sport}")

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(
            f"{ODDS_API_BASE}/sports/{sport_key}/odds",
            params={
                "apiKey": ODDS_API_KEY,
                "regions": "us",
                "markets": "spreads,totals",
                "oddsFormat": "american"
            }
        )

        if resp.status_code != 200:
            return {"games": [], "message": "Failed to fetch odds"}

        games = resp.json()
        analyzed_games = []

        for game in games:
            home_team = game.get("home_team", "")
            away_team = game.get("away_team", "")
            commence_time = game.get("commence_time")

            best_spread = None
            best_total = None

            for bm in game.get("bookmakers", []):
                for market in bm.get("markets", []):
                    if market["key"] == "spreads":
                        for outcome in market["outcomes"]:
                            if outcome["name"] == home_team:
                                best_spread = outcome.get("point", 0)
                    elif market["key"] == "totals":
                        for outcome in market["outcomes"]:
                            if outcome["name"] == "Over":
                                best_total = outcome.get("point", 220)

            # v10.1 Main confidence
            game_data = {
                "home_team": home_team,
                "away_team": away_team,
                "spread": best_spread,
                "total": best_total,
                "sport": sport.upper()
            }
            main_result = calculate_main_confidence(game_data)

            # v10.2 Standalone esoteric
            esoteric_result = calculate_standalone_esoteric(
                home_team=home_team,
                away_team=away_team,
                spread=best_spread,
                total=best_total,
                sport=sport.upper()
            )

            # v10.2 Confluence alert
            main_pick = "home" if main_result["recommendation"] in ["SMASH", "STRONG", "PLAY"] else "away"
            confluence = check_confluence_alert(
                main_confidence=main_result["confidence"],
                main_pick=main_pick,
                esoteric_score=esoteric_result["esoteric_score"],
                esoteric_pick=esoteric_result["esoteric_pick"]["favored"]
            )

            analyzed_games.append({
                "home_team": home_team,
                "away_team": away_team,
                "game_time": commence_time,
                "spread": best_spread,
                "total": best_total,

                # v10.1 Main model
                "main_confidence": main_result["confidence"],
                "main_tier": main_result["tier"],
                "recommendation": main_result["recommendation"],

                # v10.2 Standalone esoteric (clickable)
                "esoteric_edge": {
                    "score": esoteric_result["esoteric_score"],
                    "tier": esoteric_result["tier"],
                    "emoji": esoteric_result["emoji"],
                    "badge": esoteric_result["badge"],
                    "top_insights": esoteric_result["top_insights"],
                    "favored": esoteric_result["esoteric_pick"]["favored"],
                    "favored_team": esoteric_result["esoteric_pick"]["favored_team"],
                    "reasoning": esoteric_result["esoteric_pick"]["reasoning"]
                },

                # v10.2 Confluence alert
                "confluence_alert": confluence
            })

        analyzed_games.sort(key=lambda x: x["main_confidence"], reverse=True)

        return {
            "games": analyzed_games[:10],
            "engine_version": "10.2",
            "codename": "JARVIS_SAVANT_ESOTERIC",
            "daily_energy": {
                "date_numerology": calculate_date_numerology(),
                "moon_phase": get_moon_phase(),
                "planetary": get_daily_energy()
            }
        }

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "engine_version": "10.3",
        "codename": "JARVIS_SAVANT_RESONANCE",
        "immortal_status": validate_2178()["status"],
        "features": [
            "v10.1_research_weights_preserved",
            "standalone_esoteric_edge",
            "6_cipher_gematria_system",
            "date_numerology",
            "jersey_number_analysis",
            "storyline_analysis",
            "confluence_alerts",
            "jarvis_triggers",
            "immortal_2178",
            "public_fade_65",
            "goldilocks_zone",
            "trap_gate",
            "nhl_dog_protocol",
            # v10.3 NEW
            "founders_echo_resonance",
            "life_path_sync",
            "franchise_founding_dates_db",
            "star_player_birthdates_db"
        ],
        "resonance_layer": {
            "founders_echo": "Franchise founding date vs game date alignment",
            "life_path_sync": "Star player life path vs game numerology",
            "franchise_db_count": len(FRANCHISE_FOUNDING_DATES),
            "player_db_count": len(STAR_PLAYER_BIRTHDATES)
        },
        "twitter_sources": [
            "@gematriasports",
            "@psgematria",
            "@SportsGematria",
            "@SGDecodes"
        ]
    }


# =============================================================================
# BACKWARDS COMPATIBILITY
# =============================================================================

class LiveDataRouter:
    def __init__(self):
        self.router = router

    def get_router(self):
        return self.router

live_data_router = router
