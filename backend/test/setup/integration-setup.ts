import 'reflect-metadata';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';

// Global test timeout for integration tests
jest.setTimeout(120000);

// Global variables for test database
let postgresContainer: StartedPostgreSqlContainer;
let testDataSource: DataSource;

// Setup before all tests
beforeAll(async () => {
  // Start PostgreSQL container
  postgresContainer = await new PostgreSqlContainer('postgres:15-alpine')
    .withDatabase('obbms_test')
    .withUsername('testuser')
    .withPassword('testpass')
    .start();

  const connectionUri = postgresContainer.getConnectionUri();

  // Set environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = connectionUri;
  process.env.JWT_SECRET =
    process.env.TEST_JWT_SECRET || 'integration-test-jwt-secret';
  process.env.DEFAULT_SEED_PASSWORD =
    process.env.TEST_SEED_PASSWORD || 'testpass';

  // Create DataSource for tests
  testDataSource = new DataSource({
    type: 'postgres',
    url: connectionUri,
    entities: [__dirname + '/../../src/**/*.entity{.ts,.js}'],
    synchronize: true, // Auto-create schema for tests
    logging: false,
  });

  await testDataSource.initialize();
});

// Cleanup after all tests
afterAll(async () => {
  if (testDataSource) {
    await testDataSource.destroy();
  }
  if (postgresContainer) {
    await postgresContainer.stop();
  }
});

// Clean database before each test
beforeEach(async () => {
  if (testDataSource) {
    // Truncate all tables
    const entities = testDataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = testDataSource.getRepository(entity.name);
      await repository.clear();
    }
  }
});

// Export for use in tests
global.testDataSource = testDataSource;
global.getTestDataSource = () => testDataSource;
