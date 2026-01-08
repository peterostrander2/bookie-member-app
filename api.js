const BASE_URL = 'https://web-production-7b2a.up.railway.app';

const api = {
  // Health
  getHealth: async () => {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json();
  },

  getModelStatus: async () => {
    const res = await fetch(`${BASE_URL}/model-status`);
    return res.json();
  },

  // Live Data
  getSmashSpots: async (sport = 'NBA') => {
    try {
      const res = await fetch(`${BASE_URL}/live/slate/${sport}`);
      return res.json();
    } catch (err) {
      console.error('API Error:', err);
      return { picks: [] };
    }
  },

  getLiveGames: async (sport = 'NBA') => {
    const res = await fetch(`${BASE_URL}/live/games/${sport}`);
    return res.json();
  },

  getLiveProps: async (sport = 'NBA') => {
    const res = await fetch(`${BASE_URL}/live/props/${sport}`);
    return res.json();
  },

  getLiveOdds: async (sport = 'NBA') => {
    const res = await fetch(`${BASE_URL}/live/odds/${sport}`);
    return res.json();
  },

  getSplits: async (sport = 'NBA') => {
    const res = await fetch(`${BASE_URL}/live/splits/${sport}`);
    return res.json();
  },

  getSharpMoney: async (sport = 'NBA') => {
    const res = await fetch(`${BASE_URL}/sharp-money/${sport}`);
    return res.json();
  },

  getInjuries: async (sport = 'NBA') => {
    const res = await fetch(`${BASE_URL}/live/injuries/${sport}`);
    return res.json();
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
  }
};

export default api;
