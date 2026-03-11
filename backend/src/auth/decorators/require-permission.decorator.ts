import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'required_permission';
export const RequirePermission = (atom: string) => SetMetadata(PERMISSION_KEY, atom);
