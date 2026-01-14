import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '../Toast.jsx'

// Use vi.hoisted to define mocks before vi.mock is processed
const { mockGetBetHistory, mockGradeBet } = vi.hoisted(() => ({
  mockGetBetHistory: vi.fn(),
  mockGradeBet: vi.fn()
}))

// Mock the api module
vi.mock('../api.js', () => ({
  api: {
    getBetHistory: mockGetBetHistory,
    gradeBet: mockGradeBet
  },
  default: {
    getBetHistory: mockGetBetHistory,
    gradeBet: mockGradeBet
  }
}))

// Import after mock is set up
import BetHistory from '../BetHistory.jsx'

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        {component}
      </ToastProvider>
    </BrowserRouter>
  )
}

describe('BetHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    mockGetBetHistory.mockImplementation(() => new Promise(() => {}))

    renderWithProviders(<BetHistory />)

    expect(screen.getByText('Bet History')).toBeInTheDocument()
  })

  it('renders empty state when no bets', async () => {
    mockGetBetHistory.mockResolvedValue({ bets: [], stats: {} })

    renderWithProviders(<BetHistory />)

    await waitFor(() => {
      expect(screen.getByText('No bets found')).toBeInTheDocument()
    })
  })

  it('renders bet list when bets exist', async () => {
    mockGetBetHistory.mockResolvedValue({
      bets: [
        {
          id: 'bet1',
          player: 'LeBron James',
          bet_type: 'points',
          side: 'Over',
          line: 25.5,
          odds: -110,
          stake: 100,
          outcome: 'WIN'
        },
        {
          id: 'bet2',
          team: 'Lakers',
          bet_type: 'spread',
          side: 'Home',
          line: -5.5,
          odds: -110,
          stake: 50,
          outcome: 'LOSS'
        }
      ],
      stats: { total: 2, wins: 1, losses: 1, win_rate: 50 }
    })

    renderWithProviders(<BetHistory />)

    await waitFor(() => {
      expect(screen.getByText('LeBron James')).toBeInTheDocument()
      expect(screen.getByText('Lakers')).toBeInTheDocument()
    })
  })

  it('displays stats cards correctly', async () => {
    mockGetBetHistory.mockResolvedValue({
      bets: [
        { id: 'bet1', outcome: 'WIN', odds: -110, stake: 100 },
        { id: 'bet2', outcome: 'LOSS', odds: -110, stake: 100 }
      ],
      stats: { total: 2, wins: 1, losses: 1, win_rate: 50 }
    })

    renderWithProviders(<BetHistory />)

    await waitFor(() => {
      expect(screen.getByText('Total Bets')).toBeInTheDocument()
      expect(screen.getByText('Wins')).toBeInTheDocument()
      expect(screen.getByText('Losses')).toBeInTheDocument()
      expect(screen.getByText('Win Rate')).toBeInTheDocument()
    })
  })

  it('filters bets by status', async () => {
    mockGetBetHistory.mockResolvedValue({
      bets: [
        { id: 'bet1', player: 'Player One', outcome: 'WIN' },
        { id: 'bet2', player: 'Player Two', outcome: 'LOSS' },
        { id: 'bet3', player: 'Player Three', outcome: null }
      ],
      stats: {}
    })

    renderWithProviders(<BetHistory />)

    await waitFor(() => {
      expect(screen.getByText('Player One')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('won'))

    await waitFor(() => {
      expect(screen.getByText('Player One')).toBeInTheDocument()
      expect(screen.queryByText('Player Two')).not.toBeInTheDocument()
    })
  })

  it('shows grade buttons for pending bets', async () => {
    mockGetBetHistory.mockResolvedValue({
      bets: [
        { id: 'bet1', player: 'Pending Player', outcome: null }
      ],
      stats: {}
    })

    renderWithProviders(<BetHistory />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'WIN' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'LOSS' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'PUSH' })).toBeInTheDocument()
    })
  })

  it('calls gradeBet when grade button clicked', async () => {
    mockGetBetHistory.mockResolvedValue({
      bets: [
        { id: 'bet1', player: 'Test Player', outcome: null }
      ],
      stats: {}
    })
    mockGradeBet.mockResolvedValue({ id: 'bet1', outcome: 'WIN' })

    renderWithProviders(<BetHistory />)

    await waitFor(() => {
      expect(screen.getByText('Test Player')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'WIN' }))

    await waitFor(() => {
      expect(mockGradeBet).toHaveBeenCalledWith('bet1', 'WIN')
    })
  })

  it('refreshes data when refresh button clicked', async () => {
    mockGetBetHistory.mockResolvedValue({ bets: [], stats: {} })

    renderWithProviders(<BetHistory />)

    await waitFor(() => {
      expect(mockGetBetHistory).toHaveBeenCalledTimes(1)
    })

    fireEvent.click(screen.getByText('🔄 Refresh'))

    await waitFor(() => {
      expect(mockGetBetHistory).toHaveBeenCalledTimes(2)
    })
  })
})
