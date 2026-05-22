export class ImageUploadFailedException extends Error {
  constructor(message?: string) {
    super(message || 'Image upload failed');
    this.name = 'ImageUploadFailedException';
  }
}
