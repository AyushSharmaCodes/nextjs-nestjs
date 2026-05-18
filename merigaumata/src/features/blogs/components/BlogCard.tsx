import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Clock } from 'lucide-react';
import { BlogPost } from '../types/blogs.types';

interface BlogCardProps {
  post: BlogPost;
  variant?: 'large' | 'small';
}

export default function BlogCard({ post, variant = 'small' }: BlogCardProps) {
  const { id, image, category, title, excerpt, date, featured } = post;
  const href = `/blog/${id}`;

  if (variant === 'large') {
    return (
      <Link href={href} className="flex flex-col h-full rounded-[2rem] overflow-hidden bg-[#3B543D] dark:bg-[#1A221C] border border-[#2E4230] dark:border-[#2C3A2E] group shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="relative w-full aspect-[4/3] overflow-hidden shrink-0">
          <Image 
            src={image} 
            alt={title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-700" 
            sizes="(max-width: 1024px) 100vw, 50vw"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-5 left-5 z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-bold tracking-[0.15em] uppercase text-white shadow-sm">
              {category}
            </span>
          </div>
        </div>
        <div className="p-8 flex flex-col flex-grow text-white">
          <h3 className="text-3xl font-serif font-bold mb-4 leading-[1.3] group-hover:text-primary-300 transition-colors">
            {title}
          </h3>
          {excerpt && (
            <p className="text-white/80 text-sm font-medium leading-relaxed mb-8 flex-grow line-clamp-3">
              {excerpt}
            </p>
          )}
          <div className="flex items-center gap-2 text-white/50 text-[11px] font-bold uppercase tracking-widest mt-auto">
            <Clock size={14} className="shrink-0" />
            <span>{date}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="flex flex-col gap-5 group h-full">
      <div className="relative w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden shadow-sm shrink-0">
        <Image 
          src={image} 
          alt={title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 30vw"
          referrerPolicy="no-referrer" 
        />
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-block px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-[0.15em] uppercase text-white shadow-sm">
            {category}
          </span>
        </div>
      </div>
      <div className="flex flex-col flex-grow">
        <h3 className="text-xl font-serif font-bold text-tertiary-900 dark:text-neutral-100 mb-3 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
          {title}
        </h3>
        {excerpt && (
          <p className="text-foreground/70 dark:text-neutral-400 text-sm leading-relaxed mb-4 line-clamp-2">
            {excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 text-foreground/50 dark:text-neutral-500 text-[11px] font-bold uppercase tracking-widest mt-auto pt-1">
          <Clock size={14} className="shrink-0" />
          <span>{date}</span>
        </div>
      </div>
    </Link>
  );
}
