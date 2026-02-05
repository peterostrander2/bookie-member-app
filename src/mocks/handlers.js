/**
 * MSW Request Handlers
 * Mock API responses for testing and development
 */

import { http, HttpResponse } from 'msw';

const API_URL = 'https://web-production-7b2a.up.railway.app';

// Sample mock data
const mockPicks = {
  game_picks: {
    picks: [
      {
        id: 'pick1',
        sport: 'NBA',
        home_team: 'Lakers',
        away_team: 'Celtics',
        market: 'spreads',
        team: 'Lakers',
        side: 'Lakers',
        point: -5.5,
        price: -110,
        confidence: 87,
        ai_score: 6.5,
        pillar_score: 7.2,
        total_score: 15.7,
        edge: 0.045,
        bookmaker: 'DraftKings',
        jarvis_boost: 2
      },
      {
        id: 'pick2',
        sport: 'NBA',
        home_team: 'Warriors',
        away_team: 'Suns',
        market: 'totals',
        side: 'Over',
        point: 224.5,
        price: -105,
        confidence: 78,
        ai_score: 5.8,
        pillar_score: 6.5,
        total_score: 13.3,
        edge: 0.032,
        bookmaker: 'FanDuel',
        jarvis_boost: 0
      },
      {
        id: 'pick3',
        sport: 'NBA',
        home_team: 'Bucks',
        away_team: 'Heat',
        market: 'h2h',
        team: 'Bucks',
        side: 'Bucks',
        price: -150,
        confidence: 72,
        ai_score: 5.2,
        pillar_score: 5.8,
        total_score: 12.0,
        edge: 0.025,
        bookmaker: 'BetMGM',
        jarvis_boost: 0
      }
    ]
  },
  props: {
    picks: [
      {
        id: 'prop1',
        sport: 'NBA',
        home_team: 'Lakers',
        away_team: 'Celtics',
        player_name: 'LeBron James',
        market: 'player_points',
        side: 'Over',
        point: 25.5,
        price: -115,
        confidence: 82,
        ai_score: 6.2,
        pillar_score: 6.8,
        total_score: 14.0,
        edge: 0.038,
        bookmaker: 'DraftKings',
        jarvis_boost: 1
      },
      {
        id: 'prop2',
        sport: 'NBA',
        home_team: 'Warriors',
        away_team: 'Suns',
        player_name: 'Stephen Curry',
        market: 'player_threes',
        side: 'Over',
        point: 4.5,
        price: -110,
        confidence: 76,
        ai_score: 5.5,
        pillar_score: 6.0,
        total_score: 12.5,
        edge: 0.028,
        bookmaker: 'FanDuel',
        jarvis_boost: 0
      }
    ]
  },
  daily_energy: {
    flow: 'YANG',
    theme: 'Expansion Day',
    outlook: 'BULLISH'
  }
};

const mockSharpData = {
  data: [
    {
      game_id: 'game1',
      home_team: 'Lakers',
      away_team: 'Celtics',
      sharp_side: 'Lakers',
      sharp_percentage: 68,
      line_movement: -1.5,
      steam_detected: true,
      timestamp: new Date().toISOString()
    }
  ]
};

const mockSplitsData = {
  data: [
    {
      game_id: 'game1',
      home_team: 'Lakers',
      away_team: 'Celtics',
      public_spread_home: 65,
      public_spread_away: 35,
      public_ml_home: 72,
      public_ml_away: 28,
      money_spread_home: 45,
      money_spread_away: 55
    }
  ]
};

