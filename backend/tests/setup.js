// Test setup configuration
const { PrismaClient } = require('@prisma/client');

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
  process.env.PORT = '3001'; // Use different port for tests
  
  // Use test database or mock the database for isolated testing
  if (!process.env.TEST_DATABASE_URL) {
    // If no test database is configured, we'll skip database operations
    console.warn('Warning: No TEST_DATABASE_URL configured. Some tests may be skipped.');
  }
});

afterAll(async () => {
  // Clean up any global resources if needed
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn, // Keep warnings for important test info
  error: console.error, // Keep errors for debugging
};
