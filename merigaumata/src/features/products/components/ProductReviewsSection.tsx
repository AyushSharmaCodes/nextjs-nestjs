'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, Search, ThumbsUp, ThumbsDown, Check, PenTool } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ReviewInput, reviewSchema } from '../schemas/products.schema';
import { useProductReviews, useCreateReview } from '../hooks/use-products';
import { Review } from '../types/products.types';
import { logError } from '@/shared/lib/errors';

interface ProductReviewsSectionProps {
  productId: string;
  category: string;
  initialReviews: Review[];
  productRating?: number;
}

export function ProductReviewsSection({ 
  productId, 
  category, 
  initialReviews, 
  productRating = 4.9 
}: ProductReviewsSectionProps) {
  const t = useTranslations('products');
  
  // States
  const [reviewSearchQuery, setReviewSearchQuery] = useState<string>('');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('all');
  const [reviewsSortOrder, setReviewsSortOrder] = useState<string>('relevant');
  const [isWriteOpen, setIsWriteOpen] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);

  // TanStack Query for dynamic reviews listing & syncing
  const { data: reviewsData, isLoading } = useProductReviews(productId, category);
  const activeReviews = reviewsData || initialReviews;

  // Review submission mutation
  const createReviewMutation = useCreateReview(productId);

  // React Hook Form for premium client validation
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    reset,
    formState: { errors } 
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      name: '',
      text: ''
    }
  });

  const ratingWatch = watch('rating');

  const onSubmit = async (data: ReviewInput) => {
    try {
      await createReviewMutation.mutateAsync(data);
      setSubmissionSuccess(true);
      reset();
      setTimeout(() => {
        setIsWriteOpen(false);
        setSubmissionSuccess(false);
      }, 3000);
    } catch (err) {
      logError(err, { component: 'ProductReviewsSection', action: 'submit' });
    }
  };

  const handleHelpfulClick = (reviewId: string, isUp: boolean) => {
    // Simulated micro interaction
  };

  // Filtered reviews list
  const filteredReviews = activeReviews.filter(rev => {
    const matchesSearch = rev.text.toLowerCase().includes(reviewSearchQuery.toLowerCase()) || 
                          rev.name.toLowerCase().includes(reviewSearchQuery.toLowerCase());
    const matchesRating = selectedRatingFilter === 'all' || rev.rating === Number(selectedRatingFilter);
    return matchesSearch && matchesRating;
  });

  const totalReviewsCount = activeReviews.length;

  return (
    <div className="border-t border-stone-200 dark:border-stone-800 pt-16 mb-20">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-3xl font-serif font-bold text-[#2E1F30] dark:text-stone-100">
          {t('review.reviews')}
        </h2>
        
        <button
          onClick={() => setIsWriteOpen(!isWriteOpen)}
          className="flex items-center gap-2 border border-[#2E1F30] dark:border-[#E2EBCE] hover:bg-stone-50 dark:hover:bg-stone-950 text-[#2E1F30] dark:text-[#E2EBCE] font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-full transition-all cursor-pointer"
        >
          <PenTool className="w-3.5 h-3.5" />
          {t('review.writeReview')}
        </button>
      </div>

      {/* Review Submission Dialog/Form */}
      {isWriteOpen && (
        <div className="mb-12 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800/80 p-6 sm:p-8 rounded-3xl shadow-sm max-w-xl animate-fade-in">
          {submissionSuccess ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-4 border border-green-200/50">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#2E1F30] dark:text-white text-base mb-2">{t('review.success')}</h3>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <h3 className="font-serif font-bold text-xl text-[#2E1F30] dark:text-white mb-2">
                {t('review.writeReview')}
              </h3>

              {/* Rating selection stars */}
              <div>
                <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-2">
                  {t('review.yourRating')}
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setValue('rating', star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          star <= ratingWatch 
                            ? 'fill-amber-500 text-amber-500' 
                            : 'text-stone-200 dark:text-stone-850'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                {errors.rating && (
                  <p className="text-red-500 text-xs mt-1">{t('validation.ratingMin')}</p>
                )}
              </div>

              {/* Name input */}
              <div>
                <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-2">
                  {t('review.yourName')}
                </label>
                <input 
                  type="text" 
                  {...register('name')}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#1B8057]"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{t('validation.nameMin')}</p>
                )}
              </div>

              {/* Review input */}
              <div>
                <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-2">
                  {t('review.yourReview')}
                </label>
                <textarea 
                  rows={4}
                  {...register('text')}
                  placeholder="Tell us about your experience with this product"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-xl text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#1B8057] resize-none"
                />
                {errors.text && (
                  <p className="text-red-500 text-xs mt-1">{t('validation.textMin')}</p>
                )}
              </div>

              {/* Submit triggers */}
              <button
                type="submit"
                disabled={createReviewMutation.isPending}
                className="w-full bg-[#2E1F30] hover:bg-[#432d46] text-white font-bold text-xs uppercase tracking-widest py-3 px-8 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {createReviewMutation.isPending ? t('review.submitting') : t('review.submitReview')}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-12">
        
        {/* Reviews Score Box */}
        <div className="md:col-span-4 bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800/50 p-6 rounded-3xl flex flex-col items-center text-center shadow-xs">
          <span className="text-5xl font-extrabold text-[#2E1F30] dark:text-stone-100 mb-2">
            {productRating.toFixed(1)}
          </span>
          <div className="flex items-center gap-0.5 mb-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-4 h-4 fill-amber-500 text-amber-500" />
            ))}
          </div>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
            Based on {totalReviewsCount + 211} reviews
          </span>
        </div>

        {/* Rating distribution bar charts */}
        <div className="md:col-span-8 space-y-2.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            let percent = 0;
            let count = 0;
            if (stars === 5) { percent = 86; count = 182; }
            else if (stars === 4) { percent = 11; count = 34; }
            else if (stars === 3) { percent = 2; count = 8; }
            else if (stars === 2) { percent = 1; count = 0; }
            else if (stars === 1) { percent = 0; count = 0; }

            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-xs font-bold text-stone-600 dark:text-stone-400 w-3">{stars}★</span>
                <div className="flex-1 h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-[#2E1F30] dark:bg-amber-500" 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <span className="text-[11px] font-bold text-stone-500 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>

      </div>

      {/* Search reviews & filters widgets */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800/50 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        
        {/* Search inputs */}
        <div className="relative w-full md:max-w-xs flex items-center bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-full px-4 py-2">
          <Search className="w-4 h-4 text-stone-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search reviews..." 
            value={reviewSearchQuery}
            onChange={(e) => setReviewSearchQuery(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none text-stone-800 dark:text-stone-200"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select 
            value={reviewsSortOrder}
            onChange={(e) => setReviewsSortOrder(e.target.value)}
            className="bg-white dark:bg-stone-900 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 rounded-full px-4 py-2 focus:outline-none cursor-pointer"
          >
            <option value="relevant">Most Relevant</option>
            <option value="recent">Newest Reviews</option>
          </select>

          <select 
            value={selectedRatingFilter}
            onChange={(e) => setSelectedRatingFilter(e.target.value)}
            className="bg-white dark:bg-stone-900 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 rounded-full px-4 py-2 focus:outline-none cursor-pointer"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars only</option>
            <option value="4">4 Stars only</option>
          </select>

          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1.5 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            With Media Content
          </span>
        </div>

      </div>

      {/* Dynamic reviews list rendering */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-12 text-stone-500 text-sm font-light">Loading reviews...</div>
        ) : filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => (
            <div key={rev.id} className="border-b border-stone-200/40 dark:border-stone-800/40 pb-6 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-3.5 h-3.5 ${
                        star <= rev.rating 
                          ? 'fill-[#2E1F30] text-[#2E1F30]' 
                          : 'text-stone-200 dark:text-stone-800'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-stone-500">{rev.date}</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">{rev.name}</span>
                {rev.verified && (
                  <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <Check className="w-2.5 h-2.5" />
                    {t('review.verifiedPurchase')}
                  </span>
                )}
              </div>

              <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm font-light leading-relaxed mb-4">
                {rev.text}
              </p>

              {/* Review image attachments */}
              {rev.images && rev.images.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  {rev.images.map((img, index) => (
                    <div key={index} className="relative w-16 h-16 rounded-none overflow-hidden bg-stone-100 border border-stone-200/35 flex-shrink-0">
                      <Image 
                        src={img} 
                        alt={`Review attach ${index + 1}`} 
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Review Helpfulness Voting buttons */}
              <div className="flex items-center gap-4 text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-widest">
                <span>Was this review helpful?</span>
                <button 
                  onClick={() => handleHelpfulClick(rev.id, true)}
                  className="flex items-center gap-1 hover:text-[#2E1F30] cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {rev.helpfulCount}
                </button>
                <button 
                  onClick={() => handleHelpfulClick(rev.id, false)}
                  className="flex items-center gap-1 hover:text-[#2E1F30] cursor-pointer"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  {rev.unhelpfulCount}
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-12 text-stone-500 text-sm font-light">
            No matching reviews found. Try adjusting your query or filter filters.
          </div>
        )}
      </div>

    </div>
  );
}