const mockTodayEnergy = {
  date: new Date().toISOString().split('T')[0],
  betting_outlook: 'BULLISH',
  overall_energy: 7.8,
  moon_phase: 'waxing_gibbous',
  moon_emoji: '🌔',
  life_path: 8,
  planetary_ruler: 'Jupiter',
  day_energy: 'expansion',
  natural_bias: 'underdogs',
  tesla_number: 6,
  tesla_alignment: 'STRONG',
  recommendation: 'Tesla alignment active. Trust underdogs today.',
  lucky_numbers: [6, 8, 15, 23],
  jarvis_day: true,
  power_numbers_active: ['Tesla 6'],
  void_of_course: {
    is_void: true,
    void_start: '2026-02-04T14:30:00Z',
    void_end: '2026-02-04T18:45:00Z',
    warning: 'Avoid initiating new bets during void-of-course moon'
  },
  void_moon_periods: [
    { start: '2026-02-04T14:30:00Z', end: '2026-02-04T18:45:00Z' }
  ],
  schumann_reading: {
    frequency_hz: 7.95,
    status: 'ELEVATED',
    betting_impact: 'Heightened intuition'
  }
};

const mockSportsbooks = [
  { id: 'draftkings', name: 'DraftKings', available: true },
  { id: 'fanduel', name: 'FanDuel', available: true },
  { id: 'betmgm', name: 'BetMGM', available: true },
  { id: 'caesars', name: 'Caesars', available: true },
  { id: 'pointsbet', name: 'PointsBet', available: true },
  { id: 'williamhill', name: 'William Hill', available: true },
  { id: 'barstool', name: 'Barstool', available: false },
  { id: 'betrivers', name: 'BetRivers', available: true }
];

const mockBetHistory = {
  bets: [
    {
      id: 'bet1',
      sport: 'NBA',
      home_team: 'Lakers',
      away_team: 'Celtics',
      bet_type: 'spread',
      side: 'Lakers -5.5',
      odds: -110,
      stake: 100,
      result: 'WIN',
      payout: 190.91,
      placed_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'bet2',
      sport: 'NBA',
      home_team: 'Warriors',
      away_team: 'Suns',
      bet_type: 'total',
      side: 'Over 224.5',
      odds: -105,
      stake: 50,
      result: 'LOSS',
      payout: 0,
      placed_at: new Date(Date.now() - 172800000).toISOString()
    }
  ],
  stats: {
    total_bets: 25,
    wins: 15,
    losses: 9,
    pushes: 1,
    win_rate: 0.625,
    total_staked: 2500,
    total_profit: 425,
    roi: 0.17
  }
};

const mockLeaderboard = {
  rankings: [
    { rank: 1, user_id: 'user1', username: 'SharpShooter', win_rate: 0.72, profit: 1250, streak: 5 },
    { rank: 2, user_id: 'user2', username: 'BetKing', win_rate: 0.68, profit: 980, streak: 3 },
    { rank: 3, user_id: 'user3', username: 'MoneyMaker', win_rate: 0.65, profit: 750, streak: 2 },
    { rank: 4, user_id: 'user4', username: 'PropMaster', win_rate: 0.63, profit: 620, streak: 0 },
    { rank: 5, user_id: 'user5', username: 'EdgeFinder', win_rate: 0.61, profit: 540, streak: 1 }
  ]
};

