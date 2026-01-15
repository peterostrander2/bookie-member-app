/**
 * MSW Server Setup
 * Sets up the mock server for Node.js environments (Vitest tests)
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
