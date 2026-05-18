export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  authorAvatar: string;
  date: string;
  category: string;
  tags: string[];
  image: string;
  content?: string;
  quote?: string;
  quoteAuthor?: string;
  subheading1?: string;
  subheading1Text?: string;
  subheading2?: string;
  subheading2Text?: string;
  inlineImage?: string;
  featured?: boolean;
}

export interface BlogSearchFilters {
  search?: string;
  category?: string;
  tag?: string;
}
