const BASE_URL = 'https://web-production-7b2a.up.railway.app';

// API Key for authenticated endpoints (set in environment)
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Helper for authenticated GET requests
const authFetch = async (url) => {
  const headers = API_KEY ? { 'X-API-Key': API_KEY } : {};
  return fetch(url, { headers });
};

// Helper to get headers for authenticated POST requests
const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (API_KEY) headers['X-API-Key'] = API_KEY;
  return headers;
};

const api = {
  getHealth: async () => {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (!res.ok) return { status: 'error' };
      return res.json();
    } catch {
      return { status: 'error' };
    }
  },

  getLiveHealth: async () => {
    try {
      const res = await authFetch(`${BASE_URL}/live/health`);
      if (!res.ok) return { status: 'error' };
      return res.json();
    } catch {
      return { status: 'error' };
    }
  },

  getNoosphereStatus: async () => {
    try {
      const res = await authFetch(`${BASE_URL}/live/noosphere/status`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  getGannPhysicsStatus: async () => {
    try {
      const res = await authFetch(`${BASE_URL}/live/gann-physics-status`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  getEsotericEdge: async (sport = 'nba', matchup = null, statType = null) => {
    try {
      let url = `${BASE_URL}/live/esoteric-edge?sport=${sport}`;
      if (matchup) url += `&matchup=${encodeURIComponent(matchup)}`;
      if (statType) url += `&stat_type=${encodeURIComponent(statType)}`;
      const res = await authFetch(url);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  getSlate: async (sport = 'nba') => {
    try {
      const res = await authFetch(`${BASE_URL}/live/slate/${sport}`);
      if (!res.ok) return { games: [] };
      return res.json();
    } catch {
      return { games: [] };
    }
  },

  getGames: async (sport = 'nba') => {
    try {
      const res = await authFetch(`${BASE_URL}/live/games/${sport}`);
      if (!res.ok) return { games: [] };
      return res.json();
    } catch {
      return { games: [] };
    }
  },

  getProps: async (sport = 'nba') => {
    try {
      const res = await authFetch(`${BASE_URL}/live/props/${sport}`);
      if (!res.ok) return { props: [] };
      return res.json();
    } catch {
      return { props: [] };
    }
  },

  getBestBets: async (sport = 'nba') => {
    try {
      const res = await authFetch(`${BASE_URL}/live/best-bets/${sport}`);
      if (!res.ok) return { picks: [] };
      return res.json();
    } catch {
      return { picks: [] };
    }
  },

  getLiveGames: async (sport = 'nba') => {
    try {
      const res = await authFetch(`${BASE_URL}/live/games/${sport}`);
      if (!res.ok) return { games: [] };
      return res.json();
    } catch {
      return { games: [] };
    }
  },

  getSplits: async (sport = 'nba') => {
    try {
      const res = await authFetch(`${BASE_URL}/live/splits/${sport}`);
      if (!res.ok) return { splits: [] };
      return res.json();
    } catch {
      return { splits: [] };
    }
  },

  getSharpMoney: async (sport = 'nba') => {
    try {
      const res = await authFetch(`${BASE_URL}/live/sharp/${sport}`);
      if (!res.ok) return { sharp: [] };
      return res.json();
    } catch {
      return { sharp: [] };
    }
  },

  getInjuries: async (sport = 'nba') => {
    try {
      const res = await authFetch(`${BASE_URL}/live/injuries/${sport}`);
      if (!res.ok) return { injuries: [] };
      return res.json();
    } catch {
      return { injuries: [] };
    }
  },

  getTodayEnergy: async () => {
    try {
      const res = await fetch(`${BASE_URL}/esoteric/today-energy`);
      if (!res.ok) return { betting_outlook: 'NEUTRAL', overall_energy: 5.0 };
      const data = await res.json();
      // Defensive: ensure expected fields exist
      return {
        betting_outlook: data.betting_outlook || 'NEUTRAL',
        overall_energy: data.overall_energy ?? 5.0,
        ...data
      };
    } catch {
      return { betting_outlook: 'NEUTRAL', overall_energy: 5.0 };
    }
  },

  predictLive: async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/predict-live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  predictContext: async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/predict-context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  analyzeEsoteric: async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/esoteric/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  getSportsbooks: async () => {
    try {
      const res = await authFetch(`${BASE_URL}/live/sportsbooks`);
      if (!res.ok) return { sportsbooks: [], active_count: 0 };
      const data = await res.json();
      // Defensive: ensure expected fields exist
      return {
        sportsbooks: data.sportsbooks || [],
        active_count: data.active_count ?? (data.sportsbooks?.length || 0),
        ...data
      };
    } catch {
      return { sportsbooks: [], active_count: 0 };
    }
  },

  getLineShop: async (sport = 'nba') => {
    try {
      const res = await authFetch(`${BASE_URL}/live/line-shop/${sport.toLowerCase()}`);
      if (!res.ok) return { games: [] };
      return res.json();
    } catch {
      return { games: [] };
    }
  },

  generateBetslip: async (betData) => {
    try {
      const res = await fetch(`${BASE_URL}/live/betslip/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(betData)
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  // Bet Tracking
  trackBet: async (betData) => {
    try {
      const res = await fetch(`${BASE_URL}/live/bets/track`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(betData)
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  gradeBet: async (betId, outcome) => {
    try {
      const res = await fetch(`${BASE_URL}/live/bets/grade/${betId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ outcome })
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  getBetHistory: async (userId) => {
    try {
      const url = userId ? `${BASE_URL}/live/bets/history?user_id=${userId}` : `${BASE_URL}/live/bets/history`;
      const res = await authFetch(url);
      if (!res.ok) return { bets: [], stats: {} };
      return res.json();
    } catch {
      return { bets: [], stats: {} };
    }
  },

  // Parlay Builder
  getParlay: async (userId) => {
    try {
      const res = await authFetch(`${BASE_URL}/live/parlay/${userId}`);
      if (!res.ok) return { legs: [], combined_odds: null };
      return res.json();
    } catch {
      return { legs: [], combined_odds: null };
    }
  },

  addParlayLeg: async (legData) => {
    try {
      const res = await fetch(`${BASE_URL}/live/parlay/add`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(legData)
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  calculateParlay: async (legs, stake) => {
    try {
      const res = await fetch(`${BASE_URL}/live/parlay/calculate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ legs, stake })
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  placeParlay: async (parlayData) => {
    try {
      const res = await fetch(`${BASE_URL}/live/parlay/place`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(parlayData)
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  clearParlay: async (userId) => {
    try {
      const res = await fetch(`${BASE_URL}/live/parlay/clear/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  getParlayHistory: async (userId) => {
    try {
      const url = userId ? `${BASE_URL}/live/parlay/history?user_id=${userId}` : `${BASE_URL}/live/parlay/history`;
      const res = await authFetch(url);
      if (!res.ok) return { parlays: [], stats: {} };
      return res.json();
    } catch {
      return { parlays: [], stats: {} };
    }
  },

  // User Preferences
  getUserPreferences: async (userId) => {
    try {
      const res = await authFetch(`${BASE_URL}/live/user/preferences/${userId}`);
      if (!res.ok) return {};
      return res.json();
    } catch {
      return {};
    }
  },

  setUserPreferences: async (userId, preferences) => {
    try {
      const res = await fetch(`${BASE_URL}/live/user/preferences/${userId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences)
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }
};

export default api;
