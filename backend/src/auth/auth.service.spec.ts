import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Security - Password Hashing and JWT', () => {
    describe('login', () => {
      it('should return JWT token for valid credentials', async () => {
        const mockUser = {
          id: 1,
          email: 'test@test.com',
          password: 'hashedPassword',
          role: UserRole.DONOR,
          firstName: 'Test',
          lastName: 'User',
        };

        const loginDto = {
          email: 'test@test.com',
          password: 'plainPassword',
        };

        mockUsersService.findByEmail.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        mockJwtService.sign.mockReturnValue('jwt-token');

        const result = await service.login(loginDto);

        expect(result).toEqual({
          message: 'Login successful',
          user: {
            id: 1,
            firstName: 'Test',
            lastName: 'User',
            email: 'test@test.com',
            role: UserRole.DONOR,
          },
          token: 'jwt-token',
        });

        expect(bcrypt.compare).toHaveBeenCalledWith(
          'plainPassword',
          'hashedPassword',
        );
        expect(jwtService.sign).toHaveBeenCalledWith({
          sub: 1,
          email: 'test@test.com',
          role: UserRole.DONOR,
        });
      });

      it('should throw UnauthorizedException for invalid email', async () => {
        const loginDto = {
          email: 'nonexistent@test.com',
          password: 'password',
        };

        mockUsersService.findByEmail.mockResolvedValue(null);

        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );
        expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
          'nonexistent@test.com',
        );
      });

      it('should throw UnauthorizedException for invalid password', async () => {
        const mockUser = {
          id: 1,
          email: 'test@test.com',
          password: 'hashedPassword',
          role: UserRole.DONOR,
        };

        const loginDto = {
          email: 'test@test.com',
          password: 'wrongPassword',
        };

        mockUsersService.findByEmail.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );
        expect(bcrypt.compare).toHaveBeenCalledWith(
          'wrongPassword',
          'hashedPassword',
        );
      });

      it('should not include password in JWT payload', async () => {
        const mockUser = {
          id: 1,
          email: 'test@test.com',
          password: 'hashedPassword',
          role: UserRole.ADMIN,
          firstName: 'Admin',
          lastName: 'User',
        };

        const loginDto = {
          email: 'test@test.com',
          password: 'correctPassword',
        };

        mockUsersService.findByEmail.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        mockJwtService.sign.mockReturnValue('jwt-token');

        await service.login(loginDto);

        expect(jwtService.sign).toHaveBeenCalledWith({
          sub: 1,
          email: 'test@test.com',
          role: UserRole.ADMIN,
        });

        // Verify password is not in the JWT payload
        const jwtPayload = mockJwtService.sign.mock.calls[0][0];
        expect(jwtPayload).not.toHaveProperty('password');
      });
    });

    describe('signup', () => {
      it('should hash password before saving user', async () => {
        const signupDto = {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com',
          password: 'plainPassword',
          role: UserRole.DONOR,
        };

        const mockCreatedUser = {
          id: 1,
          ...signupDto,
          password: 'hashedPassword',
        };

        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
        mockUsersService.create.mockResolvedValue(mockCreatedUser);

        const result = await service.signup(signupDto);

        expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 12);
        expect(mockUsersService.create).toHaveBeenCalledWith({
          ...signupDto,
          password: 'hashedPassword',
        });

        expect(result).toEqual({
          message: 'User created successfully',
          user: {
            id: 1,
            firstName: 'Test',
            lastName: 'User',
            email: 'test@test.com',
            role: UserRole.DONOR,
          },
        });
      });

      it('should not return password in signup response', async () => {
        const signupDto = {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com',
          password: 'plainPassword',
          role: UserRole.HOSPITAL,
        };

        const mockCreatedUser = {
          id: 1,
          ...signupDto,
          password: 'hashedPassword',
        };

        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
        mockUsersService.create.mockResolvedValue(mockCreatedUser);

        const result = await service.signup(signupDto);

        expect(result.user).not.toHaveProperty('password');
      });

      it('should use salt rounds of 12 for password hashing', async () => {
        const signupDto = {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com',
          password: 'testPassword',
          role: UserRole.DONOR,
        };

        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
        mockUsersService.create.mockResolvedValue({ id: 1, ...signupDto });

        await service.signup(signupDto);

        expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 12);
      });
    });
  });
});
