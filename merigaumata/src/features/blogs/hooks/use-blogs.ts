'use client';

import { useState, useMemo, useEffect, startTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BlogPost } from '../types/blogs.types';
import { blogsService } from '../services/blogs.service';
import { logError } from '@/shared/lib/errors';

export interface UseBlogsProps {
  initialPosts: BlogPost[];
  itemsPerPage?: number;
}

export const blogKeys = {
  all: ['blogs'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...blogKeys.details(), String(id)] as const,
};

export function useBlogDetailQuery(id: string | number) {
  return useQuery({
    queryKey: blogKeys.detail(id),
    queryFn: () => blogsService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBlogs({ initialPosts = [], itemsPerPage = 6 }: UseBlogsProps) {
  const [posts] = useState<BlogPost[]>(initialPosts);
  const [currentPage, setCurrentPageState] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [readLaterIds, setReadLaterIds] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const totalPages = Math.ceil(posts.length / itemsPerPage);
  const featuredPosts = useMemo(() => posts.filter((post) => post.featured), [posts]);

  // Read bookmarks from localStorage after mounting (hydration safety)
  useEffect(() => {
    const stored = localStorage.getItem('readLater');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        Promise.resolve().then(() => {
          setReadLaterIds(parsed);
        });
      } catch (e: unknown) {
        logError(e, { component: 'useBlogs', action: 'parse_bookmarks' });
      }
    }
  }, []);

  // Slide rotation interval logic
  useEffect(() => {
    if (featuredPosts.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredPosts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredPosts.length]);

  const toggleReadLater = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();

    setReadLaterIds((prev) => {
      const isSaved = prev.includes(id);
      const newIds = isSaved ? prev.filter((i) => i !== id) : [...prev, id];
      localStorage.setItem('readLater', JSON.stringify(newIds));
      return newIds;
    });
  };

  const handleShare = (e: React.MouseEvent, platform: string, title: string, id: number) => {
    e.preventDefault();
    e.stopPropagation();

    const url = encodeURIComponent(window.location.origin + `/blog/${id}`);
    const text = encodeURIComponent(`Check out this article: ${title}`);

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    } else if (navigator.share) {
      navigator.share({
        title,
        url: window.location.origin + `/blog/${id}`,
      }).catch((err) => {
        logError(err, { component: 'useBlogs', action: 'share' });
      });
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % featuredPosts.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length);

  const setCurrentPage = (page: number) => {
    setIsTransitioning(true);
    startTransition(() => {
      setCurrentPageState(page);
    });
    // Set simulated skeleton transitions safely outside React 19 transition callback
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 350);
    return () => clearTimeout(timer);
  };

  const currentPosts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return posts.slice(start, start + itemsPerPage);
  }, [posts, currentPage, itemsPerPage]);

  return {
    posts,
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
  };
}
