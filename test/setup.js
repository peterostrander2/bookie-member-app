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
vi.stubEnv('VITE_BOOKIE_API_KEY', 'test-api-key')
vi.stubEnv('VITE_RATE_LIMIT', 'false') // Disable rate limiting in tests

// Mock rate limiting module to pass through to fetch in tests
vi.mock('../rateLimit', () => ({
  rateLimitedFetch: (url, options) => fetch(url, options),
  RateLimitError: class RateLimitError extends Error {
    constructor(message, waitTimeMs) {
      super(message);
      this.name = 'RateLimitError';
      this.waitTimeMs = waitTimeMs;
    }
  },
}))

// Mock fetch for unit tests that use fetch.mockResolvedValueOnce
global.fetch = vi.fn()

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
})
