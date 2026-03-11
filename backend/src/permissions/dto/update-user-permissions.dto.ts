import { IsArray, IsString } from 'class-validator';

export class UpdateUserPermissionsDto {
  @IsArray()
  @IsString({ each: true })
  grants!: string[];

  @IsArray()
  @IsString({ each: true })
  revocations!: string[];
}
