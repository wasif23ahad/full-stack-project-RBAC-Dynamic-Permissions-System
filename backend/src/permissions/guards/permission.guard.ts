import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../../auth/decorators/require-permission.decorator';
import { PermissionsService } from '../permissions.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAtom = this.reflector.getAllAndOverride<string | undefined>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredAtom) return true;

    const request = context.switchToHttp().getRequest<{ user?: { id: string } }>();
    const user = request.user;
    if (!user) return false;

    const permissions = await this.permissionsService.resolveForUser(user.id);
    if (!permissions.includes(requiredAtom)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
