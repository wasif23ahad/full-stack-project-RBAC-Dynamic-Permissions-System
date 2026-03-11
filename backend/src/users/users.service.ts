import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@prisma/client';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';

// Higher rank = higher privilege
const ROLE_RANK: Record<string, number> = {
  ADMIN: 4,
  MANAGER: 3,
  AGENT: 2,
  CUSTOMER: 1,
};

interface CallerContext {
  id: string;
  role: { name: string };
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionsService: PermissionsService,
  ) {}

  // ─── List ─────────────────────────────────────────────────────────────────

  async findAll(caller: CallerContext, query: ListUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Managers only see their own team
    if (caller.role.name === 'MANAGER') {
      where['managerId'] = caller.id;
    }

    if (query.search) {
      where['OR'] = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.role) {
      where['role'] = { name: query.role };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          role: true,
          manager: { select: { id: true, firstName: true, lastName: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(this.sanitize),
      total,
      page,
      limit,
    };
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(caller: CallerContext, dto: CreateUserDto) {
    const targetRole = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });
    if (!targetRole) throw new NotFoundException('Role not found');

    // Managers cannot create users at their own level or above
    if (caller.role.name === 'MANAGER') {
      const callerRank = ROLE_RANK[caller.role.name] ?? 0;
      const targetRank = ROLE_RANK[targetRole.name] ?? 0;
      if (targetRank >= callerRank) {
        throw new ForbiddenException(
          'Cannot create a user with equal or higher role',
        );
      }
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        roleId: dto.roleId,
        managerId: caller.role.name === 'MANAGER' ? caller.id : undefined,
      },
      include: { role: true },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: caller.id,
        action: 'CREATE_USER',
        targetType: 'User',
        targetId: user.id,
        metadata: { email: dto.email, roleId: dto.roleId },
      },
    });

    return this.sanitize(user);
  }

  // ─── Find one ─────────────────────────────────────────────────────────────

  async findOne(id: string, caller: CallerContext) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    this.assertCanAccess(user, caller);

    const permissions = await this.permissionsService.resolveForUser(id);
    return { ...this.sanitize(user), permissions };
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(id: string, caller: CallerContext, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');

    this.assertCanAccess(user, caller);

    if (dto.email && dto.email !== user.email) {
      const conflict = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (conflict) throw new ConflictException('Email already in use');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: dto,
      include: { role: true },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: caller.id,
        action: 'UPDATE_USER',
        targetType: 'User',
        targetId: id,
        metadata: dto as unknown as Prisma.InputJsonValue,
      },
    });

    return this.sanitize(updated);
  }

  // ─── Update status (Task 4b) ──────────────────────────────────────────────

  async updateStatus(
    id: string,
    caller: CallerContext,
    dto: UpdateUserStatusDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');

    if (caller.role.name === 'MANAGER') {
      if (user.managerId !== caller.id) {
        throw new ForbiddenException('Cannot manage users outside your team');
      }
      if (user.role.name === 'MANAGER' && dto.status !== 'ACTIVE') {
        throw new ForbiddenException(
          'Managers cannot suspend or ban other Managers',
        );
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      include: { role: true },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: caller.id,
        action: 'UPDATE_USER_STATUS',
        targetType: 'User',
        targetId: id,
        metadata: { status: dto.status },
      },
    });

    return this.sanitize(updated);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private assertCanAccess(
    user: { managerId: string | null },
    caller: CallerContext,
  ) {
    if (caller.role.name === 'ADMIN') return;
    if (caller.role.name === 'MANAGER' && user.managerId === caller.id) return;
    throw new ForbiddenException('Access denied');
  }

  private sanitize<T extends { passwordHash: string }>(
    user: T,
  ): Omit<T, 'passwordHash'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
