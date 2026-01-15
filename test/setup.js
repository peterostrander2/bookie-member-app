import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock environment variables
vi.stubEnv('VITE_API_KEY', 'test-api-key')

// Mock fetch for unit tests that use fetch.mockResolvedValueOnce
global.fetch = vi.fn()

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
})
