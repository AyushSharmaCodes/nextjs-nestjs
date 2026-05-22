export class AddressNotFoundException extends Error {
  constructor(message?: string) {
    super(message || 'Address not found');
    this.name = 'AddressNotFoundException';
  }
}

