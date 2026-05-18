import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { productsService } from '@/features/products/services/products.service';
import { contactService } from '@/features/contact/services/contact.service';
import { ProductDetailClient } from '@/features/products/components/ProductDetailClient';

interface ProductPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await productsService.getProductById(id);

  if (!product) {
    return {
      title: 'Product Not Found | MeriGauMata',
      description: 'The requested product could not be located in our sacred Vedic database.',
    };
  }

  return {
    title: `${product.name} - Pure Sacred Offerings | MeriGauMata`,
    description: `${product.description} Sourced ethically from our goshala. Traditional Vedic quality.`,
    openGraph: {
      title: `${product.name} | MeriGauMata`,
      description: product.description,
      images: [{ url: product.imageUrl }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, id } = await params;
  
  // Set the locale for next-intl server-side processing
  setRequestLocale(locale);

  // Parallel fetch for active item and the entire catalog for related suggestions
  const [product, allProductsData] = await Promise.all([
    productsService.getProductById(id),
    productsService.getProducts(),
  ]);

  if (!product) {
    notFound();
  }

  // Fetch initial reviews and FAQs in parallel
  const [initialReviews, faqs] = await Promise.all([
    productsService.getProductReviews(product.id, product.category),
    contactService.getGeneralFaqs(),
  ]);

  return (
    <ProductDetailClient 
      product={product} 
      allProducts={allProductsData.products} 
      initialReviews={initialReviews}
      faqs={faqs}
    />
  );
}
