import { Link } from '@/i18n/navigation';
import BlogCard from './BlogCard';
import { getTranslations } from 'next-intl/server';
import { BlogPost } from '../types/blogs.types';

interface BlogsSectionProps {
  posts: BlogPost[];
}

export default async function BlogsSection({ posts = [] }: BlogsSectionProps) {
  const t = await getTranslations('home.blogs');

  // Defensive check to ensure posts is an array before slicing
  const safePosts = Array.isArray(posts) ? posts : [];

  if (safePosts.length === 0) {
    return null;
  }

  // Segment posts: first one large featured, next 4 small
  const largePost = safePosts[0];
  const smallPosts = safePosts.slice(1, 5);

  return (
    <section className="py-24 bg-earth-50/70 dark:bg-neutral-950/50 transition-colors overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-tertiary-900 dark:text-neutral-100 mb-4 tracking-tight uppercase">
              {t('title')}
            </h2>
            <p className="text-foreground/70 dark:text-neutral-400 text-lg font-medium leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
          <Link 
            href="/blogs" 
            className="shrink-0 px-8 py-3.5 rounded-full bg-white dark:bg-neutral-900 border border-earth-200 dark:border-neutral-800 text-tertiary-900 dark:text-neutral-100 font-bold uppercase tracking-widest text-[11px] hover:shadow-md hover:-translate-y-0.5 transition-all outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
          >
            {t('viewAll')}
          </Link>
        </div>

        {/* Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          
          {/* Large Featured Blog */}
          {largePost && (
            <div className="w-full lg:w-5/12 xl:w-[45%] flex-shrink-0">
              <BlogCard 
                variant="large"
                post={largePost}
              />
            </div>
          )}

          {/* Smaller Blogs Grid */}
          <div className="w-full lg:w-7/12 xl:w-[55%] grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
            {smallPosts.map((blog) => (
              <div key={blog.id}>
                <BlogCard 
                  variant="small"
                  post={blog}
                />
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
