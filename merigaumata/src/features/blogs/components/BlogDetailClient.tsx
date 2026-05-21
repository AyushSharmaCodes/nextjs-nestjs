'use client';

import { useState, useRef } from 'react';
import { BlogPost } from '../types/blogs.types';
import { BlogHeader } from './BlogHeader';
import { BlogHero } from './BlogHero';
import { BlogTitleCard } from './BlogTitleCard';
import { BlogContent } from './BlogContent';
import { BlogRelated } from './BlogRelated';
import { BlogShareModal } from './BlogShareModal';
import { useBlogDetailQuery } from '../hooks/use-blogs';
import { useTranslations } from 'next-intl';
import { AppIcon } from '@/shared/icons';

interface BlogDetailClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export function BlogDetailClient({ post: initialPost, relatedPosts }: BlogDetailClientProps) {
  const t = useTranslations('blogs');
  const { data: post, isPending } = useBlogDetailQuery(initialPost.id);

  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const shareInputRef = useRef<HTMLInputElement>(null);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareClick = (platform: string) => {
    if (!post) return;
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(post.title);
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const activePost = post || initialPost;

  if (isPending && !activePost) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col items-center justify-center pt-32">
        <AppIcon name="loading" className="w-8 h-8 animate-spin text-primary-500 mb-2" />
        <span className="text-sm font-medium text-stone-400">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-950 min-h-screen font-sans pb-2 text-stone-900 dark:text-stone-100 transition-colors">
      
      {/* Dynamic Nav Offset */}
      <div className="h-20 md:h-24" />

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl pt-8">
        
        {/* Back and Share Navigation Header */}
        <BlogHeader onShareClick={() => setShowShareModal(true)} />

        {/* Hero Visual Banner */}
        <BlogHero image={activePost.image} title={activePost.title} />

        {/* Overlapping Content Title Card */}
        <BlogTitleCard 
          category={activePost.category}
          title={activePost.title}
          authorAvatar={activePost.authorAvatar}
          author={activePost.author}
          date={activePost.date}
        />

        {/* Article Core Content */}
        <BlogContent post={activePost} />

      </div>

      {/* Recommended Posts section */}
      <BlogRelated relatedPosts={relatedPosts} />

      {/* Newsletter Subscription Banner */}
      <section className="container mx-auto px-4 md:px-8 max-w-6xl pt-4 pb-8 my-2">
        <div className="bg-[#DE7A41] rounded-[2.5rem] p-8 md:p-14 text-white text-center relative overflow-hidden shadow-lg shadow-orange-700/10">
          
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight leading-none">
            {t('newsletterTitle')}
          </h3>
          <p className="text-white/90 max-w-lg mx-auto text-sm md:text-base mb-8 font-medium">
            {t('newsletterSubtitle')}
          </p>

          <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder={t('emailPlaceholder')} 
              className="flex-grow px-5 py-3.5 rounded-xl text-stone-900 outline-none shadow-sm bg-white text-sm"
              required
            />
            <button 
              type="submit"
              className="bg-stone-950 hover:bg-stone-900 text-white px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-colors whitespace-nowrap shadow-md cursor-pointer"
            >
              {t('subscribe')}
            </button>
          </form>
        </div>
      </section>

      {/* Share Modal Dialog */}
      <BlogShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postTitle={activePost.title}
        currentUrl={currentUrl}
        onShareClick={handleShareClick}
        onCopyLink={handleCopyLink}
        copied={copied}
        shareInputRef={shareInputRef}
      />

    </div>
  );
}
