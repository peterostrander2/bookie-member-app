import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '../api.js'

const API_BASE_URL = 'https://web-production-7b2a.up.railway.app'

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Health endpoints', () => {
    it('getHealth fetches from correct endpoint', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ status: 'healthy' })
      })

      const result = await api.getHealth()

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/health`, {})
      expect(result).toEqual({ status: 'healthy' })
    })

    it('getModelStatus fetches from correct endpoint', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ models: ['LSTM', 'Ensemble'] })
      })

      const result = await api.getModelStatus()

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/model-status`, {})
      expect(result).toEqual({ models: ['LSTM', 'Ensemble'] })
    })
  })

  describe('Live Data endpoints (authenticated)', () => {
    it('getLiveGames includes auth header and uppercases sport', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ games: [] })
      })

      await api.getLiveGames('nba')

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/live/games/NBA`,
        { headers: { 'X-API-Key': 'test-api-key' } }
      )
    })

    it('getSmashSpots returns formatted data', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          sport: 'NBA',
          data: [{ pick: 'Lakers -5' }],
          count: 1
        })
      })

      const result = await api.getSmashSpots('NBA')

      // Verify essential fields
      expect(result.sport).toBe('NBA')
      expect(result.slate).toEqual([{ pick: 'Lakers -5' }])
      expect(result.picks).toEqual([{ pick: 'Lakers -5' }])
      expect(result.count).toBe(1)
    })

    it('getBestBets is an alias for getSmashSpots', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ sport: 'NBA', data: [] })
      })

      const result = await api.getBestBets('NBA')

      expect(result.sport).toBe('NBA')
    })

    it('getSharpMoney fetches with auth', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ sharp_plays: [] })
      })

      await api.getSharpMoney('NFL')

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/live/sharp/NFL`,
        { headers: { 'X-API-Key': 'test-api-key' } }
      )
    })

    it('getSplits fetches with auth', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ splits: [] })
      })

      await api.getSplits('MLB')

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/live/splits/MLB`,
        { headers: { 'X-API-Key': 'test-api-key' } }
      )
    })

    it('getProps fetches with auth', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ props: [] })
      })

      await api.getProps('NHL')

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/live/props/NHL`,
        { headers: { 'X-API-Key': 'test-api-key' } }
      )
    })
  })

  describe('Defensive handling', () => {
    it('getTodayEnergy returns defaults on error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await api.getTodayEnergy()

      expect(result).toEqual({
        betting_outlook: 'NEUTRAL',
        overall_energy: 5.0
      })
    })

    it('getTodayEnergy returns defaults on non-ok response', async () => {
      fetch.mockResolvedValueOnce({ ok: false })

      const result = await api.getTodayEnergy()

      expect(result).toEqual({
        betting_outlook: 'NEUTRAL',
        overall_energy: 5.0
      })
    })

    it('getTodayEnergy fills missing fields with defaults', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ moon_phase: 'Full' })
      })

      const result = await api.getTodayEnergy()

      expect(result.betting_outlook).toBe('NEUTRAL')
      expect(result.overall_energy).toBe(5.0)
      expect(result.moon_phase).toBe('Full')
    })

    it('getSportsbooks returns empty array on error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await api.getSportsbooks()

      expect(result).toEqual({ sportsbooks: [], active_count: 0 })
    })

    it('getSportsbooks returns empty array on non-ok response', async () => {
      fetch.mockResolvedValueOnce({ ok: false })

      const result = await api.getSportsbooks()

      expect(result).toEqual({ sportsbooks: [], active_count: 0 })
    })

    it('getSportsbooks transforms response correctly', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          sportsbooks: [
            { key: 'dk', name: 'DraftKings', color: '#53D337', logo: 'dk.png', web_url: 'https://dk.com' }
          ],
          active_count: 1
        })
      })

      const result = await api.getSportsbooks()

      expect(result.sportsbooks).toHaveLength(1)
      expect(result.sportsbooks[0]).toEqual({
        id: 'dk',
        name: 'DraftKings',
        color: '#53D337',
        logo: 'dk.png',
        web_url: 'https://dk.com',
        available: true
      })
      expect(result.active_count).toBe(1)
    })
  })

  describe('Bet Tracking endpoints', () => {
    it('trackBet sends POST with auth headers', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'bet123', status: 'tracked' })
      })

      const betData = {
        player: 'LeBron James',
        bet_type: 'points',
        side: 'Over',
        line: 25.5,
        odds: -110
      }

      const result = await api.trackBet(betData)

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/live/bets/track`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key'
          },
          body: JSON.stringify(betData)
        }
      )
      expect(result.id).toBe('bet123')
    })

    it('trackBet returns null on error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await api.trackBet({})

      expect(result).toBeNull()
    })

    it('gradeBet sends POST with outcome', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'bet123', outcome: 'WIN' })
      })

      const result = await api.gradeBet('bet123', 'WIN')

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/live/bets/grade/bet123`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key'
          },
          body: JSON.stringify({ outcome: 'WIN' })
        }
      )
      expect(result.outcome).toBe('WIN')
    })

    it('gradeBet returns null on error', async () => {
      fetch.mockResolvedValueOnce({ ok: false })

      const result = await api.gradeBet('bet123', 'WIN')

      expect(result).toBeNull()
    })

    it('getBetHistory returns empty on error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await api.getBetHistory()

      expect(result).toEqual({ bets: [], stats: {} })
    })

    it('getBetHistory includes userId in query if provided', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ bets: [], stats: {} })
      })

      await api.getBetHistory('user123')

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/live/bets/history?user_id=user123`,
        { headers: { 'X-API-Key': 'test-api-key' } }
      )
    })
  })

  describe('Parlay Builder endpoints', () => {
    it('getParlay fetches user parlay', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ legs: [{ player: 'LeBron' }], combined_odds: 300 })
      })

      const result = await api.getParlay('user123')

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/live/parlay/user123`,
        { headers: { 'X-API-Key': 'test-api-key' } }
      )
      expect(result.legs).toHaveLength(1)
    })

    it('getParlay returns defaults on error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await api.getParlay('user123')

      expect(result).toEqual({ legs: [], combined_odds: null })
    })

    it('addParlayLeg sends POST request', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ legs: [{ player: 'LeBron' }] })
      })

      const legData = { user_id: 'user123', player: 'LeBron', odds: -110 }
      await api.addParlayLeg(legData)

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/live/parlay/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key'
          },
          body: JSON.stringify(legData)
        }
      )
    })

    it('calculateParlay sends legs and stake', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ combined_odds: 500, potential_payout: 600 })
      })

      const legs = [{ odds: -110 }, { odds: +150 }]
      const result = await api.calculateParlay(legs, 100)

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/live/parlay/calculate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key'
          },
          body: JSON.stringify({ legs, stake: 100 })
        }
      )
      expect(result.combined_odds).toBe(500)
    })

    it('placeParlay sends parlay data', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'parlay123', status: 'placed' })
      })

      const parlayData = { user_id: 'user123', legs: [], stake: 100 }
      const result = await api.placeParlay(parlayData)

      expect(result.id).toBe('parlay123')
    })

    it('clearParlay sends DELETE request', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      await api.clearParlay('user123')

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/live/parlay/clear/user123`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key'
          }
        }
      )
    })

    it('getParlayHistory returns defaults on error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await api.getParlayHistory('user123')

      expect(result).toEqual({ parlays: [], stats: {} })
    })
  })

  describe('User Preferences endpoints', () => {
    it('getUserPreferences fetches user prefs', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ theme: 'dark', favorite_sport: 'NBA' })
      })

      const result = await api.getUserPreferences('user123')

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/live/user/preferences/user123`,
        { headers: { 'X-API-Key': 'test-api-key' } }
      )
      expect(result.theme).toBe('dark')
    })

    it('getUserPreferences returns empty object on error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await api.getUserPreferences('user123')

      expect(result).toEqual({})
    })

    it('setUserPreferences sends POST request', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      const prefs = { theme: 'light', favorite_sport: 'NFL' }
      await api.setUserPreferences('user123', prefs)

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/live/user/preferences/user123`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key'
          },
          body: JSON.stringify(prefs)
        }
      )
    })
  })

  describe('Click-to-Bet endpoints', () => {
    it('generateBetslip transforms response correctly', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          game: 'Lakers vs Celtics',
          bet_type: 'spread',
          selection: 'Lakers',
          best_odds: -105,
          all_books: [
            {
              book_key: 'dk',
              book_name: 'DraftKings',
              book_color: '#53D337',
              book_logo: 'dk.png',
              odds: -110,
              point: -5.5,
              deep_link: { web: 'https://dk.com/bet' }
            }
          ]
        })
      })

      const result = await api.generateBetslip({
        game_id: 'game123',
        bet_type: 'spread',
        team: 'Lakers',
        sport: 'NBA'
      })

      expect(result.game).toBe('Lakers vs Celtics')
      expect(result.sportsbooks).toHaveLength(1)
      expect(result.sportsbooks[0].id).toBe('dk')
      expect(result.sportsbooks[0].link).toBe('https://dk.com/bet')
    })

    it('getLineShop includes gameId if provided', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ lines: [] })
      })

      await api.getLineShop('NBA', 'game123')

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/live/line-shop/NBA?game_id=game123`,
        { headers: { 'X-API-Key': 'test-api-key' } }
      )
    })
  })
})
