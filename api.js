/**
 * API Module - Re-exports from centralized client
 *
 * ALL requests go through lib/api/client.js which imports config from
 * core/integration_contract.js. DO NOT hardcode URLs here.
 */

import {
  getBaseUrl,
  apiFetch,
  authFetch,
  getAuthHeaders,
  safeJson,
  RateLimitError,
} from './lib/api/client.js';

// Re-export for backwards compatibility
export { RateLimitError };

// API_BASE_URL is now derived from contract (not hardcoded)
const API_BASE_URL = getBaseUrl();

export const api = {
  // Health (public)
  async getHealth() {
    return safeJson(await apiFetch(`${API_BASE_URL}/health`)) || { status: 'offline' };
  },

  async getModelStatus() {
    return safeJson(await apiFetch(`${API_BASE_URL}/model-status`));
  },

  // Live Data (authenticated)
  async getLiveGames(sport = 'NBA') {
    return safeJson(await authFetch(`${API_BASE_URL}/live/games/${sport.toUpperCase()}`)) || [];
  },

  async getRoster(sport, team) {
    return safeJson(await authFetch(`${API_BASE_URL}/live/roster/${sport.toUpperCase()}/${encodeURIComponent(team)}`)) || [];
  },

  async getLiveSlate(sport = 'NBA') {
    return safeJson(await authFetch(`${API_BASE_URL}/live/slate/${sport.toUpperCase()}`)) || [];
  },

  async getPlayerStats(playerName) {
    return safeJson(await authFetch(`${API_BASE_URL}/live/player/${encodeURIComponent(playerName)}`));
  },

  // Predictions (public)
  async predictLive(data) {
    return safeJson(await apiFetch(`${API_BASE_URL}/predict-live`, {
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
    }));
  },

  async predictContext(data) {
    return safeJson(await apiFetch(`${API_BASE_URL}/predict-context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }));
  },

  // LSTM Brain (public)
  async getBrainStatus() {
    return safeJson(await apiFetch(`${API_BASE_URL}/brain/status`));
  },

  // Grader (public)
  async getGraderWeights() {
    return safeJson(await apiFetch(`${API_BASE_URL}/grader/weights`))
  },

  // Esoteric (public)
  async analyzeEsoteric(data) {
    return safeJson(await apiFetch(`${API_BASE_URL}/esoteric/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }));
  },

  // Teams (public)
  async getTeams(sport) {
    return safeJson(await apiFetch(`${API_BASE_URL}/teams/${sport.toUpperCase()}`)) || [];
  },

  async normalizeTeam(teamInput, sport) {
    return safeJson(await apiFetch(`${API_BASE_URL}/teams/normalize?team_input=${encodeURIComponent(teamInput)}&sport=${sport}`));
  },

  // Edge Calculator (public)
  async calculateEdge(probability, odds) {
    return safeJson(await apiFetch(`${API_BASE_URL}/calculate-edge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ your_probability: probability, betting_odds: odds })
    }));
  },

  // Scheduler (public)
  async getSchedulerStatus() {
    return safeJson(await apiFetch(`${API_BASE_URL}/scheduler/status`));
  },

  // ============================================================================
  // CLICK-TO-BET / SPORTSBOOK INTEGRATION
  // ============================================================================

  // Get list of supported sportsbooks with branding
  async getSportsbooks() {
    const data = await safeJson(await authFetch(`${API_BASE_URL}/live/sportsbooks`));
    if (!data) return { sportsbooks: [], active_count: 0 };
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
    const data = await safeJson(resp) || {};

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
    return safeJson(await authFetch(url)) || { games: [] };
  },

  // Get best bets / smash spots for a sport
  async getSmashSpots(sport = 'NBA') {
    const url = `${API_BASE_URL}/live/best-bets/${sport.toUpperCase()}`;
    const resp = await authFetch(url);
    const data = await safeJson(resp);
    if (!data) {
      return {
        sport: sport.toUpperCase(),
        source: 'error',
        picks: [],
        data: [],
        slate: [],
        props: { picks: [], count: 0 },
        game_picks: { picks: [], count: 0 },
        count: 0,
        error: { status: resp.status },
      };
    }

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
      line: item.line ?? item.point,
      line_signed: item.line_signed || item.lineSigned,
      // Map backend 'odds' to frontend 'price'
      price: item.price ?? item.odds ?? item.odds_american ?? null,
      odds_american: item.odds_american ?? item.odds ?? item.price,
      // Preserve other fields
      market: item.market,
      market_label: item.market_label || item.marketLabel,
      side_label: item.side_label || item.sideLabel,
      pick_type: item.pick_type || item.pickType,
      bet_string: item.bet_string || item.betString,
      recommended_units: item.recommended_units ?? item.units,
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
      stat_type: item.stat_type || item.market?.replace('player_', ''),
      selection: item.selection || item.side || item.team || item.player_name || item.player || ''
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
    return safeJson(await authFetch(`${API_BASE_URL}/live/sharp/${sport.toUpperCase()}`)) || { alerts: [] };
  },

  // Get betting splits
  async getSplits(sport = 'NBA') {
    return safeJson(await authFetch(`${API_BASE_URL}/live/splits/${sport.toUpperCase()}`)) || { games: [] };
  },

  // Get player props
  async getProps(sport = 'NBA') {
    return safeJson(await authFetch(`${API_BASE_URL}/live/props/${sport.toUpperCase()}`)) || { props: [] };
  },

  // Alias for Props.jsx and Signals.jsx compatibility
  async getLiveProps(sport = 'NBA') {
    return this.getProps(sport);
  },

  // Get live lines for line shopping (BestOdds.jsx, Splits.jsx)
  async getLiveOdds(sport = 'NBA') {
    const data = await safeJson(await authFetch(`${API_BASE_URL}/live/lines/${sport.toUpperCase()}`));
    return data || { games: [], lines: [] };
  },

  // Get injuries for a sport (InjuryVacuum.jsx)
  async getInjuries(sport = 'NBA') {
    const data = await safeJson(await authFetch(`${API_BASE_URL}/live/injuries/${sport.toUpperCase()}`));
    return data || { injuries: [] };
  },

  // Get esoteric edge analysis
  async getEsotericEdge() {
    return safeJson(await authFetch(`${API_BASE_URL}/live/esoteric-edge`)) || {};
  },

  // Get today's energy (with defensive handling)
  async getTodayEnergy() {
    const data = await safeJson(await apiFetch(`${API_BASE_URL}/esoteric/today-energy`));
    return {
      betting_outlook: data?.betting_outlook || 'NEUTRAL',
      overall_energy: data?.overall_energy ?? 5.0,
      ...data
    };
  },

  // ============================================================================
  // BET TRACKING
  // ============================================================================

  async trackBet(betData) {
    const res = await apiFetch(`${API_BASE_URL}/live/bets/track`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(betData)
    });
    return safeJson(res);
  },

  async gradeBet(betId, outcome) {
    const res = await apiFetch(`${API_BASE_URL}/live/bets/grade/${betId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ outcome })
    });
    return safeJson(res);
  },

  async getBetHistory(userId) {
    const url = userId ? `${API_BASE_URL}/live/bets/history?user_id=${userId}` : `${API_BASE_URL}/live/bets/history`;
    return safeJson(await authFetch(url)) || { bets: [], stats: {} };
  },

  // ============================================================================
  // PARLAY BUILDER
  // ============================================================================

  async getParlay(userId) {
    return safeJson(await authFetch(`${API_BASE_URL}/live/parlay/${userId}`)) || { legs: [], combined_odds: null };
  },

  async addParlayLeg(legData) {
    const res = await apiFetch(`${API_BASE_URL}/live/parlay/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(legData)
    });
    return safeJson(res);
  },

  async calculateParlay(legs, stake) {
    const res = await apiFetch(`${API_BASE_URL}/live/parlay/calculate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ legs, stake })
    });
    return safeJson(res);
  },

  async placeParlay(parlayData) {
    const res = await apiFetch(`${API_BASE_URL}/live/parlay/place`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(parlayData)
    });
    return safeJson(res);
  },

  async clearParlay(userId) {
    const res = await apiFetch(`${API_BASE_URL}/live/parlay/clear/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return safeJson(res);
  },

  async getParlayHistory(userId) {
    const url = userId ? `${API_BASE_URL}/live/parlay/history?user_id=${userId}` : `${API_BASE_URL}/live/parlay/history`;
    return safeJson(await authFetch(url)) || { parlays: [], stats: {} };
  },

  // ============================================================================
  // USER PREFERENCES
  // ============================================================================

  async getUserPreferences(userId) {
    return safeJson(await authFetch(`${API_BASE_URL}/live/user/preferences/${userId}`)) || {};
  },

  async setUserPreferences(userId, preferences) {
    const res = await apiFetch(`${API_BASE_URL}/live/user/preferences/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences)
    });
    return safeJson(res);
  },

  // ============================================================================
  // COMMUNITY VOTING (CommunityVote.jsx)
  // ============================================================================

  async getVotes(gameVoteId) {
    return safeJson(await authFetch(`${API_BASE_URL}/live/votes/${encodeURIComponent(gameVoteId)}`));
  },

  async submitVote(gameVoteId, side) {
    const res = await apiFetch(`${API_BASE_URL}/live/votes/${encodeURIComponent(gameVoteId)}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ side })
    });
    return safeJson(res);
  },

  // ============================================================================
  // LEADERBOARD (Leaderboard.jsx)
  // ============================================================================

  async getVoteLeaderboard() {
    return safeJson(await authFetch(`${API_BASE_URL}/live/leaderboard`)) || { leaders: null };
  },

  // ============================================================================
  // GRADING (Grading.jsx)
  // ============================================================================

  async getGradedPicks() {
    return safeJson(await authFetch(`${API_BASE_URL}/live/picks/graded`)) || { picks: [] };
  },

  async gradePick(data) {
    const res = await apiFetch(`${API_BASE_URL}/live/picks/grade`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return safeJson(res);
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
    const res = await authFetch(`${API_BASE_URL}/live/sport-dashboard/${sport.toUpperCase()}`);
    const data = await safeJson(res);
    if (!data) {
      // Fallback to individual calls if consolidated endpoint not available
      const [bestBets, sharp, energy] = await Promise.all([
        this.getSmashSpots(sport),
        this.getSharpMoney(sport),
        this.getTodayEnergy()
      ]);
      return {
        sport: sport.toUpperCase(),
        picks: bestBets?.picks || [],
        props: bestBets?.props,
        game_picks: bestBets?.game_picks,
        sharp_signals: sharp?.signals || [],
        daily_energy: energy,
        database_available: bestBets?.database_available ?? false,
        picks_saved: bestBets?.picks_saved ?? 0,
        signals_saved: bestBets?.signals_saved ?? 0,
        _fallback: true
      };
    }
    return {
      ...data,
      database_available: data.database_available ?? false,
      picks_saved: data.picks_saved ?? 0,
      signals_saved: data.signals_saved ?? 0
    };
  },

  /**
   * Get detailed game information
   * Combines: game data, odds across books, props, sharp signals
   */
  async getGameDetails(gameId, sport = 'NBA') {
    const res = await authFetch(`${API_BASE_URL}/live/game-details/${encodeURIComponent(gameId)}?sport=${sport.toUpperCase()}`);
    const data = await safeJson(res);
    if (!data) {
      return { game_id: gameId, error: 'Game not found', available: false };
    }
    return {
      ...data,
      available: true,
      database_available: data.database_available ?? false
    };
  },

  /**
   * Initialize parlay builder with user's current parlay and available picks
   * Combines: current parlay, best available legs, correlation warnings
   */
  async getParlayBuilderInit(userId, sport = 'NBA') {
    const params = new URLSearchParams({ sport: sport.toUpperCase() });
    if (userId) params.append('user_id', userId);

    const data = await safeJson(await authFetch(`${API_BASE_URL}/live/parlay-builder-init?${params}`));
    if (!data) {
      // Fallback to individual calls
      const [parlay, picks] = await Promise.all([
        userId ? this.getParlay(userId) : Promise.resolve({ legs: [] }),
        this.getSmashSpots(sport)
      ]);
      return {
        current_parlay: parlay,
        suggested_legs: picks?.picks?.slice(0, 10) || [],
        correlation_warnings: [],
        database_available: picks?.database_available ?? false,
        _fallback: true
      };
    }
    return {
      ...data,
      database_available: data.database_available ?? false
    };
  },

  // ============================================================================
  // LIVE BETTING (In-Play) - Games currently in progress
  // ============================================================================

  /**
   * Get live betting picks for games currently in progress
   * Only returns picks with final_score >= 6.5
   */
  async getLiveInPlay(sport = 'NBA') {
    return safeJson(await authFetch(`${API_BASE_URL}/live/live/in-play/${sport.toUpperCase()}`)) || { sport: sport.toUpperCase(), type: 'LIVE_BETS', picks: [] };
  },

  /**
   * Get in-game betting data (alternate endpoint)
   */
  async getInGame(sport = 'NBA') {
    return safeJson(await authFetch(`${API_BASE_URL}/live/in-game/${sport.toUpperCase()}`)) || { sport: sport.toUpperCase(), picks: [] };
  },

  // ============================================================================
  // GRADER & SCHEDULER STATUS (v12.0)
  // ============================================================================

  /**
   * Get autograder status and metrics
   */
  async getGraderStatus() {
    return safeJson(await authFetch(`${API_BASE_URL}/live/grader/status`)) || { status: 'unavailable', last_run: null };
  },

  /**
   * Get scheduler status for background jobs
   */
  async getLiveSchedulerStatus() {
    return safeJson(await authFetch(`${API_BASE_URL}/live/scheduler/status`)) || { status: 'unavailable', jobs: [] };
  },

  // ============================================================================
  // DEBUG / DEV TOOLS
  // ============================================================================

  /**
   * Get raw API response for debugging
   */
  async getRawResponse(endpoint, sport = 'NBA') {
    const url = endpoint.includes('/')
      ? `${API_BASE_URL}${endpoint}`
      : `${API_BASE_URL}/live/${endpoint}/${sport.toUpperCase()}`;
    const res = await authFetch(url);
    const data = await safeJson(res);
    return {
      status: res.status,
      ok: res.ok,
      url: url,
      timestamp: new Date().toISOString(),
      data
    };
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
