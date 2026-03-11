import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../permissions/guards/permission.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { UsersService } from './users.service';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

interface CallerUser {
  id: string;
  role: { name: string };
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /users — paginated list; Admin sees all, Manager sees their team */
  @Get()
  @RequirePermission('users.view')
  @UseGuards(PermissionGuard)
  findAll(@CurrentUser() caller: CallerUser, @Query() query: ListUsersQueryDto) {
    return this.usersService.findAll(caller, query);
  }

  /** POST /users — create a user */
  @Post()
  @RequirePermission('users.manage')
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() caller: CallerUser, @Body() dto: CreateUserDto) {
    return this.usersService.create(caller, dto);
  }

  /** GET /users/:id — user detail with resolved permissions */
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() caller: CallerUser) {
    return this.usersService.findOne(id, caller);
  }

  /** PATCH /users/:id — update name / email */
  @Patch(':id')
  @RequirePermission('users.manage')
  @UseGuards(PermissionGuard)
  update(
    @Param('id') id: string,
    @CurrentUser() caller: CallerUser,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, caller, dto);
  }

  /** PATCH /users/:id/status — change status (Task 4b) */
  @Patch(':id/status')
  @RequirePermission('users.manage')
  @UseGuards(PermissionGuard)
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() caller: CallerUser,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(id, caller, dto);
  }
}
