import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user.repository';

@Injectable()
export class GetPermissionsForRoleQuery {
  constructor(private readonly repository: UserRepository) {}

  async execute(roleName: string) {
    const role = await this.repository.getRoleByName(roleName);
    if (!role) {
      throw new Error('Role not found');
    }
    // We would return role permissions here. For the user module, we primarily
    // use the manager permissions matrix for managers. 
    return [];
  }
}
