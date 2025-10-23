import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { PrismaClient, User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) return null;
    const match = await bcrypt.compare(pass, user.passwordHash);
    if (match) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, refreshTokenHash, ...result } = user as any;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    // store hashed refresh token
    await this.usersService.setRefreshToken(user.id, await bcrypt.hash(refreshToken, 10));
    return { accessToken, refreshToken };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException();
    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) throw new UnauthorizedException();
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const newRefresh = this.jwtService.sign(payload, { expiresIn: '7d' });
    await this.usersService.setRefreshToken(user.id, await bcrypt.hash(newRefresh, 10));
    return { accessToken, refreshToken: newRefresh };
  }
}
