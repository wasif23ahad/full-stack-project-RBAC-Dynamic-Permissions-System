import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { PermissionsService } from './permissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto';

interface CallerUser {
  id: string;
  role: { name: string };
}

@Controller()
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly prisma: PrismaService,
  ) {}

  /** GET /permissions — all atoms, any authenticated user */
  @Get('permissions')
  getAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { atom: 'asc' }],
    });
  }

  /** GET /users/:id/permissions — resolved set for a user */
  @Get('users/:id/permissions')
  async getUserPermissions(
    @Param('id') id: string,
    @CurrentUser() caller: CallerUser,
  ) {
    await this.assertCallerCanAccessUser(id, caller);
    return this.permissionsService.resolveForUser(id);
  }

  /** PUT /users/:id/permissions — replace user's individual overrides */
  @Put('users/:id/permissions')
  @UseGuards(PermissionGuard)
  @RequirePermission('permissions.manage')
  async updateUserPermissions(
    @Param('id') id: string,
    @Body() dto: UpdateUserPermissionsDto,
    @CurrentUser() caller: CallerUser,
  ) {
    await this.assertCallerCanAccessUser(id, caller);

    // Grant ceiling: caller may only assign atoms they themselves hold
    const callerAtoms = new Set(
      await this.permissionsService.resolveForUser(caller.id),
    );
    const allRequested = [...dto.grants, ...dto.revocations];
    const disallowed = allRequested.filter((atom) => !callerAtoms.has(atom));
    if (disallowed.length > 0) {
      throw new ForbiddenException(
        `Caller does not hold: ${disallowed.join(', ')}`,
      );
    }

    // Resolve atom strings → permission IDs
    const permissions = await this.prisma.permission.findMany({
      where: { atom: { in: allRequested } },
    });
    const atomToId = new Map(permissions.map((p) => [p.atom, p.id]));

    // Atomic replace + audit in one transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.userPermission.deleteMany({ where: { userId: id } });

      const records = [
        ...dto.grants.map((atom) => ({
          userId: id,
          permissionId: atomToId.get(atom)!,
          type: 'GRANT' as const,
          grantedById: caller.id,
        })),
        ...dto.revocations.map((atom) => ({
          userId: id,
          permissionId: atomToId.get(atom)!,
          type: 'REVOKE' as const,
          grantedById: caller.id,
        })),
      ];

      if (records.length > 0) {
        await tx.userPermission.createMany({ data: records });
      }

      await tx.auditLog.create({
        data: {
          actorId: caller.id,
          action: 'UPDATE_PERMISSIONS',
          targetType: 'User',
          targetId: id,
          metadata: { grants: dto.grants, revocations: dto.revocations },
        },
      });
    });

    return this.permissionsService.resolveForUser(id);
  }

  private async assertCallerCanAccessUser(targetId: string, caller: CallerUser) {
    if (caller.role.name === 'ADMIN') return;

    const target = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundException('User not found');

    if (caller.role.name === 'MANAGER' && target.managerId === caller.id) return;

    throw new ForbiddenException('Access denied');
  }
}
