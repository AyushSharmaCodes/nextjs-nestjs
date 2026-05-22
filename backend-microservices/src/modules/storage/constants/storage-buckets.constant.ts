/**
 * @file storage-buckets.constant.ts
 *
 * Registry of all Supabase storage bucket names used across the application.
 * Always reference these constants instead of raw string literals.
 */

export const STORAGE_BUCKETS = {
  USER_AVATARS: 'user-avatars',
  USER_COVERS: 'user-covers',
  POST_MEDIA: 'post-media',
  PRODUCT_IMAGES: 'product-images',
  ATTACHMENTS: 'attachments',
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

/**
 * All valid bucket names as a union type for type-safe bucket references.
 */
export type StorageBucketName = StorageBucket;

export function isValidBucket(bucket: string): bucket is StorageBucket {
  return Object.values(STORAGE_BUCKETS).includes(bucket as StorageBucket);
}