import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetAuditLogsDto } from './dto/get-audit-logs.dto';

interface CallerContext {
  id: string;
  role: { name: string };
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(caller: CallerContext, query: GetAuditLogsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (caller.role.name === 'MANAGER') {
      const teamMembers = await this.prisma.user.findMany({
        where: { managerId: caller.id },
        select: { id: true },
      });
      const teamMemberIds = teamMembers.map((u) => u.id);
      teamMemberIds.push(caller.id);

      if (query.actorId) {
        if (!teamMemberIds.includes(query.actorId)) {
          where.actorId = 'OUT_OF_SCOPE';
        } else {
          where.actorId = query.actorId;
        }
      } else {
        where.actorId = { in: teamMemberIds };
      }
    } else if (query.actorId) {
      where.actorId = query.actorId;
    }

    if (query.targetType) {
      where.targetType = query.targetType;
    }

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          actor: { select: { firstName: true, lastName: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const data = logs.map((log) => ({
      id: log.id,
      actorName: `${log.actor.firstName} ${log.actor.lastName}`,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      metadata: log.metadata,
      createdAt: log.createdAt,
    }));

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
