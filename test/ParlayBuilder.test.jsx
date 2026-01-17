import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '../Toast.jsx'
import { BetSlipProvider } from '../BetSlip.jsx'

// Use vi.hoisted to define mocks before vi.mock is processed
const {
  mockGetParlay,
  mockAddParlayLeg,
  mockCalculateParlay,
  mockPlaceParlay,
  mockClearParlay,
  mockGetParlayHistory
} = vi.hoisted(() => ({
  mockGetParlay: vi.fn(),
  mockAddParlayLeg: vi.fn(),
  mockCalculateParlay: vi.fn(),
  mockPlaceParlay: vi.fn(),
  mockClearParlay: vi.fn(),
  mockGetParlayHistory: vi.fn()
}))

// Mock the api module
vi.mock('../api.js', () => ({
  api: {
    getParlay: mockGetParlay,
    addParlayLeg: mockAddParlayLeg,
    calculateParlay: mockCalculateParlay,
    placeParlay: mockPlaceParlay,
    clearParlay: mockClearParlay,
    getParlayHistory: mockGetParlayHistory
  },
  default: {
    getParlay: mockGetParlay,
    addParlayLeg: mockAddParlayLeg,
    calculateParlay: mockCalculateParlay,
    placeParlay: mockPlaceParlay,
    clearParlay: mockClearParlay,
    getParlayHistory: mockGetParlayHistory
  }
}))

// Import after mock is set up
import ParlayBuilder from '../ParlayBuilder.jsx'

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <BetSlipProvider>
          {component}
        </BetSlipProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

describe('ParlayBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetParlay.mockResolvedValue({ legs: [], combined_odds: null })
    mockCalculateParlay.mockResolvedValue(null)
    mockGetParlayHistory.mockResolvedValue({ parlays: [], stats: {} })
  })

  it('renders the parlay builder page', async () => {
    renderWithProviders(<ParlayBuilder />)

    expect(screen.getByText('Parlay Builder')).toBeInTheDocument()
    expect(screen.getByText('Builder')).toBeInTheDocument()
    expect(screen.getByText('History')).toBeInTheDocument()
  })

  it('shows empty state when no legs', async () => {
    renderWithProviders(<ParlayBuilder />)

    await waitFor(() => {
      expect(screen.getByText('Add legs from SMASH Spots or use the form below')).toBeInTheDocument()
    })
  })

  it('displays existing legs from API', async () => {
    mockGetParlay.mockResolvedValue({
      legs: [
        { id: 1, player: 'LeBron James', bet_type: 'points', side: 'Over', line: 25.5, odds: -110 }
      ],
      combined_odds: null
    })

    renderWithProviders(<ParlayBuilder />)

    await waitFor(() => {
      expect(screen.getByText('LeBron James')).toBeInTheDocument()
    })
  })

  it('shows parlay calculator with 2+ legs', async () => {
    mockGetParlay.mockResolvedValue({
      legs: [
        { id: 1, player: 'Player 1', odds: -110 },
        { id: 2, player: 'Player 2', odds: -110 }
      ],
      combined_odds: 264
    })
    mockCalculateParlay.mockResolvedValue({
      combined_odds: 264,
      decimal_odds: '3.64',
      potential_payout: '364.00',
      potential_profit: '264.00'
    })

    renderWithProviders(<ParlayBuilder />)

    await waitFor(() => {
      expect(screen.getByText('2-LEG PARLAY')).toBeInTheDocument()
    })
  })

  it('disables place button with less than 2 legs', async () => {
    mockGetParlay.mockResolvedValue({
      legs: [{ id: 1, player: 'Player 1', odds: -110 }],
      combined_odds: null
    })

    renderWithProviders(<ParlayBuilder />)

    await waitFor(() => {
      const placeButton = screen.getByText('Add 2+ Legs')
      expect(placeButton).toBeDisabled()
    })
  })

  it('enables place button with 2+ legs', async () => {
    mockGetParlay.mockResolvedValue({
      legs: [
        { id: 1, player: 'Player 1', odds: -110 },
        { id: 2, player: 'Player 2', odds: -110 }
      ],
      combined_odds: 264
    })
    mockCalculateParlay.mockResolvedValue({
      combined_odds: 264
    })

    renderWithProviders(<ParlayBuilder />)

    await waitFor(() => {
      const placeButton = screen.getByText('Place & Track Parlay')
      expect(placeButton).not.toBeDisabled()
    })
  })

  it('clears all legs when Clear All clicked', async () => {
    mockGetParlay.mockResolvedValue({
      legs: [
        { id: 1, player: 'Player 1', odds: -110 },
        { id: 2, player: 'Player 2', odds: -110 }
      ],
      combined_odds: 264
    })
    mockClearParlay.mockResolvedValue({ success: true })

    renderWithProviders(<ParlayBuilder />)

    await waitFor(() => {
      expect(screen.getByText('Player 1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Clear All'))

    await waitFor(() => {
      expect(mockClearParlay).toHaveBeenCalled()
    })
  })

  it('updates stake with quick stake buttons', async () => {
    mockGetParlay.mockResolvedValue({ legs: [], combined_odds: null })

    renderWithProviders(<ParlayBuilder />)

    await waitFor(() => {
      expect(screen.getByText('$25')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('$250'))

    const stakeInput = screen.getByRole('spinbutton')
    expect(stakeInput.value).toBe('250')
  })

  it('places parlay when place button clicked', async () => {
    mockGetParlay.mockResolvedValue({
      legs: [
        { id: 1, player: 'Player 1', odds: -110 },
        { id: 2, player: 'Player 2', odds: -110 }
      ],
      combined_odds: 264
    })
    mockCalculateParlay.mockResolvedValue({ combined_odds: 264 })
    mockPlaceParlay.mockResolvedValue({ id: 'parlay123', status: 'placed' })

    renderWithProviders(<ParlayBuilder />)

    await waitFor(() => {
      expect(screen.getByText('Place & Track Parlay')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Place & Track Parlay'))

    await waitFor(() => {
      expect(mockPlaceParlay).toHaveBeenCalled()
    })
  })

  it('expands add leg form when clicked', async () => {
    renderWithProviders(<ParlayBuilder />)

    await waitFor(() => {
      expect(screen.getByText('Add Leg Manually')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Add Leg Manually'))

    await waitFor(() => {
      expect(screen.getByText('PLAYER')).toBeInTheDocument()
      expect(screen.getByText('TEAM')).toBeInTheDocument()
    })
  })

  it('switches to history tab', async () => {
    mockGetParlayHistory.mockResolvedValue({
      parlays: [],
      stats: { total: 0, wins: 0 }
    })

    renderWithProviders(<ParlayBuilder />)

    fireEvent.click(screen.getByText('History'))

    await waitFor(() => {
      expect(mockGetParlayHistory).toHaveBeenCalled()
    })
  })

  it('shows empty history state', async () => {
    mockGetParlayHistory.mockResolvedValue({ parlays: [], stats: {} })

    renderWithProviders(<ParlayBuilder />)

    fireEvent.click(screen.getByText('History'))

    await waitFor(() => {
      expect(screen.getByText('No parlays yet')).toBeInTheDocument()
    })
  })
})
