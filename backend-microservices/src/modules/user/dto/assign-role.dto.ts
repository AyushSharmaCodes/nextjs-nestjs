import { IsEnum } from 'class-validator';
import { UserRole } from '../types/user-role.enum';

export class AssignRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}