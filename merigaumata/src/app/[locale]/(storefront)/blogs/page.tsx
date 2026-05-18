import { blogsService } from '@/features/blogs/services/blogs.service';
import BlogsClient from '@/features/blogs/components/BlogsClient';
import { setRequestLocale } from 'next-intl/server';

interface BlogsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function BlogsPage({ params }: BlogsPageProps) {
  const { locale } = await params;
  
  // Configure the locale for server-side processing
  setRequestLocale(locale);

  // Fetch blogs server-side
  const posts = await blogsService.getAll();

  return (
    <BlogsClient initialPosts={posts} />
  );
}
