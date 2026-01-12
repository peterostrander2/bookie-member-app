// Use environment variable for API URL, fallback to Railway deployment
const BASE_URL = import.meta.env.VITE_API_URL || 'https://web-production-7b2a.up.railway.app';

const api = {
  // Health & Status
  getHealth: async () => {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (!res.ok) return { status: 'offline' };
      return res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  getLiveHealth: async () => {
    try {
      const res = await fetch(`${BASE_URL}/live/health`);
      if (!res.ok) return { status: 'offline' };
      return res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  getModelStatus: async () => {
    try {
      const res = await fetch(`${BASE_URL}/model-status`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  getNoosphereStatus: async () => {
    try {
      const res = await fetch(`${BASE_URL}/live/noosphere/status`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  getGannPhysicsStatus: async () => {
    try {
      const res = await fetch(`${BASE_URL}/live/gann-physics-status`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  // Esoteric - Today's Energy
  getTodayEnergy: async () => {
    try {
      const res = await fetch(`${BASE_URL}/esoteric/today-energy`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  getEsotericEdge: async () => {
    try {
      const res = await fetch(`${BASE_URL}/live/esoteric-edge`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  // Live Data
  getSmashSpots: async (sport = 'NBA') => {
    try {
      const res = await fetch(`${BASE_URL}/live/slate/${sport}`);
      if (!res.ok) return { slate: [] };
      return res.json();
    } catch (err) {
      console.error('API Error:', err);
      return { slate: [] };
    }
  },

  getLiveGames: async (sport = 'NBA') => {
    try {
      const res = await fetch(`${BASE_URL}/live/games/${sport}`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  getLiveProps: async (sport = 'NBA') => {
    try {
      const res = await fetch(`${BASE_URL}/live/props/${sport}`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  getBestBets: async (sport = 'NBA') => {
    try {
      const res = await fetch(`${BASE_URL}/live/best-bets/${sport}`);
      if (!res.ok) return { sport, source: 'offline', count: 0, data: [] };
      return res.json();
    } catch {
      return { sport, source: 'offline', count: 0, data: [] };
    }
  },

  getLiveOdds: async (sport = 'NBA') => {
    try {
      const res = await fetch(`${BASE_URL}/live/games/${sport}`);
      if (!res.ok) return { games: [] };
      return res.json();
    } catch {
      return { games: [] };
    }
  },

  getSplits: async (sport = 'NBA') => {
    try {
      const res = await fetch(`${BASE_URL}/live/splits/${sport}`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  getSharpMoney: async (sport = 'NBA') => {
    try {
      const res = await fetch(`${BASE_URL}/live/sharp/${sport}`);
      if (!res.ok) return { signals: [] };
      return res.json();
    } catch {
      return { signals: [] };
    }
  },

  getInjuries: async (sport = 'NBA') => {
    try {
      const res = await fetch(`${BASE_URL}/live/injuries/${sport}`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  // Predictions
  predictLive: async (data) => {
    const res = await fetch(`${BASE_URL}/predict-live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getBrainPrediction: async (data) => {
    const res = await fetch(`${BASE_URL}/brain/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getBrainStatus: async () => {
    const res = await fetch(`${BASE_URL}/brain/status`);
    return res.json();
  },

  // Esoteric
  analyzeEsoteric: async (data) => {
    const res = await fetch(`${BASE_URL}/esoteric/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Grader
  getGraderWeights: async () => {
    const res = await fetch(`${BASE_URL}/grader/weights`);
    return res.json();
  },

  getGradedPicks: async () => {
    try {
      const res = await fetch(`${BASE_URL}/grader/picks`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  gradePick: async (data) => {
    const res = await fetch(`${BASE_URL}/grader/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getGraderBias: async () => {
    const res = await fetch(`${BASE_URL}/grader/bias`);
    return res.json();
  },

  // Edge Calculator
  calculateEdge: async (data) => {
    const res = await fetch(`${BASE_URL}/calculate-edge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Defense & Pace
  getDefenseRankings: async (sport, position) => {
    const res = await fetch(`${BASE_URL}/defense-rankings/${sport}/${position}`);
    return res.json();
  },

  getPaceRankings: async (sport) => {
    const res = await fetch(`${BASE_URL}/pace-rankings/${sport}`);
    return res.json();
  },

  // Teams
  getTeams: async (sport) => {
    const res = await fetch(`${BASE_URL}/teams/${sport}`);
    return res.json();
  },

  // Community Voting - Man vs Machine
  getVotes: async (gameVoteId) => {
    try {
      const res = await fetch(`${BASE_URL}/votes/${gameVoteId}`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  submitVote: async (gameVoteId, side) => {
    try {
      const res = await fetch(`${BASE_URL}/votes/${gameVoteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ side })
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  getVoteLeaderboard: async () => {
    try {
      const res = await fetch(`${BASE_URL}/votes/leaderboard`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  // Click-to-Bet Sportsbook Integration
  getSportsbooks: async () => {
    try {
      const res = await fetch(`${BASE_URL}/live/sportsbooks`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  getLineShop: async (sport = 'NBA') => {
    try {
      const res = await fetch(`${BASE_URL}/live/line-shop/${sport.toLowerCase()}`);
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
        headers: { 'Content-Type': 'application/json' },
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
