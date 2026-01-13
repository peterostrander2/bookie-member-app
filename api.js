const BASE_URL = 'https://web-production-7b2a.up.railway.app';

// API Key for authenticated endpoints
const API_KEY = import.meta.env.VITE_API_KEY || '';

const authFetch = async (url) => {
  const headers = API_KEY ? { 'X-API-Key': API_KEY } : {};
  return fetch(url, { headers });
};

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
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
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
      if (!res.ok) return { sportsbooks: [] };
      return res.json();
    } catch {
      return { sportsbooks: [] };
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
  }
};

export default api;
