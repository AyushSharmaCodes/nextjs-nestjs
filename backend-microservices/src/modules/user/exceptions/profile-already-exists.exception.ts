export class ProfileAlreadyExistsException extends Error {
  constructor(message?: string) {
    super(message || 'A profile already exists for this user');
    this.name = 'ProfileAlreadyExistsException';
  }
}