export const handlers = [
  // Health check
  http.get(`${API_URL}/health`, () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  }),

  // Best bets endpoint
  http.get(`${API_URL}/live/best-bets/:sport`, ({ params }) => {
    const { sport } = params;
    return HttpResponse.json({
      ...mockPicks,
      sport: sport.toUpperCase(),
      timestamp: new Date().toISOString()
    });
  }),

  // Sharp money signals
  http.get(`${API_URL}/live/sharp/:sport`, ({ params }) => {
    return HttpResponse.json({
      ...mockSharpData,
      sport: params.sport.toUpperCase()
    });
  }),

  // Betting splits
  http.get(`${API_URL}/live/splits/:sport`, ({ params }) => {
    return HttpResponse.json({
      ...mockSplitsData,
      sport: params.sport.toUpperCase()
    });
  }),

  // Player props
  http.get(`${API_URL}/live/props/:sport`, ({ params }) => {
    return HttpResponse.json({
      data: mockPicks.props.picks,
      sport: params.sport.toUpperCase()
    });
  }),

  // Today's energy
  http.get(`${API_URL}/esoteric/today-energy`, () => {
    return HttpResponse.json(mockTodayEnergy);
  }),

  // Esoteric edge
  http.get(`${API_URL}/live/esoteric-edge`, () => {
    return HttpResponse.json({
      timestamp: new Date().toISOString(),
      daily_energy: mockTodayEnergy,
      game_signals: [],
      prop_signals: [],
      parlay_warnings: []
    });
  }),

  // Sportsbooks
  http.get(`${API_URL}/live/sportsbooks`, () => {
    return HttpResponse.json({ sportsbooks: mockSportsbooks });
  }),

  // Line shopping
  http.get(`${API_URL}/live/line-shop/:sport`, ({ params }) => {
    return HttpResponse.json({
      sport: params.sport.toUpperCase(),
      games: [],
      timestamp: new Date().toISOString()
    });
  }),

  // Bet tracking
  http.post(`${API_URL}/live/bets/track`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      bet_id: `bet_${Date.now()}`,
      ...body
    });
  }),

  // Bet history
  http.get(`${API_URL}/live/bets/history`, () => {
    return HttpResponse.json(mockBetHistory);
  }),

  // Grade bet
  http.post(`${API_URL}/live/bets/grade/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      bet_id: params.id,
      result: body.result
    });
  }),

  // Parlay endpoints
  http.get(`${API_URL}/live/parlay/:userId`, ({ params }) => {
    return HttpResponse.json({
      user_id: params.userId,
      legs: [],
      total_odds: null
    });
  }),

  http.post(`${API_URL}/live/parlay/add`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      leg_id: `leg_${Date.now()}`,
      ...body
    });
  }),

  http.post(`${API_URL}/live/parlay/calculate`, async ({ request }) => {
    const body = await request.json();
    const legs = body.legs || [];
    // Simple parlay calculation
    let multiplier = 1;
    legs.forEach(leg => {
      const odds = leg.odds || -110;
      const decimal = odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
      multiplier *= decimal;
    });
    const americanOdds = multiplier >= 2
      ? Math.round((multiplier - 1) * 100)
      : Math.round(-100 / (multiplier - 1));

    return HttpResponse.json({
      legs: legs.length,
      total_odds: americanOdds,
      decimal_odds: multiplier.toFixed(2),
      potential_payout: (100 * multiplier).toFixed(2)
    });
  }),

  http.post(`${API_URL}/live/parlay/place`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      parlay_id: `parlay_${Date.now()}`,
      ...body
    });
  }),

  http.delete(`${API_URL}/live/parlay/clear/:userId`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      user_id: params.userId
    });
  }),

  http.get(`${API_URL}/live/parlay/history`, () => {
    return HttpResponse.json({
      parlays: [],
      stats: { total: 0, wins: 0, losses: 0 }
    });
  }),

  // User preferences
  http.get(`${API_URL}/live/user/preferences/:userId`, ({ params }) => {
    return HttpResponse.json({
      user_id: params.userId,
      favorite_sport: 'NBA',
      default_stake: 100,
      notifications_enabled: true
    });
  }),

  http.post(`${API_URL}/live/user/preferences/:userId`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      user_id: params.userId,
      ...body
    });
  }),

  // Leaderboard
  http.get(`${API_URL}/live/leaderboard`, () => {
    return HttpResponse.json(mockLeaderboard);
  }),

  // Betslip generate (deep links)
  http.post(`${API_URL}/live/betslip/generate`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      deep_links: {
        draftkings: 'https://sportsbook.draftkings.com',
        fanduel: 'https://sportsbook.fanduel.com',
        betmgm: 'https://sports.betmgm.com'
      }
    });
  })
];

export default handlers;
