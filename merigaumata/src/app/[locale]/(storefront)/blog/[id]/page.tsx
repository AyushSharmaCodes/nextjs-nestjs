import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { blogsService } from '@/features/blogs/services/blogs.service';
import { BlogDetailClient } from '@/features/blogs/components/BlogDetailClient';

interface BlogPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await blogsService.getById(id);

  if (!post) {
    return {
      title: 'Blog Not Found | MeriGauMata',
      description: 'The requested blog post could not be located.',
    };
  }

  return {
    title: `${post.title} | MeriGauMata`,
    description: post.excerpt,
  };
}

export default async function BlogsDetailPage({ params }: BlogPageProps) {
  const { locale, id } = await params;
  
  // Set the locale for next-intl server-side processing
  setRequestLocale(locale);

  const post = await blogsService.getById(id);
  if (!post) {
    notFound();
  }

  const allBlogs = await blogsService.getAll();
  const relatedPosts = allBlogs.filter(p => p.id !== post.id).slice(0, 3);

  return (
    <BlogDetailClient post={post} relatedPosts={relatedPosts} />
  );
}
