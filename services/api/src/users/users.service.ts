import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

@Injectable()
export class UsersService {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: any): Promise<User> {
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;
    return prisma.user.create({ data: { email: data.email, name: data.name, role: data.role || 'ATTENDEE', passwordHash } as any });
  }

  async setRefreshToken(userId: string, tokenHash: string) {
    return prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: tokenHash } });
  }

  async removeRefreshToken(userId: string) {
    return prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
  }
}
