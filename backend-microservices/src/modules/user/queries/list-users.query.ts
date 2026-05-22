import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user.repository';
import { PaginationQueryDto } from '../dto/pagination-query.dto';

@Injectable()
export class ListUsersQuery {
  constructor(private readonly repository: UserRepository) {}

  async execute(query: PaginationQueryDto) {
    return this.repository.listProfiles(query);
  }
}
