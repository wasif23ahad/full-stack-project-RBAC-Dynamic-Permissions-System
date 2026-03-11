import { Global, Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PermissionGuard } from './guards/permission.guard';

@Global()
@Module({
  providers: [PermissionsService, PermissionGuard],
  controllers: [PermissionsController],
  exports: [PermissionsService, PermissionGuard],
})
export class PermissionsModule {}
