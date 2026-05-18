'use client';

import Image from 'next/image';
import { BlogPost } from '../types/blogs.types';

interface BlogContentProps {
  post: BlogPost;
}

export function BlogContent({ post }: BlogContentProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-12 md:pt-16 pb-16">
      <article className="flex flex-col gap-8 text-stone-700 dark:text-neutral-300 leading-relaxed font-sans text-base sm:text-lg">
        
        {/* First paragraph */}
        <p className="text-stone-700 dark:text-neutral-300 font-medium">
          {post.subheading1Text}
        </p>

        {/* Double quote style matching reference screenshot exactly */}
        {post.quote && (
          <div className="my-8 py-4 relative pl-8 border-l-0">
            {/* Large double quote character */}
            <span className="absolute left-0 top-0 text-[#DE7A41] text-5xl font-serif leading-none select-none">
              “
            </span>
            
            <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-wide font-sans leading-snug">
              {post.quote}
            </h3>
            {post.quoteAuthor && (
              <p className="text-xs font-bold text-stone-400 dark:text-stone-500 mt-2">
                - {post.quoteAuthor}
              </p>
            )}
          </div>
        )}

        {/* Subheading 1 */}
        {post.subheading1 && (
          <h2 className="text-xl sm:text-2.5xl font-extrabold text-stone-955 dark:text-white tracking-tight mt-6 leading-tight font-sans">
            {post.subheading1}
          </h2>
        )}

        {/* Inline Content Media Frame */}
        {post.inlineImage && (
          <div className="my-8 flex flex-col gap-3">
            <div className="relative w-full h-[30vh] sm:h-[45vh] rounded-2xl overflow-hidden shadow-md border border-stone-100 dark:border-neutral-800">
              <Image 
                src={post.inlineImage}
                alt={post.title}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
            <span className="text-xs text-stone-400 dark:text-stone-500 font-semibold text-center">
              Caring for our rescued calves in the nursery pasture.
            </span>
          </div>
        )}

        {/* Subheading 2 */}
        {post.subheading2 && (
          <h2 className="text-xl sm:text-2.5xl font-extrabold text-stone-955 dark:text-white tracking-tight mt-4 leading-tight font-sans">
            {post.subheading2}
          </h2>
        )}

        {/* Subheading 2 Text */}
        <p className="text-stone-700 dark:text-neutral-300">
          {post.subheading2Text}
        </p>

        {/* Conclusion text */}
        <p className="text-stone-700 dark:text-neutral-300">
          By returning to our ancient roots and adapting these organic Vedic practices, we secure not only superior health for our families but also ensure that indigenous cattle breeds remain protected. We invite you to volunteer at our goshala and experience first-hand the divine harmony of cow protection.
        </p>

        {/* Tags section matching screenshot pills */}
        <div className="flex flex-wrap gap-2.5 pt-8 mt-4 border-t border-stone-100 dark:border-neutral-800">
          {post.tags.map((tag) => (
            <span 
              key={tag} 
              className="px-3.5 py-1.5 rounded-lg bg-stone-100 dark:bg-neutral-800 text-stone-705 dark:text-neutral-300 font-semibold text-xs md:text-sm hover:bg-stone-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              {tag.toLowerCase()}
            </span>
          ))}
        </div>

      </article>
    </div>
  );
}
