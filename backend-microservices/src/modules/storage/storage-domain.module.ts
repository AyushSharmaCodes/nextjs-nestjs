import { Module } from '@nestjs/common';
import { UploadModule } from './upload/upload.module';

/**
 * Storage domain module.
 */
@Module({
  imports: [UploadModule],
  exports: [UploadModule],
})
export class StorageDomainModule {}
