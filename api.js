const API_BASE_URL = 'https://web-production-7b2a.up.railway.app';

export const api = {
  // ============ HEALTH ============
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch (e) {
      return { status: 'offline' };
    }
  },

  async getModelStatus() {
    const res = await fetch(`${API_BASE_URL}/model-status`);
    return await res.json();
  },

  // ============ BETTING SPLITS (PlayBook API) ============
  async getSplits(sport = 'NBA') {
    const res = await fetch(`${API_BASE_URL}/live/splits/${sport.toUpperCase()}`);
    return await res.json();
  },

  async getSharpMoney(sport = 'NBA') {
    const res = await fetch(`${API_BASE_URL}/sharp-money/${sport.toUpperCase()}`);
    return await res.json();
  },

  // ============ LIVE ODDS (The Odds API) ============
  async getLiveOdds(sport = 'NBA') {
    const res = await fetch(`${API_BASE_URL}/live/odds/${sport.toUpperCase()}`);
    return await res.json();
  },

  async getProps(sport = 'NBA') {
    const res = await fetch(`${API_BASE_URL}/props/${sport.toUpperCase()}`);
    return await res.json();
  },

  // ============ GAMES & ROSTERS ============
  async getLiveGames(sport = 'NBA') {
    const res = await fetch(`${API_BASE_URL}/live/games/${sport.toUpperCase()}`);
    return await res.json();
  },

  async getRoster(sport, team) {
    const res = await fetch(`${API_BASE_URL}/live/roster/${sport.toUpperCase()}/${encodeURIComponent(team)}`);
    return await res.json();
  },

  async getSlate(sport = 'NBA') {
    const res = await fetch(`${API_BASE_URL}/live/slate/${sport.toUpperCase()}`);
    return await res.json();
  },

  // ============ SMASH SPOTS / BEST BETS ============
  async getSmashSpots(sport = 'NBA') {
    const res = await fetch(`${API_BASE_URL}/smash-spots/${sport.toUpperCase()}`);
    return await res.json();
  },

  async getBestBets(sport = 'NBA') {
    const res = await fetch(`${API_BASE_URL}/best-bets/${sport.toUpperCase()}`);
    return await res.json();
  },

  async getPicks(sport = 'NBA') {
    const res = await fetch(`${API_BASE_URL}/picks/${sport.toUpperCase()}`);
    return await res.json();
  },

  // ============ PREDICTIONS ============
  async predictLive(data) {
    const res = await fetch(`${API_BASE_URL}/predict-live`, {
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
    });
    return await res.json();
  },

  // ============ LSTM BRAIN ============
  async getBrainStatus() {
    const res = await fetch(`${API_BASE_URL}/brain/status`);
    return await res.json();
  },

  async brainPredict(data) {
    const res = await fetch(`${API_BASE_URL}/brain/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  // ============ SIGNALS & GRADER ============
  async getSignals() {
    const res = await fetch(`${API_BASE_URL}/signals`);
    return await res.json();
  },

  async getGraderWeights() {
    const res = await fetch(`${API_BASE_URL}/grader/weights`);
    return await res.json();
  },

  async gradePick(data) {
    const res = await fetch(`${API_BASE_URL}/grader/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async getGradedPicks() {
    const res = await fetch(`${API_BASE_URL}/grader/history`);
    return await res.json();
  },

  // ============ ESOTERIC ============
  async analyzeEsoteric(data) {
    const res = await fetch(`${API_BASE_URL}/esoteric/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async getTodayEnergy() {
    const res = await fetch(`${API_BASE_URL}/esoteric/today`);
    return await res.json();
  },

  // ============ INJURIES ============
  async getInjuries(sport = 'NBA') {
    const res = await fetch(`${API_BASE_URL}/injuries/${sport.toUpperCase()}`);
    return await res.json();
  },

  // ============ PERFORMANCE ============
  async getPerformance() {
    const res = await fetch(`${API_BASE_URL}/performance`);
    return await res.json();
  },

  async getROI() {
    const res = await fetch(`${API_BASE_URL}/performance/roi`);
    return await res.json();
  }
};

export default api;
