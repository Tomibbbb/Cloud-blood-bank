import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (headers: any = {}): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    }) as ExecutionContext;

  describe('Security - JWT Token Validation', () => {
    it('should allow access with valid JWT token', async () => {
      const mockPayload = { sub: 1, email: 'test@test.com', role: 'DONOR' };
      const mockContext = createMockExecutionContext({
        authorization: 'Bearer valid-jwt-token',
      });

      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-jwt-token');
    });

    it('should reject request without authorization header', async () => {
      const mockContext = createMockExecutionContext({});
      mockReflector.getAllAndOverride.mockReturnValue(false);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject request with malformed authorization header', async () => {
      const mockContext = createMockExecutionContext({
        authorization: 'InvalidToken',
      });
      mockReflector.getAllAndOverride.mockReturnValue(false);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject request with expired JWT token', async () => {
      const mockContext = createMockExecutionContext({
        authorization: 'Bearer expired-token',
      });

      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject request with invalid JWT signature', async () => {
      const mockContext = createMockExecutionContext({
        authorization: 'Bearer invalid-signature-token',
      });

      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should allow public routes without token', async () => {
      const mockContext = createMockExecutionContext({});
      mockReflector.getAllAndOverride.mockReturnValue(true); // IS_PUBLIC_KEY

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(jwtService.verify).not.toHaveBeenCalled();
    });

    it('should extract token from Bearer prefix correctly', async () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      const mockPayload = { sub: 1, email: 'test@test.com', role: 'DONOR' };
      const mockContext = createMockExecutionContext({
        authorization: `Bearer ${token}`,
      });

      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockJwtService.verify.mockReturnValue(mockPayload);

      await guard.canActivate(mockContext);

      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });
  });
});
