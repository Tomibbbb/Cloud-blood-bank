import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<{ user: Partial<User>; token: string }> {
    try {
      const existingUser = await this.usersService.findByEmail(signupDto.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    } catch (error) {
      if (error instanceof ConflictException) throw error;
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 12);
    const userData = { ...signupDto, password: hashedPassword, role: signupDto.role || UserRole.DONOR };
    const user = await this.usersService.create(userData);
    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, token };
  }

  async login(loginDto: LoginDto): Promise<{ user: Partial<User>; token: string }> {
    const user = await this.usersService.findByEmail(loginDto.email);
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async validateUser(userId: number): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }
}