import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../users/entities/user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: mockReflector }],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (user: any = null): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    }) as ExecutionContext;

  describe('RBAC - Role-Based Access Control', () => {
    it('should allow access when user has required role', () => {
      const mockUser = { id: 1, role: UserRole.ADMIN, email: 'admin@test.com' };
      const mockContext = createMockExecutionContext(mockUser);

      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should allow access when user has one of multiple required roles', () => {
      const mockUser = {
        id: 1,
        role: UserRole.HOSPITAL,
        email: 'hospital@test.com',
      };
      const mockContext = createMockExecutionContext(mockUser);

      mockReflector.getAllAndOverride.mockReturnValue([
        UserRole.ADMIN,
        UserRole.HOSPITAL,
      ]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      const mockUser = { id: 1, role: UserRole.DONOR, email: 'donor@test.com' };
      const mockContext = createMockExecutionContext(mockUser);

      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should deny access when user has different role than required', () => {
      const mockUser = { id: 1, role: UserRole.DONOR, email: 'donor@test.com' };
      const mockContext = createMockExecutionContext(mockUser);

      mockReflector.getAllAndOverride.mockReturnValue([UserRole.HOSPITAL]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should allow access when no specific roles are required', () => {
      const mockUser = { id: 1, role: UserRole.DONOR, email: 'donor@test.com' };
      const mockContext = createMockExecutionContext(mockUser);

      mockReflector.getAllAndOverride.mockReturnValue(undefined);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should deny access when user is not authenticated', () => {
      const mockContext = createMockExecutionContext(null);

      mockReflector.getAllAndOverride.mockReturnValue([UserRole.DONOR]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should handle case-sensitive role comparison correctly', () => {
      const mockUser = { id: 1, role: 'donor', email: 'donor@test.com' };
      const mockContext = createMockExecutionContext(mockUser);

      mockReflector.getAllAndOverride.mockReturnValue([UserRole.DONOR]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should deny access for admin-only endpoint when user is donor', () => {
      const mockUser = { id: 1, role: UserRole.DONOR, email: 'donor@test.com' };
      const mockContext = createMockExecutionContext(mockUser);

      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should deny access for hospital-only endpoint when user is donor', () => {
      const mockUser = { id: 1, role: UserRole.DONOR, email: 'donor@test.com' };
      const mockContext = createMockExecutionContext(mockUser);

      mockReflector.getAllAndOverride.mockReturnValue([UserRole.HOSPITAL]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should allow admin access to hospital endpoints', () => {
      const mockUser = { id: 1, role: UserRole.ADMIN, email: 'admin@test.com' };
      const mockContext = createMockExecutionContext(mockUser);

      mockReflector.getAllAndOverride.mockReturnValue([
        UserRole.HOSPITAL,
        UserRole.ADMIN,
      ]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });
  });
});
