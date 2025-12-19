import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from '../../modules/auth/domain/enums/UserRoleEnum';

export const Roles = (...roles: UserRoleEnum[]) => SetMetadata('roles', roles);
