export class UnauthorizedRoleChangeException extends Error {
  constructor(message?: string) {
    super(message || 'You cannot change this role');
    this.name = 'UnauthorizedRoleChangeException';
  }
}
