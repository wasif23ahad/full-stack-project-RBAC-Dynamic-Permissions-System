import { IsIn } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class UpdateUserStatusDto {
  @IsIn(Object.values(UserStatus))
  status!: UserStatus;
}
