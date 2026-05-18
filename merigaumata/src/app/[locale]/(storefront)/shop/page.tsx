import { ChevronRight } from 'lucide-react';
import { ProductCard } from '@/features/products/components/ProductCard';
import { getTranslations } from 'next-intl/server';
import { Pagination } from '@/shared/components/Pagination';
import { Link } from '@/i18n/navigation';
import { ShippingBanner } from '@/shared/components/ShippingBanner';
import { FiltersSidebar, MobileFilterButton } from '@/features/products/components/FiltersSidebar';
import { ProductSort } from '@/features/products/components/ProductSort';
import { productsService } from '@/features/products/services/products.service';
import { ProductQueryInput } from '@/features/products/schemas/products.schema';

export default async function ShopPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const currentPage = parseInt(searchParams?.page as string) || 1;
  const itemsPerPage = 9; // 3 columns x 3 rows
  
  // Fetch all products for calculating category counts and available filters
  const [allProductsData, filters] = await Promise.all([
    productsService.getProducts(),
    productsService.getProductFilters()
  ]);

  const allProducts = allProductsData.products;

  // Compute total counts per category from the entire product catalog
  const categoryCounts = allProducts.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Parse filter params
  const categoryParam = searchParams?.category as string | undefined;
  const minPriceParam = searchParams?.minPrice as string | undefined;
  const maxPriceParam = searchParams?.maxPrice as string | undefined;
  const sortByParam = searchParams?.sortBy as string | undefined;
  
  const selectedCategories = categoryParam ? categoryParam.split(',').filter(Boolean) : [];
  const minPrice = minPriceParam ? parseFloat(minPriceParam) : undefined;
  const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : undefined;

  // Query products via localized high-performance service layer
  const { products, total } = await productsService.getProducts({
    page: currentPage,
    limit: itemsPerPage,
    category: selectedCategories.length > 0 ? selectedCategories[0] : undefined, // Matches single selection or custom routing
    sortBy: (sortByParam as ProductQueryInput['sortBy']) || 'featured'
  });

  // Client-side dual validation fallback filter for advanced sub-selections
  let displayProducts = products;
  if (selectedCategories.length > 1) {
    // If multiple categories are chosen, filter them client side
    displayProducts = allProducts.filter(p => 
      selectedCategories.some(cat => cat.toLowerCase() === p.category.toLowerCase())
    );
  }
  
  if (minPrice !== undefined && !isNaN(minPrice)) {
    displayProducts = displayProducts.filter(p => p.price >= minPrice);
  }
  
  if (maxPrice !== undefined && !isNaN(maxPrice)) {
    displayProducts = displayProducts.filter(p => p.price <= maxPrice);
  }

  // Adjust page size slices for manual sub-selections
  const finalDisplay = selectedCategories.length > 1 || minPrice !== undefined || maxPrice !== undefined
    ? displayProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : displayProducts;

  const totalCount = selectedCategories.length > 1 || minPrice !== undefined || maxPrice !== undefined
    ? displayProducts.length
    : total;

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  const t = await getTranslations('products');
  
  return (
    <div className="pt-24 pb-24 bg-background text-foreground min-h-screen transition-colors duration-300">
      
      {/* Reusable Top egg-plant Colored Shipping Banner */}
      <ShippingBanner className="mb-6" />
 
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-tertiary-600 dark:text-tertiary-300 mb-8 pt-4">
          <Link href="/" className="hover:text-tertiary-900 dark:hover:text-tertiary-50">{t('breadcrumbHome')}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-tertiary-900 dark:text-tertiary-50 font-medium tracking-wide">{t('breadcrumbShop')}</span>
        </div>
 
        <div className="flex flex-col lg:flex-row gap-10">
          
          <FiltersSidebar categories={filters.categories} categoryCounts={categoryCounts} />
 
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-stone-200/20 dark:border-stone-850/20 lg:border-none lg:pb-0">
              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <h2 className="text-lg font-bold text-tertiary-900 dark:text-tertiary-50">
                  {t('results', { count: totalCount })}
                </h2>
                
                <MobileFilterButton />
              </div>
              
              <ProductSort />
            </div>
 
            {/* Product Grid */}
            {finalDisplay.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 mb-12">
                {finalDisplay.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-stone-500 dark:text-stone-400 font-serif">
                {t('noProducts')}
              </div>
            )}

            <Pagination totalPages={totalPages} currentPage={currentPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
