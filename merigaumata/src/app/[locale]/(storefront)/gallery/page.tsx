import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { galleryService } from '@/features/gallery/services/gallery.service';
import { GalleryView } from '@/features/gallery/components/GalleryView';

export default async function GalleryPage() {
  const t = await getTranslations('gallery');
  
  // High-performance server-side data prefetching, indexable by cralwers & zero layout shifts
  const galleries = await galleryService.getAll();

  return (
    <div className="pt-24 pb-20 bg-[#FAFAFA] min-h-screen font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm mb-6 text-gray-500">
          <Link href="/" className="hover:text-primary-600 transition-colors">{t('breadcrumbHome')}</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-primary-600 font-medium whitespace-nowrap">{t('breadcrumbGallery')}</span>
        </nav>

        {/* Header */}
        <div className="mb-10 inline-block">
          <h1 className="text-3xl md:text-[2.5rem] leading-tight font-bold text-tertiary-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-tertiary-600 max-w-4xl">
            {t('subtitle')}
          </p>
        </div>

        {/* Interactive Gallery Component Tree */}
        <GalleryView initialGalleries={galleries} />

      </div>
    </div>
  );
}
