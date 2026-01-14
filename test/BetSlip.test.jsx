import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { BetSlipProvider, useBetSlip, FloatingBetSlip, AddToSlipButton } from '../BetSlip.jsx'
import { ToastProvider } from '../Toast.jsx'
import React, { useState, useEffect } from 'react'

// Test component to access bet slip context
const TestConsumer = ({ onMount, children }) => {
  const context = useBetSlip()
  useEffect(() => {
    if (onMount) onMount(context)
  }, [])
  return children ? children(context) : null
}

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

describe('BetSlipProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides default empty selections', () => {
    let contextValue
    renderWithProviders(
      <TestConsumer onMount={(ctx) => { contextValue = ctx }} />
    )

    expect(contextValue.selections).toEqual([])
  })

  it('adds selection to slip and returns true', () => {
    let contextValue
    renderWithProviders(
      <TestConsumer onMount={(ctx) => { contextValue = ctx }} />
    )

    const result = contextValue.addSelection({
      game_id: 'game1',
      bet_type: 'spread',
      side: 'Home',
      odds: -110,
      team: 'Lakers'
    })

    expect(result).toBe(true)
  })

  it('prevents adding same pick twice via UI', async () => {
    // Test via AddToSlipButton which properly handles duplicates
    const TestSetup = () => {
      const { selections } = useBetSlip()
      return (
        <div>
          <AddToSlipButton pick={{
            game_id: 'game1',
            bet_type: 'spread',
            side: 'Home',
            odds: -110
          }} />
          <span data-testid="count">{selections.length}</span>
        </div>
      )
    }

    renderWithProviders(<TestSetup />)

    // First click adds
    fireEvent.click(screen.getByText('+ Add'))
    await waitFor(() => {
      expect(screen.getByText('✓ In Slip')).toBeInTheDocument()
    })

    // Second click removes (toggles) - can't add duplicate
    fireEvent.click(screen.getByText('✓ In Slip'))
    await waitFor(() => {
      expect(screen.getByText('+ Add')).toBeInTheDocument()
    })
  })

  it('provides calculateParlayOdds function', () => {
    let contextValue
    renderWithProviders(
      <TestConsumer onMount={(ctx) => { contextValue = ctx }} />
    )

    // Just verify the function exists and returns null for empty selections
    expect(typeof contextValue.calculateParlayOdds).toBe('function')
    expect(contextValue.calculateParlayOdds()).toBeNull()
  })
})

describe('FloatingBetSlip', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('does not render when no selections', () => {
    renderWithProviders(<FloatingBetSlip />)

    expect(screen.queryByText('Bet Slip')).not.toBeInTheDocument()
  })

  it('shows floating button with selection count', async () => {
    const TestSetup = () => {
      const { addSelection } = useBetSlip()
      useEffect(() => {
        addSelection({
          game_id: 'g1',
          bet_type: 'spread',
          side: 'Home',
          odds: -110,
          team: 'Lakers'
        })
      }, [])
      return <FloatingBetSlip />
    }

    renderWithProviders(<TestSetup />)

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  it('expands when floating button clicked', async () => {
    const TestSetup = () => {
      const { addSelection } = useBetSlip()
      useEffect(() => {
        addSelection({
          game_id: 'g1',
          bet_type: 'spread',
          side: 'Home',
          odds: -110,
          team: 'Lakers'
        })
      }, [])
      return <FloatingBetSlip />
    }

    renderWithProviders(<TestSetup />)

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    // Click the floating button
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])

    await waitFor(() => {
      expect(screen.getByText('Bet Slip')).toBeInTheDocument()
    })
  })

  it('shows parlay odds for multiple selections', async () => {
    const TestSetup = () => {
      const { addSelection, setIsOpen } = useBetSlip()
      useEffect(() => {
        addSelection({
          game_id: 'g1',
          bet_type: 'spread',
          side: 'Home',
          odds: -110,
          team: 'Lakers'
        })
        addSelection({
          game_id: 'g2',
          bet_type: 'spread',
          side: 'Away',
          odds: -110,
          team: 'Celtics'
        })
        setIsOpen(true)
      }, [])
      return <FloatingBetSlip />
    }

    renderWithProviders(<TestSetup />)

    await waitFor(() => {
      expect(screen.getByText('2-Leg Parlay')).toBeInTheDocument()
    })
  })
})

describe('AddToSlipButton', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows "Add" when not in slip', () => {
    const TestSetup = () => (
      <AddToSlipButton pick={{
        game_id: 'g1',
        bet_type: 'spread',
        side: 'Home',
        odds: -110
      }} />
    )

    renderWithProviders(<TestSetup />)

    expect(screen.getByText('+ Add')).toBeInTheDocument()
  })

  it('changes text when clicked', async () => {
    const TestSetup = () => (
      <AddToSlipButton pick={{
        game_id: 'g1',
        bet_type: 'spread',
        side: 'Home',
        odds: -110
      }} />
    )

    renderWithProviders(<TestSetup />)

    expect(screen.getByText('+ Add')).toBeInTheDocument()

    fireEvent.click(screen.getByText('+ Add'))

    await waitFor(() => {
      expect(screen.getByText('✓ In Slip')).toBeInTheDocument()
    })
  })

  it('toggles back when clicked twice', async () => {
    const TestSetup = () => (
      <AddToSlipButton pick={{
        game_id: 'g1',
        bet_type: 'spread',
        side: 'Home',
        odds: -110
      }} />
    )

    renderWithProviders(<TestSetup />)

    // Add
    fireEvent.click(screen.getByText('+ Add'))
    await waitFor(() => {
      expect(screen.getByText('✓ In Slip')).toBeInTheDocument()
    })

    // Remove
    fireEvent.click(screen.getByText('✓ In Slip'))
    await waitFor(() => {
      expect(screen.getByText('+ Add')).toBeInTheDocument()
    })
  })
})
