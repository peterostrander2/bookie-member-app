const API_BASE_URL = 'https://web-production-7b2a.up.railway.app';

// API Key for authenticated endpoints (set in environment)
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Helper for authenticated GET requests
const authFetch = async (url) => {
  const headers = API_KEY ? { 'X-API-Key': API_KEY } : {};
  return fetch(url, { headers });
};

// Helper to get headers for authenticated requests
const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }
  return headers;
};

export const api = {
  // Health (public)
  async getHealth() { 
    return (await fetch(`${API_BASE_URL}/health`)).json() 
  },
  
  async getModelStatus() { 
    return (await fetch(`${API_BASE_URL}/model-status`)).json() 
  },

  // Live Data (authenticated)
  async getLiveGames(sport = 'NBA') {
    return (await authFetch(`${API_BASE_URL}/live/games/${sport.toUpperCase()}`)).json()
  },

  async getRoster(sport, team) {
    return (await authFetch(`${API_BASE_URL}/live/roster/${sport.toUpperCase()}/${encodeURIComponent(team)}`)).json()
  },

  async getLiveSlate(sport = 'NBA') {
    return (await authFetch(`${API_BASE_URL}/live/slate/${sport.toUpperCase()}`)).json()
  },

  async getPlayerStats(playerName) {
    return (await authFetch(`${API_BASE_URL}/live/player/${encodeURIComponent(playerName)}`)).json()
  },

  // Predictions (public)
  async predictLive(data) { 
    return (await fetch(`${API_BASE_URL}/predict-live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sport: data.sport || 'NBA',
        player_name: data.playerName,
        player_team: data.playerTeam,
        opponent_team: data.opponentTeam,
        stat_type: data.statType || 'points',
        use_lstm_brain: data.useLstm !== false
      })
    })).json() 
  },
  
  async predictContext(data) {
    return (await fetch(`${API_BASE_URL}/predict-context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })).json()
  },

  // LSTM Brain (public)
  async getBrainStatus() {
    return (await fetch(`${API_BASE_URL}/brain/status`)).json()
  },

  // Grader (public)
  async getGraderWeights() {
    return (await fetch(`${API_BASE_URL}/grader/weights`)).json()
  },

  // Esoteric (public)
  async analyzeEsoteric(data) { 
    return (await fetch(`${API_BASE_URL}/esoteric/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })).json() 
  },

  // Teams (public)
  async getTeams(sport) {
    return (await fetch(`${API_BASE_URL}/teams/${sport.toUpperCase()}`)).json()
  },
  
  async normalizeTeam(teamInput, sport) {
    return (await fetch(`${API_BASE_URL}/teams/normalize?team_input=${encodeURIComponent(teamInput)}&sport=${sport}`)).json()
  },

  // Edge Calculator (public)
  async calculateEdge(probability, odds) { 
    return (await fetch(`${API_BASE_URL}/calculate-edge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ your_probability: probability, betting_odds: odds })
    })).json() 
  },

  // Scheduler (public)
  async getSchedulerStatus() {
    return (await fetch(`${API_BASE_URL}/scheduler/status`)).json()
  }
};

export default api;
