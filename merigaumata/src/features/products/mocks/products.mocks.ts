import { Product, ProductWithDetails, ShopFilters, Review, ProductVariant, VariantCopy } from '../types/products.types';

export const MOCK_PRODUCTS: Product[] = [
  ...Array.from({ length: 24 }).map((_, i) => {
    const categories = ['Dairy', 'Agriculture', 'Spiritual', 'Wellness'];
    const id = `p${i + 1}`;
    const mrp = 10 + (i * 5);
    const price = Number((mrp * 0.8).toFixed(2));
    const stock = i % 5 === 0 ? 0 : i % 3 === 0 ? 5 : 50; 
    
    return {
      id,
      name: `Product ${i + 1}`,
      slug: `product-${i + 1}`,
      price,
      mrp,
      description: `Description for product ${i + 1}. Authentic and natural.`,
      imageUrl: `https://picsum.photos/seed/product${i}/600/600`,
      category: categories[i % categories.length],
      stock,
      featured: i % 4 === 0,
      rating: 4.0 + (i % 10) / 10,
      reviewsCount: 10 + i * 2,
      createdAt: i < 5 ? new Date().toISOString() : '2025-12-01T00:00:00Z',
      isSale: i % 2 === 0,
    };
  })
];

export const MOCK_SHOP_FILTERS: ShopFilters = {
  categories: ['Dairy', 'Agriculture', 'Spiritual', 'Wellness'],
  benefits: ['Purity & Daily Nutrition', 'Organic Plant Growth', 'Calmness & Meditative Spirit', 'Skin & Hair Nourishment', 'Vedic Daily Rituals']
};

export const getCategorySpecificReviews = (productId: string, category: string): Review[] => {
  const isDairy = category?.toLowerCase() === 'dairy';
  const isWellness = category?.toLowerCase() === 'wellness';
  
  return [
    {
      id: `${productId}-r1`,
      name: 'Isabella P.',
      rating: 5,
      date: 'Today',
      verified: true,
      text: isDairy 
        ? "Absolutely love this pure A2 Ghee! It has an incredibly rich aroma and traditional grainy texture that smells just like my grandmother's home-churned ghee. Pure heaven on warm rotis, will definitely buy again!" 
        : isWellness 
        ? "This wellness oil feels so lightweight and absorbs beautifully into my skin without leaving a heavy, sticky white cast. It leaves a gorgeous soft dewy finish and is packed with rich natural ingredients. Highly recommend!" 
        : "The fragrance of this sacred dhoop is incredibly soothing and creates a serene, meditative atmosphere. It burns cleanly without producing any harsh chemical smoke. Absolutely wonderful for my daily prayers.",
      images: [`https://picsum.photos/seed/review1-${productId}/200/200`, `https://picsum.photos/seed/review2-${productId}/200/200`],
      helpfulCount: 83,
      unhelpfulCount: 1
    },
    {
      id: `${productId}-r2`,
      name: 'Liam S.',
      rating: 5,
      date: 'Yesterday',
      verified: true,
      text: isDairy
        ? "The flavor is unmatched. You can taste the purity and care that went into sourcing this ghee. The grainy texture is perfect and it enhances the taste of everything I cook. High quality Vedic preparation!"
        : isWellness
        ? "I have incredibly sensitive skin, and this has been a lifesaver. Extremely calming, reduces irritation, and smells beautifully subtle. It provides clean hydration that lasts all day long."
        : "The premium packaging and authentic aroma make this a perfect spiritual gift. It creates an authentic temple-like vibe right at home. The scent lingers gently long after the prayers are finished.",
      images: [],
      helpfulCount: 24,
      unhelpfulCount: 0
    },
    {
      id: `${productId}-r3`,
      name: 'Ethan R.',
      rating: 4,
      date: '3 days ago',
      verified: true,
      text: "This product is an absolute game-changer! It's lightweight, beautifully constructed, and has visibly improved the texture and brightness of my daily ritual. The clean organic ingredients give me peace of mind.",
      images: [`https://picsum.photos/seed/review3-${productId}/200/200`],
      helpfulCount: 12,
      unhelpfulCount: 0
    }
  ];
};

export const getSizesForCategory = (category: string): string[] => {
  switch (category?.toLowerCase()) {
    case 'dairy':
      return ['250g', '500g', '1kg'];
    case 'wellness':
      return ['50ml', '100ml', '200ml'];
    case 'spiritual':
      return ['1 Pack', '3 Pack', '5 Pack'];
    case 'agriculture':
      return ['1kg', '5kg', '10kg'];
    default:
      return ['Standard', 'Family Pack'];
  }
};

