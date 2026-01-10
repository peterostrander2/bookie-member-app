# Community Voting API Specification

## Overview

Backend endpoints needed for the "Man vs Machine" community voting feature.
Add these to your FastAPI backend on Railway.

---

## Endpoints

### 1. GET /votes/{game_vote_id}

Get current vote counts for a game.

**Request:**
```
GET /votes/2026-01-08_lakers_celtics_spread
```

**Response:**
```json
{
  "game_vote_id": "2026-01-08_lakers_celtics_spread",
  "home": 45,
  "away": 32,
  "over": 0,
  "under": 0,
  "total": 77,
  "userVote": "home"  // null if user hasn't voted, requires auth
}
```

### 2. POST /votes/{game_vote_id}

Submit or update a vote.

**Request:**
```
POST /votes/2026-01-08_lakers_celtics_spread
Content-Type: application/json

{
  "side": "home"  // "home", "away", "over", or "under"
}
```

**Response:**
```json
{
  "game_vote_id": "2026-01-08_lakers_celtics_spread",
  "home": 46,
  "away": 32,
  "over": 0,
  "under": 0,
  "total": 78,
  "userVote": "home"
}
```

### 3. GET /votes/leaderboard (Optional - Future Feature)

Get community accuracy leaderboard.

**Response:**
```json
{
  "weekly": [
    { "user_id": "abc123", "display_name": "SharpShooter", "correct": 12, "total": 15, "accuracy": 80 },
    { "user_id": "def456", "display_name": "FadeTheBot", "correct": 10, "total": 14, "accuracy": 71 }
  ],
  "ai_record": { "correct": 45, "total": 62, "accuracy": 72.5 }
}
```

---

## Database Schema

### PostgreSQL / SQLite

```sql
-- Votes table
CREATE TABLE community_votes (
  id SERIAL PRIMARY KEY,
  game_vote_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),  -- Optional: from Whop auth
  side VARCHAR(10) NOT NULL,  -- 'home', 'away', 'over', 'under'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(game_vote_id, user_id)
);

-- Index for fast lookups
CREATE INDEX idx_votes_game ON community_votes(game_vote_id);
```

### In-Memory (Simple Start)

```python
# Simple dict storage (loses data on restart, but works for MVP)
votes_store = {}

# Structure:
# votes_store["2026-01-08_lakers_celtics_spread"] = {
#   "home": 45,
#   "away": 32,
#   "over": 0,
#   "under": 0,
#   "user_votes": {"user_abc": "home", "user_def": "away"}
# }
```

---

## FastAPI Implementation

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import hashlib

app = FastAPI()

# Simple in-memory storage (replace with DB for production)
votes_store = {}

class VoteRequest(BaseModel):
    side: str  # "home", "away", "over", "under"

class VoteResponse(BaseModel):
    game_vote_id: str
    home: int
    away: int
    over: int
    under: int
    total: int
    userVote: Optional[str]

def get_user_id(request) -> str:
    """Get user ID from Whop auth or generate anonymous ID from IP"""
    # If you have Whop auth:
    # return request.state.user_id

    # Anonymous fallback (IP-based):
    ip = request.client.host
    return hashlib.md5(ip.encode()).hexdigest()[:12]

@app.get("/votes/{game_vote_id}")
async def get_votes(game_vote_id: str, request: Request):
    """Get current vote counts for a game"""
    user_id = get_user_id(request)

    if game_vote_id not in votes_store:
        return VoteResponse(
            game_vote_id=game_vote_id,
            home=0, away=0, over=0, under=0,
            total=0, userVote=None
        )

    data = votes_store[game_vote_id]
    user_vote = data.get("user_votes", {}).get(user_id)

    return VoteResponse(
        game_vote_id=game_vote_id,
        home=data.get("home", 0),
        away=data.get("away", 0),
        over=data.get("over", 0),
        under=data.get("under", 0),
        total=sum([data.get(k, 0) for k in ["home", "away", "over", "under"]]),
        userVote=user_vote
    )

@app.post("/votes/{game_vote_id}")
async def submit_vote(game_vote_id: str, vote: VoteRequest, request: Request):
    """Submit or update a vote"""
    user_id = get_user_id(request)

    if vote.side not in ["home", "away", "over", "under"]:
        raise HTTPException(status_code=400, detail="Invalid vote side")

    # Initialize if needed
    if game_vote_id not in votes_store:
        votes_store[game_vote_id] = {
            "home": 0, "away": 0, "over": 0, "under": 0,
            "user_votes": {}
        }

    data = votes_store[game_vote_id]

    # Remove previous vote if exists
    if user_id in data["user_votes"]:
        old_vote = data["user_votes"][user_id]
        data[old_vote] = max(0, data[old_vote] - 1)

    # Add new vote
    data[vote.side] += 1
    data["user_votes"][user_id] = vote.side

    return VoteResponse(
        game_vote_id=game_vote_id,
        home=data["home"],
        away=data["away"],
        over=data["over"],
        under=data["under"],
        total=sum([data[k] for k in ["home", "away", "over", "under"]]),
        userVote=vote.side
    )
```

---

## CORS Configuration

Make sure your FastAPI allows requests from your Vercel frontend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",
        "http://localhost:5173"  # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Testing

The frontend works with localStorage fallback until backend is ready:
1. Users can vote immediately (stored locally)
2. When backend is deployed, votes become shared across all users
3. No code changes needed on frontend

---

## Future Enhancements

1. **Whop Integration**: Use membership ID for user tracking
2. **Vote History**: Track historical accuracy of AI vs Community
3. **Leaderboard**: Show top "faders" and "followers"
4. **Discord Bot**: Post daily "Man vs Machine" results
5. **Notifications**: Alert when community heavily disagrees with AI
