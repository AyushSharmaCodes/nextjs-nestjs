export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp?: number;
  description: string;
  imageUrl: string;
  category: string;
  stock: number;
  featured?: boolean;
  rating?: number;
  reviewsCount?: number;
  createdAt?: string;
  isSale?: boolean;
  // Admin dashboard fields
  status?: 'active' | 'draft' | 'archived';
  soldCount?: number;
  isArchived?: boolean;
}

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  volume: string;
}

export interface VariantCopy {
  description: string;
  detail: string;
  benefits: string;
  delivery: string;
}

export interface ProductWithDetails extends Product {
  galleryImages: string[];
  sizes: string[];
  variants: ProductVariant[];
  variantCopies: Record<string, VariantCopy>;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  verified: boolean;
  text: string;
  images: string[];
  helpfulCount: number;
  unhelpfulCount: number;
}

export interface ShopFilters {
  categories: string[];
  benefits: string[];
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  open?: boolean;
}
