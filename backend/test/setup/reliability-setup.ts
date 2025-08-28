import 'reflect-metadata';

// Global test timeout for reliability tests
jest.setTimeout(60000);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  process.env.TEST_JWT_SECRET || 'reliability-test-jwt-secret';
process.env.DEFAULT_SEED_PASSWORD =
  process.env.TEST_SEED_PASSWORD || 'testpass';

// Global utilities for reliability testing
global.reliabilityUtils = {
  createMockFailingDataSource: () => ({
    query: jest.fn().mockRejectedValue(new Error('Database connection failed')),
    isInitialized: false,
    destroy: jest.fn(),
  }),

  createMockSlowDataSource: (delay = 5000) => ({
    query: jest
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), delay)),
      ),
    isInitialized: true,
    destroy: jest.fn(),
  }),

  simulateNetworkError: () => {
    return new Error('ECONNREFUSED: Connection refused');
  },
};
