import { rateLimitedFetch, RateLimitError } from './rateLimit';

const API_BASE_URL = 'https://web-production-7b2a.up.railway.app';

// API Key for authenticated endpoints (set in environment)
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Fetch wrapper that optionally applies rate limiting
// Rate limiting disabled when VITE_RATE_LIMIT=false (checked at runtime for testing)
const apiFetch = async (url, options = {}) => {
  const rateLimitEnabled = import.meta.env.VITE_RATE_LIMIT !== 'false';
  if (rateLimitEnabled) {
    return rateLimitedFetch(url, options);
  }
  return fetch(url, options);
};

// Helper for authenticated GET requests
const authFetch = async (url) => {
  const headers = API_KEY ? { 'X-API-Key': API_KEY } : {};
  return apiFetch(url, { headers });
};

// Helper to get headers for authenticated requests
const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }
  return headers;
};

// Export rate limit error for consumers
export { RateLimitError };

export const api = {
  // Health (public)
  async getHealth() {
    return (await apiFetch(`${API_BASE_URL}/health`)).json()
  },

  async getModelStatus() {
    return (await apiFetch(`${API_BASE_URL}/model-status`)).json()
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
    return (await apiFetch(`${API_BASE_URL}/predict-live`, {
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
    return (await apiFetch(`${API_BASE_URL}/predict-context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })).json()
  },

  // LSTM Brain (public)
  async getBrainStatus() {
    return (await apiFetch(`${API_BASE_URL}/brain/status`)).json()
  },

  // Grader (public)
  async getGraderWeights() {
    return (await apiFetch(`${API_BASE_URL}/grader/weights`)).json()
  },

  // Esoteric (public)
  async analyzeEsoteric(data) {
    return (await apiFetch(`${API_BASE_URL}/esoteric/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })).json()
  },

  // Teams (public)
  async getTeams(sport) {
    return (await apiFetch(`${API_BASE_URL}/teams/${sport.toUpperCase()}`)).json()
  },

  async normalizeTeam(teamInput, sport) {
    return (await apiFetch(`${API_BASE_URL}/teams/normalize?team_input=${encodeURIComponent(teamInput)}&sport=${sport}`)).json()
  },

  // Edge Calculator (public)
  async calculateEdge(probability, odds) {
    return (await apiFetch(`${API_BASE_URL}/calculate-edge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ your_probability: probability, betting_odds: odds })
    })).json()
  },

  // Scheduler (public)
  async getSchedulerStatus() {
    return (await apiFetch(`${API_BASE_URL}/scheduler/status`)).json()
  },

  // ============================================================================
  // CLICK-TO-BET / SPORTSBOOK INTEGRATION
  // ============================================================================

  // Get list of supported sportsbooks with branding
  async getSportsbooks() {
    try {
      const resp = await authFetch(`${API_BASE_URL}/live/sportsbooks`);
      if (!resp.ok) return { sportsbooks: [], active_count: 0 };
      const data = await resp.json();
      // Defensive: ensure expected fields exist
      return {
        sportsbooks: (data.sportsbooks || []).map(book => ({
          id: book.key,
          name: book.name,
          color: book.color,
          logo: book.logo,
          web_url: book.web_url,
          available: true
        })),
        active_count: data.active_count ?? (data.sportsbooks?.length || 0)
      };
    } catch {
      return { sportsbooks: [], active_count: 0 };
    }
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

    // Convert confidence tier string to percentage number
    const confidenceToPercent = (conf) => {
      if (typeof conf === 'number') return conf;
      const map = { 'SMASH': 90, 'HIGH': 80, 'MEDIUM': 70, 'LOW': 60 };
      return map[conf?.toUpperCase()] || 65;
    };

    // Normalize a single pick item from backend to frontend format
    const normalizePick = (item) => ({
      ...item,
      // Convert confidence string to percentage
      confidence: confidenceToPercent(item.confidence) || item.total_score * 10 || 70,
      // Map backend 'line' to frontend 'point'
      point: item.point || item.line,
      // Map backend 'odds' to frontend 'price'
      price: item.price || item.odds || -110,
      // Preserve other fields
      market: item.market,
      team: item.team || item.home_team,
      home_team: item.home_team,
      away_team: item.away_team,
      sport: item.sport || sport.toUpperCase(),
      // Scores for display
      ai_score: item.scoring_breakdown?.ai_models || item.ai_score,
      pillar_score: item.scoring_breakdown?.pillars || item.pillar_score,
      total_score: item.total_score,
      // Props specific
      player_name: item.player_name || item.player,
      side: item.side,
      stat_type: item.stat_type || item.market?.replace('player_', '')
    });

    // Helper to extract array from various response formats
    const extractArray = (source) => {
      if (!source) return [];
      if (Array.isArray(source)) return source;
      if (source.picks && Array.isArray(source.picks)) return source.picks;
      if (source.data && Array.isArray(source.data)) return source.data;
      return [];
    };

    // Handle multiple backend response formats:
    // 1. { props: { picks: [...] }, game_picks: { picks: [...] } } - nested
    // 2. { props: [...], game_picks: [...] } - direct arrays
    // 3. { picks: [...] } - flat array
    // 4. [...] - direct array response
    let propsArray = [];
    let gamePicksArray = [];

    if (Array.isArray(data)) {
      // Direct array response - split by market type
      propsArray = data.filter(p => p.player_name || p.player || p.market?.includes('player'));
      gamePicksArray = data.filter(p => !p.player_name && !p.player && !p.market?.includes('player'));
    } else if (data.props || data.game_picks) {
      // Has props/game_picks keys
      propsArray = extractArray(data.props);
      gamePicksArray = extractArray(data.game_picks);
    } else if (data.picks) {
      // Flat picks array - split by type
      const allPicks = extractArray(data.picks);
      propsArray = allPicks.filter(p => p.player_name || p.player || p.market?.includes('player'));
      gamePicksArray = allPicks.filter(p => !p.player_name && !p.player && !p.market?.includes('player'));
    } else if (data.data) {
      // Legacy data format
      const allPicks = extractArray(data.data);
      propsArray = allPicks.filter(p => p.player_name || p.player || p.market?.includes('player'));
      gamePicksArray = allPicks.filter(p => !p.player_name && !p.player && !p.market?.includes('player'));
    }

    // Normalize all picks
    const normalizedProps = propsArray.map(normalizePick);
    const normalizedGamePicks = gamePicksArray.map(normalizePick);
    const allPicks = [...normalizedProps, ...normalizedGamePicks];

    return {
      sport: data.sport || sport.toUpperCase(),
      source: data.source,
      // All picks combined
      picks: allPicks,
      data: allPicks,
      slate: allPicks,
      // Nested format for components that expect it
      props: { picks: normalizedProps, count: normalizedProps.length },
      game_picks: { picks: normalizedGamePicks, count: normalizedGamePicks.length },
      // Esoteric data
      daily_energy: data.esoteric?.daily_energy || data.daily_energy,
      esoteric: data.esoteric,
      count: allPicks.length,
      timestamp: data.timestamp,
      // v10.34: Database health fields
      database_available: data.database_available ?? false,
      picks_saved: data.picks_saved ?? 0,
      signals_saved: data.signals_saved ?? 0
    };
  },

  // Alias for compatibility
  async getBestBets(sport = 'NBA') {
    return this.getSmashSpots(sport);
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

  // Alias for Props.jsx and Signals.jsx compatibility
  async getLiveProps(sport = 'NBA') {
    return this.getProps(sport);
  },

  // Get live lines for line shopping (BestOdds.jsx, Splits.jsx)
  async getLiveOdds(sport = 'NBA') {
    try {
      const resp = await authFetch(`${API_BASE_URL}/live/lines/${sport.toUpperCase()}`);
      if (!resp.ok) return { games: [], lines: [] };
      return resp.json();
    } catch {
      return { games: [], lines: [] };
    }
  },

  // Get injuries for a sport (InjuryVacuum.jsx)
  async getInjuries(sport = 'NBA') {
    try {
      const resp = await authFetch(`${API_BASE_URL}/live/injuries/${sport.toUpperCase()}`);
      if (!resp.ok) return { injuries: [] };
      return resp.json();
    } catch {
      return { injuries: [] };
    }
  },

  // Get esoteric edge analysis
  async getEsotericEdge() {
    return (await authFetch(`${API_BASE_URL}/live/esoteric-edge`)).json();
  },

  // Get today's energy (with defensive handling)
  async getTodayEnergy() {
    try {
      const res = await apiFetch(`${API_BASE_URL}/esoteric/today-energy`);
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

  // ============================================================================
  // BET TRACKING
  // ============================================================================

  async trackBet(betData) {
    try {
      const res = await apiFetch(`${API_BASE_URL}/live/bets/track`, {
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

  async gradeBet(betId, outcome) {
    try {
      const res = await apiFetch(`${API_BASE_URL}/live/bets/grade/${betId}`, {
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

  async getBetHistory(userId) {
    try {
      const url = userId ? `${API_BASE_URL}/live/bets/history?user_id=${userId}` : `${API_BASE_URL}/live/bets/history`;
      const res = await authFetch(url);
      if (!res.ok) return { bets: [], stats: {} };
      return res.json();
    } catch {
      return { bets: [], stats: {} };
    }
  },

  // ============================================================================
  // PARLAY BUILDER
  // ============================================================================

  async getParlay(userId) {
    try {
      const res = await authFetch(`${API_BASE_URL}/live/parlay/${userId}`);
      if (!res.ok) return { legs: [], combined_odds: null };
      return res.json();
    } catch {
      return { legs: [], combined_odds: null };
    }
  },

  async addParlayLeg(legData) {
    try {
      const res = await apiFetch(`${API_BASE_URL}/live/parlay/add`, {
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

  async calculateParlay(legs, stake) {
    try {
      const res = await apiFetch(`${API_BASE_URL}/live/parlay/calculate`, {
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

  async placeParlay(parlayData) {
    try {
      const res = await apiFetch(`${API_BASE_URL}/live/parlay/place`, {
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

  async clearParlay(userId) {
    try {
      const res = await apiFetch(`${API_BASE_URL}/live/parlay/clear/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  async getParlayHistory(userId) {
    try {
      const url = userId ? `${API_BASE_URL}/live/parlay/history?user_id=${userId}` : `${API_BASE_URL}/live/parlay/history`;
      const res = await authFetch(url);
      if (!res.ok) return { parlays: [], stats: {} };
      return res.json();
    } catch {
      return { parlays: [], stats: {} };
    }
  },

  // ============================================================================
  // USER PREFERENCES
  // ============================================================================

  async getUserPreferences(userId) {
    try {
      const res = await authFetch(`${API_BASE_URL}/live/user/preferences/${userId}`);
      if (!res.ok) return {};
      return res.json();
    } catch {
      return {};
    }
  },

  async setUserPreferences(userId, preferences) {
    try {
      const res = await apiFetch(`${API_BASE_URL}/live/user/preferences/${userId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences)
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  // ============================================================================
  // COMMUNITY VOTING (CommunityVote.jsx)
  // ============================================================================

  async getVotes(gameVoteId) {
    try {
      const res = await authFetch(`${API_BASE_URL}/live/votes/${encodeURIComponent(gameVoteId)}`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  async submitVote(gameVoteId, side) {
    try {
      const res = await apiFetch(`${API_BASE_URL}/live/votes/${encodeURIComponent(gameVoteId)}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ side })
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  // ============================================================================
  // LEADERBOARD (Leaderboard.jsx)
  // ============================================================================

  async getVoteLeaderboard() {
    try {
      const res = await authFetch(`${API_BASE_URL}/live/leaderboard`);
      if (!res.ok) return { leaders: null };
      return res.json();
    } catch {
      return { leaders: null };
    }
  },

  // ============================================================================
  // GRADING (Grading.jsx)
  // ============================================================================

  async getGradedPicks() {
    try {
      const res = await authFetch(`${API_BASE_URL}/live/picks/graded`);
      if (!res.ok) return { picks: [] };
      return res.json();
    } catch {
      return { picks: [] };
    }
  },

  async gradePick(data) {
    try {
      const res = await apiFetch(`${API_BASE_URL}/live/picks/grade`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  // ============================================================================
  // CONSOLIDATED ENDPOINTS (v10.34)
  // Reduces API calls by combining related data
  // ============================================================================

  /**
   * Get consolidated sport dashboard data
   * Combines: best-bets, sharp, splits, today-energy in one call
   */
  async getSportDashboard(sport = 'NBA') {
    try {
      const res = await authFetch(`${API_BASE_URL}/live/sport-dashboard/${sport.toUpperCase()}`);
      if (!res.ok) {
        // Fallback to individual calls if consolidated endpoint not available
        const [bestBets, sharp, energy] = await Promise.all([
          this.getSmashSpots(sport),
          this.getSharpMoney(sport),
          this.getTodayEnergy()
        ]);
        return {
          sport: sport.toUpperCase(),
          picks: bestBets.picks || [],
          props: bestBets.props,
          game_picks: bestBets.game_picks,
          sharp_signals: sharp.signals || [],
          daily_energy: energy,
          database_available: bestBets.database_available ?? false,
          picks_saved: bestBets.picks_saved ?? 0,
          signals_saved: bestBets.signals_saved ?? 0,
          _fallback: true
        };
      }
      const data = await res.json();
      return {
        ...data,
        database_available: data.database_available ?? false,
        picks_saved: data.picks_saved ?? 0,
        signals_saved: data.signals_saved ?? 0
      };
    } catch (err) {
      console.error('getSportDashboard error:', err);
      return {
        sport: sport.toUpperCase(),
        picks: [],
        props: { picks: [], count: 0 },
        game_picks: { picks: [], count: 0 },
        sharp_signals: [],
        daily_energy: { betting_outlook: 'NEUTRAL', overall_energy: 5.0 },
        database_available: false,
        picks_saved: 0,
        signals_saved: 0,
        _error: true
      };
    }
  },

  /**
   * Get detailed game information
   * Combines: game data, odds across books, props, sharp signals
   */
  async getGameDetails(gameId, sport = 'NBA') {
    try {
      const res = await authFetch(`${API_BASE_URL}/live/game-details/${encodeURIComponent(gameId)}?sport=${sport.toUpperCase()}`);
      if (!res.ok) {
        return { game_id: gameId, error: 'Game not found', available: false };
      }
      const data = await res.json();
      return {
        ...data,
        available: true,
        database_available: data.database_available ?? false
      };
    } catch (err) {
      console.error('getGameDetails error:', err);
      return { game_id: gameId, error: err.message, available: false };
    }
  },

  /**
   * Initialize parlay builder with user's current parlay and available picks
   * Combines: current parlay, best available legs, correlation warnings
   */
  async getParlayBuilderInit(userId, sport = 'NBA') {
    try {
      const params = new URLSearchParams({ sport: sport.toUpperCase() });
      if (userId) params.append('user_id', userId);

      const res = await authFetch(`${API_BASE_URL}/live/parlay-builder-init?${params}`);
      if (!res.ok) {
        // Fallback to individual calls
        const [parlay, picks] = await Promise.all([
          userId ? this.getParlay(userId) : Promise.resolve({ legs: [] }),
          this.getSmashSpots(sport)
        ]);
        return {
          current_parlay: parlay,
          suggested_legs: picks.picks?.slice(0, 10) || [],
          correlation_warnings: [],
          database_available: picks.database_available ?? false,
          _fallback: true
        };
      }
      const data = await res.json();
      return {
        ...data,
        database_available: data.database_available ?? false
      };
    } catch (err) {
      console.error('getParlayBuilderInit error:', err);
      return {
        current_parlay: { legs: [] },
        suggested_legs: [],
        correlation_warnings: [],
        database_available: false,
        _error: true
      };
    }
  },

  // ============================================================================
  // DEBUG / DEV TOOLS
  // ============================================================================

  /**
   * Get raw API response for debugging
   */
  async getRawResponse(endpoint, sport = 'NBA') {
    try {
      const url = endpoint.includes('/')
        ? `${API_BASE_URL}${endpoint}`
        : `${API_BASE_URL}/live/${endpoint}/${sport.toUpperCase()}`;
      const res = await authFetch(url);
      const data = await res.json();
      return {
        status: res.status,
        ok: res.ok,
        url: url,
        timestamp: new Date().toISOString(),
        data
      };
    } catch (err) {
      return {
        status: 0,
        ok: false,
        error: err.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Get API health and grader metrics
   */
  async getAPIHealth() {
    try {
      const [health, grader, scheduler] = await Promise.all([
        this.getHealth(),
        this.getGraderWeights().catch(() => null),
        this.getSchedulerStatus().catch(() => null)
      ]);
      return {
        status: health?.status || 'unknown',
        version: health?.version,
        grader: grader,
        scheduler: scheduler,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      return {
        status: 'error',
        error: err.message,
        timestamp: new Date().toISOString()
      };
    }
  }
};

export default api;
