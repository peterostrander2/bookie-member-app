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
  },

  // ============================================================================
  // CLICK-TO-BET / SPORTSBOOK INTEGRATION
  // ============================================================================

  // Get list of supported sportsbooks with branding
  async getSportsbooks() {
    const resp = await authFetch(`${API_BASE_URL}/live/sportsbooks`);
    const data = await resp.json();
    // Transform to match BetslipModal expected format
    return (data.sportsbooks || []).map(book => ({
      id: book.key,
      name: book.name,
      color: book.color,
      logo: book.logo,
      web_url: book.web_url,
      available: true
    }));
  },

  // Generate betslip options across sportsbooks for a specific bet
  async generateBetslip({ game_id, bet_type, team, side, line, sport }) {
    const selection = side || team;
    const params = new URLSearchParams({
      sport: sport?.toUpperCase() || 'NBA',
      game_id: game_id || '',
      bet_type: bet_type || 'spread',
      selection: selection || ''
    });

    const resp = await authFetch(`${API_BASE_URL}/live/betslip/generate?${params}`);
    const data = await resp.json();

    // Transform to match BetslipModal expected format
    return {
      game: data.game,
      bet_type: data.bet_type,
      selection: data.selection,
      best_odds: data.best_odds,
      sportsbooks: (data.all_books || []).map(book => ({
        id: book.book_key,
        name: book.book_name,
        color: book.book_color,
        logo: book.book_logo,
        odds: book.odds,
        line: book.point,
        link: book.deep_link?.web || null,
        available: true
      }))
    };
  },

  // Line shopping - compare odds across all books for a sport
  async getLineShop(sport, gameId = null) {
    let url = `${API_BASE_URL}/live/line-shop/${sport.toUpperCase()}`;
    if (gameId) {
      url += `?game_id=${encodeURIComponent(gameId)}`;
    }
    return (await authFetch(url)).json();
  },

  // Get best bets / smash spots for a sport
  async getSmashSpots(sport = 'NBA') {
    const resp = await authFetch(`${API_BASE_URL}/live/best-bets/${sport.toUpperCase()}`);
    const data = await resp.json();

    // Return in format expected by SmashSpots.jsx
    return {
      sport: data.sport,
      source: data.source,
      slate: data.data || data.slate || [],
      count: data.count || 0,
      timestamp: data.timestamp
    };
  },

  // Get sharp money data
  async getSharpMoney(sport = 'NBA') {
    return (await authFetch(`${API_BASE_URL}/live/sharp/${sport.toUpperCase()}`)).json();
  },

  // Get betting splits
  async getSplits(sport = 'NBA') {
    return (await authFetch(`${API_BASE_URL}/live/splits/${sport.toUpperCase()}`)).json();
  },

  // Get player props
  async getProps(sport = 'NBA') {
    return (await authFetch(`${API_BASE_URL}/live/props/${sport.toUpperCase()}`)).json();
  },

  // Get esoteric edge analysis
  async getEsotericEdge() {
    return (await authFetch(`${API_BASE_URL}/live/esoteric-edge`)).json();
  },

  // Get today's energy
  async getTodayEnergy() {
    return (await fetch(`${API_BASE_URL}/esoteric/today-energy`)).json();
  }
};

export default api;
