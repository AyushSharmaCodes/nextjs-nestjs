import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../supabase/supabase.module';
import { STORAGE_BUCKETS } from '../../storage/constants';
import {
  UploadFailedException,
  DeleteFailedException,
  SignedUrlFailedException,
} from '../../storage/exceptions';

@Injectable()
export class UserStorageService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async uploadAvatar(userId: string, fileBuffer: Buffer, mimeType: string, ext: string): Promise<string> {
    const path = `${userId}/avatar.${ext}`;
    const { data, error } = await this.supabase.storage
      .from(STORAGE_BUCKETS.USER_AVATARS)
      .upload(path, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      throw new UploadFailedException({ message: error.message });
    }

    return data.path;
  }

  async removeAvatar(userId: string): Promise<void> {
    const { data: files, error } = await this.supabase.storage.from(STORAGE_BUCKETS.USER_AVATARS).list(userId);
    if (error) {
      throw new DeleteFailedException({ message: error.message });
    }
    if (files && files.length > 0) {
      const paths = files.map((f: { name: string }) => `${userId}/${f.name}`);
      const { error: removeError } = await this.supabase.storage.from(STORAGE_BUCKETS.USER_AVATARS).remove(paths);
      if (removeError) {
        throw new DeleteFailedException({ message: removeError.message });
      }
    }
  }

  async uploadCover(userId: string, fileBuffer: Buffer, mimeType: string, ext: string): Promise<string> {
    const path = `${userId}/cover.${ext}`;
    const { data, error } = await this.supabase.storage
      .from(STORAGE_BUCKETS.USER_COVERS)
      .upload(path, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      throw new UploadFailedException({ message: error.message });
    }

    return data.path;
  }

  async removeCover(userId: string): Promise<void> {
    const { data: files, error } = await this.supabase.storage.from(STORAGE_BUCKETS.USER_COVERS).list(userId);
    if (error) {
      throw new DeleteFailedException({ message: error.message });
    }
    if (files && files.length > 0) {
      const paths = files.map((f: { name: string }) => `${userId}/${f.name}`);
      const { error: removeError } = await this.supabase.storage.from(STORAGE_BUCKETS.USER_COVERS).remove(paths);
      if (removeError) {
        throw new DeleteFailedException({ message: removeError.message });
      }
    }
  }

  async getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) {
      throw new SignedUrlFailedException({ message: error.message });
    }
    return data.signedUrl;
  }

  async getSignedUrls(bucket: string, paths: string[], expiresIn = 3600): Promise<Map<string, string>> {
    if (paths.length === 0) return new Map();

    const { data, error } = await this.supabase.storage.from(bucket).createSignedUrls(paths, expiresIn);
    if (error) {
      throw new SignedUrlFailedException({ message: error.message });
    }

    const urlMap = new Map<string, string>();
    data.forEach((item: { path?: string | null; name?: string | null; signedUrl?: string | null }) => {
      const key = item.path ?? item.name;
      const url = item.signedUrl;
      if (key && url) {
        urlMap.set(key, url);
      }
    });

    return urlMap;
  }
}
