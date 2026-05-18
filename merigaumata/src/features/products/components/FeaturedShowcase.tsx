import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import FeaturedProductsCarousel from './FeaturedProductsCarousel';
import { productsService } from '@/features/products/services/products.service';

export default async function FeaturedShowcase() {
  const t = await getTranslations('home.featuredShowcase');
  const featuredProducts = await productsService.getFeaturedProducts();

  return (
    <section className="py-24 bg-background transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-tertiary-900 dark:text-neutral-100 uppercase tracking-tight mb-4">
            {t('title')}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg md:text-xl font-medium leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - 70% (Client Carousel) */}
          <FeaturedProductsCarousel products={featuredProducts} />

          {/* Right Column - 30% (Static Category Highlights) */}
          <div className="w-full lg:w-[30%] flex flex-col sm:flex-row lg:flex-col gap-6 select-none" style={{ minHeight: "100%" }}>
            
            {/* Card 1: Featured Category Text Block */}
            <div className="flex-1 rounded-[2.5rem] bg-earth-50 dark:bg-neutral-900 border border-earth-200 dark:border-neutral-800 p-8 flex flex-col justify-center relative overflow-hidden transition-all duration-300 shadow-sm min-h-[250px] lg:min-h-[0] hover:shadow-md hover:border-primary-300">
              <h4 className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-3 font-sans">
                Featured Category
              </h4>
              <h3 className="text-2xl lg:text-3xl font-serif font-bold text-tertiary-900 dark:text-neutral-100 mb-4 tracking-tight leading-none">
                Dairy & Nutrition
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                Pure, fresh, and ethically sourced A2 dairy products from native Indian cow breeds.
              </p>
            </div>

            {/* Card 2: Featured Image Overlay Block */}
            <div className="flex-1 rounded-[2.5rem] overflow-hidden relative shadow-sm min-h-[250px] lg:min-h-[0] group bg-neutral-100 dark:bg-neutral-900 hover:shadow-md transition-shadow">
              <Image
                src="https://picsum.photos/seed/cat-spirit2/600/600"
                alt="Spiritual Wellness Category"
                fill
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 z-10 text-white drop-shadow-md">
                <h4 className="font-serif text-xl font-bold mb-1 tracking-tight">Spiritual Wellness</h4>
                <p className="text-sm text-neutral-200 font-medium line-clamp-2 leading-relaxed">
                  Natural and sacred items for your daily rituals, meditation, and purification.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
