import 'reflect-metadata';

// Global test timeout
jest.setTimeout(30000);

// Mock environment variables for unit tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  process.env.TEST_JWT_SECRET || 'test-jwt-secret-key-for-unit-tests';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.DEFAULT_SEED_PASSWORD =
  process.env.TEST_SEED_PASSWORD || 'testpass';

// Global test utilities
global.testUtils = {
  createMockRepository: () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    manager: {
      connection: {
        createQueryRunner: jest.fn().mockReturnValue({
          connect: jest.fn(),
          query: jest.fn(),
          release: jest.fn(),
        }),
      },
    },
  }),

  createMockJwtPayload: (userId: number, role: string, email: string) => ({
    sub: userId,
    email,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  }),
};
