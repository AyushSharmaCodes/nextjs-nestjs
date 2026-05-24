'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Pagination } from '@/shared/components/Pagination';
import { AppIcon } from '@/shared/icons';
import { BlogPost } from '../types/blogs.types';
import { useTranslations } from 'next-intl';
import { useBlogs } from '../hooks/use-blogs';
import { Skeleton } from '@/shared/components/Skeleton';

interface BlogsClientProps {
  initialPosts: BlogPost[];
}

export default function BlogsClient({ initialPosts = [] }: BlogsClientProps) {
  const t = useTranslations('blogs');
  const {
    currentPage,
    setCurrentPage,
    currentSlide,
    setCurrentSlide,
    readLaterIds,
    toggleReadLater,
    handleShare,
    featuredPosts,
    currentPosts,
    totalPages,
    nextSlide,
    prevSlide,
    isTransitioning,
  } = useBlogs({ initialPosts });

  return (
    <div className="bg-white dark:bg-[#080808] min-h-screen pb-24 text-tertiary-900 dark:text-tertiary-100 font-sans">
      
      {/* Dynamic Nav Offset */}
      <div className="h-20 md:h-24" />

      {/* Hero Section */}
      <section className="bg-tertiary-900 dark:bg-[#0a0a0a] text-[#F6F5F2] py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden dark:border-b dark:border-tertiary-800">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10 dark:opacity-5">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[120%] rounded-full border-[1px] md:border-[2px] border-[#F6F5F2] dark:border-white" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[100%] rounded-full border-[1px] md:border-[2px] border-[#F6F5F2] dark:border-white" />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-12 pt-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-bold leading-[1.1] mb-6">
              {t('title')}
            </h1>
          </div>
          
          <div className="max-w-md w-full lg:mb-4">
            <p className="text-lg mb-6 text-[#F6F5F2]/90 dark:text-tertiary-300">
              {t('subtitle')}
            </p>
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder={t('emailPlaceholder')} 
                className="flex-grow px-4 py-3 rounded-xl text-tertiary-900 dark:text-white bg-white dark:bg-tertiary-900/50 outline-none focus:ring-2 focus:ring-primary-500 shadow-sm border border-transparent dark:border-tertiary-800"
                required
              />
              <button 
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap shadow-sm cursor-pointer"
              >
                {t('subscribe')}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-20">
        <h2 className="text-3xl font-bold text-tertiary-900 dark:text-white mb-10">{t('articles')}</h2>

        {/* Featured Articles Slider */}
        {featuredPosts.length > 0 && (
          <div className="w-full max-w-5xl mx-auto mb-16">
            <div className="relative rounded-3xl overflow-hidden h-[400px] md:h-[500px] shadow-lg group">
              {featuredPosts.map((post, idx) => (
                <Link 
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className={`absolute inset-0 transition-transform duration-700 ease-in-out block cursor-pointer group/slide ${idx === currentSlide ? 'translate-x-0' : idx < currentSlide ? '-translate-x-full' : 'translate-x-full'}`}
                >
                  <Image 
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover/slide:scale-[1.02]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
                    <div className="text-sm text-primary-500 font-semibold mb-3 tracking-wide uppercase">
                      {t('featured')}
                    </div>
                    <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 max-w-3xl group-hover/slide:text-primary-400 transition-colors">
                      {post.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-300 gap-2 mb-4">
                      <span>{post.author}</span>
                      <span>&bull;</span>
                      <span>{post.date}</span>
                      <span>&bull;</span>
                      <span>{post.category}</span>
                    </div>
                    <p className="text-gray-200 line-clamp-2 md:line-clamp-3 max-w-3xl text-sm md:text-base">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
              
              {/* Slider Controls */}
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
                aria-label={t('prevSlide')}
              >
                <AppIcon name="chevronLeft" className="w-6 h-6" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
                aria-label={t('nextSlide')}
              >
                <AppIcon name="chevronRight" className="w-6 h-6" />
              </button>
              
              {/* Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {featuredPosts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${idx === currentSlide ? 'w-6 bg-primary-500' : 'bg-white/50 hover:bg-white/80'}`}
                    aria-label={t('goToSlide', { index: idx + 1 })}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {isTransitioning
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex flex-col space-y-4">
                  <Skeleton className="w-full h-64 rounded-2xl" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-16 w-full animate-pulse opacity-70" />
                </div>
              ))
            : currentPosts.map((post) => {
                const isSaved = readLaterIds.includes(post.id);
                return (
                  <article key={post.id} className="flex flex-col group cursor-pointer relative">
                    <div className="relative w-full h-64 mb-6 rounded-2xl overflow-hidden bg-gray-100 dark:bg-neutral-800 shadow-sm border border-black/5 dark:border-white/5">
                      <Link href={`/blog/${post.id}`} className="block w-full h-full relative">
                        <Image 
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </Link>
                      <button
                        onClick={(e) => toggleReadLater(e, post.id)}
                        className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all shadow-sm z-10 cursor-pointer ${isSaved ? 'bg-primary-500 text-white' : 'bg-white/80 dark:bg-black/50 text-tertiary-700 dark:text-tertiary-200 hover:bg-white dark:hover:bg-black/80'}`}
                        aria-label={isSaved ? t('removeFromSaved') : t('saveForLater')}
                        title={isSaved ? t('removeFromSaved') : t('saveForLater')}
                      >
                        <AppIcon name="bookmark" className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    
                    <div className="text-sm text-primary-600 dark:text-primary-50 font-semibold mb-3">
                      {post.author} <span className="text-stone-400 dark:text-neutral-600 mx-1">&bull;</span> <span className="text-stone-500 dark:text-stone-400 font-medium">{post.date}</span>
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-bold text-tertiary-900 dark:text-tertiary-50 mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                      <Link href={`/blog/${post.id}`}>{post.title}</Link>
                    </h3>
                    
                    <p className="text-tertiary-600 dark:text-tertiary-400 mb-6 line-clamp-3 text-base flex-grow">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-4 border-t border-tertiary-100 dark:border-t-neutral-800">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0,2).map((tag) => (
                          <span key={tag} className="px-3 py-1 rounded-full border border-tertiary-200 dark:border-tertiary-800 text-xs font-medium text-tertiary-700 dark:text-tertiary-300 bg-white dark:bg-tertiary-900/50">
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="px-3 py-1 rounded-full border border-tertiary-200 dark:border-tertiary-800 text-xs font-medium text-tertiary-700 dark:text-tertiary-300 bg-white dark:bg-tertiary-900/50">
                            +{post.tags.length - 2}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => handleShare(e, 'facebook', post.title, post.id)} className="p-2 text-tertiary-400 hover:text-[#1877F2] transition-colors cursor-pointer" aria-label={t('shareOnFacebook')}>
                          <AppIcon name="facebook" size="xs" className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => handleShare(e, 'twitter', post.title, post.id)} className="p-2 text-tertiary-400 hover:text-[#1DA1F2] transition-colors cursor-pointer" aria-label={t('shareOnTwitter')}>
                          <AppIcon name="twitter" size="xs" className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => handleShare(e, 'linkedin', post.title, post.id)} className="p-2 text-tertiary-400 hover:text-[#0A66C2] transition-colors cursor-pointer" aria-label={t('shareOnLinkedIn')}>
                          <AppIcon name="linkedin" size="xs" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-20 border-t border-tertiary-200 dark:border-tertiary-800">
            <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
          </div>
        )}
      </section>
    </div>
  );
}
