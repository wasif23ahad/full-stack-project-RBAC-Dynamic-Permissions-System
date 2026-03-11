import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveForUser(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
        userPermissions: {
          include: { permission: true },
        },
      },
    });

    if (!user) return [];

    // Base set from role
    const atomSet = new Set<string>(
      user.role.rolePermissions.map((rp) => rp.permission.atom),
    );

    // Apply per-user GRANTs and REVOKEs
    for (const up of user.userPermissions) {
      if (up.type === 'GRANT') {
        atomSet.add(up.permission.atom);
      } else {
        atomSet.delete(up.permission.atom);
      }
    }

    return Array.from(atomSet);
  }
}
