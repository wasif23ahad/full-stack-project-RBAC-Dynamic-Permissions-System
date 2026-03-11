import { IsIn } from 'class-validator';
import { UserStatus } from '../../../generated/prisma/enums';

export class UpdateUserStatusDto {
  @IsIn(Object.values(UserStatus))
  status!: UserStatus;
}