export const getVariantsForProduct = (price: number, category: string): ProductVariant[] => {
  const isDairy = category?.toLowerCase() === 'dairy';
  const isWellness = category?.toLowerCase() === 'wellness';
  const isSpiritual = category?.toLowerCase() === 'spiritual';
  const isAgriculture = category?.toLowerCase() === 'agriculture';

  return [
    {
      id: 'full',
      label: 'Full Size',
      price: price,
      volume: isDairy 
        ? '1000g / 35.2 oz' 
        : isWellness 
        ? '50 ml / 1.7fl oz' 
        : isSpiritual 
        ? '5 Pack / 5.0 fl oz' 
        : isAgriculture 
        ? '10 kg / 22 lbs' 
        : '50 ml / 1.7fl oz'
    },
    {
      id: 'mini',
      label: 'Mini Size',
      price: price * 0.6,
      volume: isDairy 
        ? '500g / 17.6 oz' 
        : isWellness 
        ? '10 ml / 1.7fl oz' 
        : isSpiritual 
        ? '1 Pack / 1.0 fl oz' 
        : isAgriculture 
        ? '5 kg / 11 lbs' 
        : '10 ml / 1.7fl oz'
    }
  ];
};

export const getVariantCopy = (variantId: string, category: string, baseDescription: string, productName: string): VariantCopy => {
  const isFull = variantId === 'full';
  const isDairy = category?.toLowerCase() === 'dairy';
  const isWellness = category?.toLowerCase() === 'wellness';
  const isSpiritual = category?.toLowerCase() === 'spiritual';
  const isAgriculture = category?.toLowerCase() === 'agriculture';

  if (isFull) {
    return {
      description: `${baseDescription} Prepared under Vedic purity standards directly on our Vrindavan Goshala sanctuary farmlands. Every purchase directly funds cow lifetime feeding and protection, sustaining organic traditional heritage welfare programs.`,
      detail: `Handcrafted manually using standard slow-heating traditional protocols. Packaged in a beautiful, heavy-duty sustainable container designed to preserve raw nutrients, maximize natural shelf life, and shield bioactive elements from oxidation.`,
      benefits: isDairy
        ? "Highly rich in fat-soluble vitamins (A, D, E, K), CLA, and butyric acid. Boosts digestive fire (Agni), deeply nourishes bodily tissues (Ojas), and elevates immune response."
        : isWellness
        ? "Deeply penetrating herbal nutrients, highly rich in pure cold-pressed extracts. Rejuvenates cellular integrity, balances skin/hair moisture, and promotes soothing cellular health."
        : isSpiritual
        ? "Long-burning aromatic premium rods. Fills your sanctuary with highly dense, calming traditional botanical smoke. Relieves physical stress, aids deep meditation, and purifies space."
        : "Nourishes micro-organic soil flora, accelerates nitrogen absorption, and builds natural plant immunity. Restores damaged agricultural properties cleanly.",
      delivery: "Standard premium shipping. Ships in our heavy-duty sustainable signature packaging within 2-3 business days. Free shipping included for full-size orders. 100% eligible for full refunds within 15 days if unopened."
    };
  } else {
    return {
      description: `Perfect trial or pocket-friendly travel companion! Enjoy the exact same sacred Vedic purity of our organic ${productName} in a compact, portable format. Ideal for testing quality first-hand or gifting loved ones.`,
      detail: `The identical premium Vedic recipe packaged in a light, travel-safe eco-pouch. Specifically tailored to reduce carbon footprint, prevent transport spills, and suit modern, active on-the-go lifestyles perfectly.`,
      benefits: isDairy
        ? "Highly portable, travel-friendly Vedic nutrition. An excellent cost-effective way to sample the exceptional texture, deep aroma, and golden granules of our traditional preparation."
        : isWellness
        ? "Convenient travel-sized bottle. Easily slips into your bag or travel kit for instantaneous herbal rejuvenation, daily skin hydration, or aromatic relief on the go."
        : isSpiritual
        ? "Perfect introductory incense pack. Contains a curated selection of meditative rods, perfect for quick morning rituals, compact altar spaces, or trial testing."
        : "Compact sample pack. Perfect for indoor potted plants, balcony herbs, or testing organic efficacy before ordering large bulk agricultural bags.",
      delivery: "Sustainable lightweight packaging. Ships within 3-4 business days. Flat-rate standard shipping applies. Eligible for returns or replacements within 7 days from delivery date if unopened."
    };
  }
};

export const getProductWithDetails = (product: Product): ProductWithDetails => {
  const productIndex = Number(product.id.replace('p', '')) || 1;
  const galleryImages = [
    product.imageUrl,
    `https://picsum.photos/seed/product-detail-${productIndex}-angle1/600/600`,
    `https://picsum.photos/seed/product-detail-${productIndex}-angle2/600/600`,
    `https://picsum.photos/seed/product-detail-${productIndex}-angle3/600/600`,
    `https://picsum.photos/seed/product-detail-${productIndex}-angle4/600/600`,
  ];

  const sizes = getSizesForCategory(product.category);
  const variants = getVariantsForProduct(product.price, product.category);
  const variantCopies = {
    full: getVariantCopy('full', product.category, product.description, product.name),
    mini: getVariantCopy('mini', product.category, product.description, product.name)
  };

  return {
    ...product,
    galleryImages,
    sizes,
    variants,
    variantCopies
  };
};
