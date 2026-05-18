export type CategoryType = 'product' | 'event' | 'blog' | 'faq';

export interface LocalizedContent {
  name: string;
  description: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  canonicalSlug?: string;
}

export interface BaseCategory {
  id: string;
  parentId: string | null;
  slug: string;
  type: CategoryType;
  sortOrder: number;
  isActive: boolean;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
  icon?: string;
  image?: string;
  bannerImage?: string;
  translations: Record<string, LocalizedContent>; // key is locale: 'en', 'hi', 'ta', 'te'
  seo: SEOMetadata;
}

export interface ProductCategory extends BaseCategory {
  type: 'product';
  featured: boolean;
  commissionRate: number;
  taxRate: number;
  tags: string[];
  attributes: string[]; // e.g. ["Size", "Material"]
  variants: { name: string; options: string[] }[];
  inventoryBehavior: 'track' | 'ignore' | 'preorder';
}

export interface EventCategory extends BaseCategory {
  type: 'event';
  eventType: 'conference' | 'webinar' | 'satsang' | 'festival' | 'workshop';
  categoryColor: string; // Hex color code
  audienceType: 'all' | 'professionals' | 'kids' | 'seniors';
  setupType: 'online' | 'in-person' | 'hybrid';
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
}

export interface BlogCategory extends BaseCategory {
  type: 'blog';
  featured: boolean;
  editorNotes?: string;
  publishingSettings: {
    autoPublish: boolean;
    requiresApproval: boolean;
  };
}

export interface FAQCategory extends BaseCategory {
  type: 'faq';
  supportGrouping: string; // e.g. "Order Help", "Cows Care", "Services"
  audienceType: 'all' | 'registered' | 'premium';
  collapsible: boolean;
}

export type Category = ProductCategory | EventCategory | BlogCategory | FAQCategory;
