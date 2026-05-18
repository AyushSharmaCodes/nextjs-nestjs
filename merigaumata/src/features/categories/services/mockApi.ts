import { Category, CategoryType } from '../types';
import { delay } from '@/lib/utils';

const STORAGE_KEY = 'admin_categories_store';

// Helper to check if running in browser
const isBrowser = () => typeof window !== 'undefined';

// Initial preseeded data for first load
const SEED_CATEGORIES: Category[] = [
  // Product Categories
  {
    id: 'prod-1',
    parentId: null,
    slug: 'organic-dairy',
    type: 'product',
    sortOrder: 1,
    isActive: true,
    itemCount: 18,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: 'Milk',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60',
    bannerImage: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1200&auto=format&fit=crop&q=80',
    translations: {
      en: { name: 'Organic Dairy Products', description: 'Fresh, nutrient-dense A2 dairy directly sourced from protected Gir cows.' },
      hi: { name: 'जैविक डेयरी उत्पाद', description: 'संरक्षित गीर गायों से सीधे प्राप्त ताजा, पोषक तत्वों से भरपूर ए2 डेयरी।' },
      ta: { name: 'ஆர்கானிக் பால் பொருட்கள்', description: 'பாதுகாக்கப்பட்ட கிர் மாடுகளிலிருந்து நேரடியாகப் பெறப்பட்ட புதிய A2 பால் பொருட்கள்.' },
      te: { name: 'సేంద్రీయ పాల ఉత్పత్తులు', description: 'రక్షిత గిర్ ఆవుల నుండి నేరుగా సేకరించిన తాజా, పోషకాలు అధికంగా ఉండే A2 పాల ఉత్పత్తులు.' }
    },
    seo: {
      title: 'A2 Organic Dairy Products - Protected Cows',
      description: 'Savor pure, unadulterated A2 milk, ghee, and paneer prepared using traditional Vedic Bilona techniques.',
      keywords: 'A2 Milk, Vedic Ghee, Organic Dairy, Gir Cows Ghee',
      ogImage: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60'
    },
    featured: true,
    commissionRate: 5,
    taxRate: 5,
    tags: ['A2 Milk', 'Bilona Ghee', 'Desi Cow'],
    attributes: ['Size', 'Packaging Type'],
    variants: [
      { name: 'Volume', options: ['500ml', '1 Litre'] },
      { name: 'Container', options: ['Glass Bottle', 'Eco Pouch'] }
    ],
    inventoryBehavior: 'track'
  },
  {
    id: 'prod-2',
    parentId: 'prod-1',
    slug: 'pure-a2-ghee',
    type: 'product',
    sortOrder: 1,
    isActive: true,
    itemCount: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: 'Flame',
    image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=500&auto=format&fit=crop&q=60',
    bannerImage: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=1200&auto=format&fit=crop&q=80',
    translations: {
      en: { name: 'Vedic Bilona Ghee', description: 'Churned from A2 curd using the ancient hand-aligned wood-paddle bilona method.' },
      hi: { name: 'वैदिक बिलोना घी', description: 'प्राचीन हाथ से बने लकड़ी के बिलोना विधि का उपयोग करके ए2 दही से मथा गया।' }
    },
    seo: {
      title: 'Vedic Bilona Ghee - Pure A2 Cow Ghee',
      description: 'Medicinal grade pure A2 Desi Cow Ghee. Handcrafted in mud pots.',
      keywords: 'Bilona Ghee, Desi Cow Ghee, Ayurvedic Ghee',
      ogImage: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=500&auto=format&fit=crop&q=60'
    },
    featured: true,
    commissionRate: 5,
    taxRate: 12,
    tags: ['Medicinal Ghee', 'Hand-churned', 'Vedic'],
    attributes: ['Weight'],
    variants: [
      { name: 'Weight', options: ['250ml', '500ml', '1000ml'] }
    ],
    inventoryBehavior: 'track'
  },
  {
    id: 'prod-3',
    parentId: null,
    slug: 'herbal-essentials',
    type: 'product',
    sortOrder: 2,
    isActive: true,
    itemCount: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: 'Leaf',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=60',
    translations: {
      en: { name: 'Herbal Wellness & Puja Essentials', description: 'Sacred dhoop, sambrani cups, and organic cow dung products for spiritual purity.' },
      hi: { name: 'हर्बल वेलनेस और पूजा सामग्री', description: 'आध्यात्मिक शुद्धता के लिए पवित्र धूप, सांब्रानी कप और जैविक गाय के गोबर के उत्पाद।' }
    },
    seo: {
      title: 'Organic Puja Essentials & Herbal Incense',
      description: '100% natural, chemical-free dhoop sticks and cow dung cakes for havans and home purification.',
      keywords: 'Cow Dung Cake, Natural Dhoop, Havan Samagri',
      ogImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=60'
    },
    featured: false,
    commissionRate: 8,
    taxRate: 18,
    tags: ['Puja Items', 'Home Purification', 'Chemical Free'],
    attributes: ['Quantity'],
    variants: [
      { name: 'Pack Size', options: ['10 Pcs', '25 Pcs'] }
    ],
    inventoryBehavior: 'ignore'
  },

  // Event Categories
  {
    id: 'event-1',
    parentId: null,
    slug: 'spiritual-satsang',
    type: 'event',
    sortOrder: 1,
    isActive: true,
    itemCount: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: 'Compass',
    image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=500&auto=format&fit=crop&q=60',
    translations: {
      en: { name: 'Divine Satsang & Bhajans', description: 'Weekly gatherings focused on Vedic chants, kirtan, and profound spiritual discourses.' },
      hi: { name: 'दिव्य सत्संग और भजन', description: 'वैदिक मंत्रों, कीर्तन और गहन आध्यात्मिक प्रवचनों पर केंद्रित साप्ताहिक सभाएं।' }
    },
    seo: {
      title: 'Divine Satsangs and Vedic Discourses near You',
      description: 'Join our uplifting satsang events to experience mental peace, divine singing, and ancient wisdom sharing.',
      keywords: 'Satsang, Vedic Bhajans, Kirtan Meetup, Spiritual Discourses'
    },
    eventType: 'satsang',
    categoryColor: '#D97706', // Amber gold
    audienceType: 'all',
    setupType: 'hybrid',
    recurrence: 'weekly'
  },
  {
    id: 'event-2',
    parentId: null,
    slug: 'goshala-seva',
    type: 'event',
    sortOrder: 2,
    isActive: true,
    itemCount: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: 'Heart',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=60',
    translations: {
      en: { name: 'Goshala Seva & Volunteering', description: 'Hands-on opportunities to serve our holy cows, clean stalls, and plant organic fodder.' },
      hi: { name: 'गौशाला सेवा और स्वयंसेवा', description: 'हमारी पवित्र गायों की सेवा करने, स्टालों की सफाई करने और जैविक चारा लगाने का प्रत्यक्ष अवसर।' }
    },
    seo: {
      title: 'Goshala Cow Seva Volunteering Programs',
      description: 'Spend your weekends bathing calves, feeding green grass, and practicing spiritual Cow Seva.',
      keywords: 'Cow Seva, Goshala Volunteer, Feed Cows, Weekend Seva'
    },
    eventType: 'workshop',
    categoryColor: '#16A34A', // Vibrant green
    audienceType: 'all',
    setupType: 'in-person',
    recurrence: 'weekly'
  },

  // Blog Categories
  {
    id: 'blog-1',
    parentId: null,
    slug: 'cow-science',
    type: 'blog',
    sortOrder: 1,
    isActive: true,
    itemCount: 14,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: 'BookOpen',
    image: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=500&auto=format&fit=crop&q=60',
    translations: {
      en: { name: 'Panchagavya Science', description: 'Scientific journals, biochemistry breakdowns, and medical applications of Cow-derived elements.' },
      hi: { name: 'पंचगव्य विज्ञान', description: 'गो-उत्पन्न तत्वों के वैज्ञानिक जर्नल, जैव रसायन विश्लेषण और औषधीय अनुप्रयोग।' }
    },
    seo: {
      title: 'Panchagavya Science & Healing Benefits',
      description: 'Explore peer-reviewed scientific studies validating the incredible healing and restorative potential of Panchagavya.',
      keywords: 'Panchagavya Science, Cow Urine benefits, Ghee in Ayurveda, Cow Dung Antimicrobial'
    },
    featured: true,
    editorNotes: 'Highly educational series. Make sure articles are accompanied by certified laboratory analysis.',
    publishingSettings: { autoPublish: false, requiresApproval: true }
  },
  {
    id: 'blog-2',
    parentId: null,
    slug: 'vedic-farming',
    type: 'blog',
    sortOrder: 2,
    isActive: true,
    itemCount: 9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: 'Sprout',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=500&auto=format&fit=crop&q=60',
    translations: {
      en: { name: 'Zero Budget Vedic Farming', description: 'Ancient agricultural practices utilizing Jeevamrutha and Beejamrutha to enrich soil without chemicals.' },
      hi: { name: 'शून्य बजट वैदिक कृषि', description: 'रसायनों के बिना मिट्टी को समृद्ध करने के लिए जीवामृत और बीजामृत का उपयोग करने वाली प्राचीन कृषि पद्धतियां।' }
    },
    seo: {
      title: 'Vedic Organic Farming Guides & Recipes',
      description: 'Learn how to formulate natural fertilizers using Desi cow dung and urine. Save input costs and restore soil health.',
      keywords: 'Jeevamrutha Recipe, Vedic Agriculture, Soil Health restoration, Desi Cow Dung fertilizer'
    },
    featured: true,
    editorNotes: 'Focus on case studies of real farmers who successfully transitioned.',
    publishingSettings: { autoPublish: true, requiresApproval: false }
  },

  // FAQ Categories
  {
    id: 'faq-1',
    parentId: null,
    slug: 'cow-adoption',
    type: 'faq',
    sortOrder: 1,
    isActive: true,
    itemCount: 11,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: 'HeartHandshake',
    translations: {
      en: { name: 'Cow Adoption & Sponsorship Programs', description: 'Everything you need to know about sponsoring a cow, lifetime feeding programs, and visiting your adopted cow.' },
      hi: { name: 'गाय गोद लेना और प्रायोजन कार्यक्रम', description: 'गाय को गोद लेने, जीवन भर भोजन कार्यक्रम और अपनी गोद ली गई गाय से मिलने के बारे में सब कुछ।' }
    },
    seo: {
      title: 'FAQs on Cow Adoption and Goshala Sponsorships',
      description: 'Get details on adoption packages, tax exemptions under 80G, and feeding schedules of your adopted cow.',
      keywords: 'Adopt a cow, Cow sponsorship faq, Tax exemption cow feeding, Gir cow sponsor'
    },
    supportGrouping: 'Sponsorship',
    audienceType: 'all',
    collapsible: true
  },
  {
    id: 'faq-2',
    parentId: null,
    slug: 'delivery-logistics',
    type: 'faq',
    sortOrder: 2,
    isActive: true,
    itemCount: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: 'Truck',
    translations: {
      en: { name: 'Dairy Subscriptions & Cold-Chain Shipping', description: 'Delivery timings, subscription pauses, specialized glass-bottle sanitization, and cold box handling queries.' }
    },
    seo: {
      title: 'Cold-chain milk delivery and subscription pauses FAQs',
      description: 'Read how we maintain A2 milk at 4°C from goshala to your doorstep in glass bottles.',
      keywords: 'Cold delivery FAQ, glass milk bottles cleaning, pause dairy subscription'
    },
    supportGrouping: 'Operations',
    audienceType: 'registered',
    collapsible: true
  }
];

// Load from LocalStorage or seed if empty
const loadState = (): Category[] => {
  if (!isBrowser()) return SEED_CATEGORIES;
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CATEGORIES));
    return SEED_CATEGORIES;
  }
  
  try {
    return JSON.parse(saved);
  } catch (err) {
    console.error('Failed to parse categories store, falling back to seed data:', err);
    return SEED_CATEGORIES;
  }
};

// Save to LocalStorage
const saveState = (categories: Category[]) => {
  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }
};

export const mockCategoriesApi = {
  /**
   * Fetch all categories of a specific type or all if no type is given
   */
  async getCategories(type?: CategoryType): Promise<Category[]> {
    await delay(250); // Simulate network roundtrip latency
    const all = loadState();
    if (type) {
      return all.filter(c => c.type === type).sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return all.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  /**
   * Get a single category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    await delay(150);
    const all = loadState();
    const found = all.find(c => c.id === id);
    return found || null;
  },

  /**
   * Save a new category (Create)
   */
  async saveCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'itemCount'>): Promise<Category> {
    await delay(300);
    const all = loadState();
    
    const newCategory: Category = {
      ...categoryData,
      id: `${categoryData.type}-${Math.random().toString(36).substr(2, 9)}`,
      itemCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Category;

    all.push(newCategory);
    saveState(all);
    return newCategory;
  },

  /**
   * Update an existing category
   */
  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    await delay(300);
    const all = loadState();
    const index = all.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error(`Category with ID ${id} not found.`);
    }

    const updated: Category = {
      ...all[index],
      ...updates,
      updatedAt: new Date().toISOString()
    } as Category;

    all[index] = updated;
    saveState(all);
    return updated;
  },

  /**
   * Delete a category and clean up its children or re-attach them
   */
  async deleteCategory(id: string, cascade: boolean = false): Promise<boolean> {
    await delay(250);
    let all = loadState();
    const index = all.findIndex(c => c.id === id);
    
    if (index === -1) return false;

    if (cascade) {
      // Recursively delete children
      const deleteRecursive = (catId: string) => {
        const children = all.filter(c => c.parentId === catId);
        children.forEach(child => {
          deleteRecursive(child.id);
        });
        all = all.filter(c => c.id !== catId);
      };
      deleteRecursive(id);
    } else {
      // Re-parent children of deleted category to its parent (or root if parent was null)
      const target = all[index];
      all = all.map(c => {
        if (c.parentId === id) {
          return { ...c, parentId: target.parentId, updatedAt: new Date().toISOString() };
        }
        return c;
      });
      all = all.filter(c => c.id !== id);
    }

    saveState(all);
    return true;
  },

  /**
   * Reorder sibling items or re-parent in hierarchy
   */
  async reorderCategories(
    items: { id: string; parentId: string | null; sortOrder: number }[]
  ): Promise<boolean> {
    await delay(200);
    const all = loadState();

    const lookupMap = new Map(items.map(item => [item.id, item]));

    const updated = all.map(cat => {
      const reorderItem = lookupMap.get(cat.id);
      if (reorderItem) {
        return {
          ...cat,
          parentId: reorderItem.parentId,
          sortOrder: reorderItem.sortOrder,
          updatedAt: new Date().toISOString()
        };
      }
      return cat;
    });

    saveState(updated);
    return true;
  },

  /**
   * Import categories from file
   */
  async importCategories(imported: Category[]): Promise<Category[]> {
    await delay(400);
    const all = loadState();
    
    // Avoid duplicates by checking ID or slug + type
    const merged = [...all];
    imported.forEach(imp => {
      const matchIndex = merged.findIndex(m => m.id === imp.id || (m.slug === imp.slug && m.type === imp.type));
      if (matchIndex !== -1) {
        merged[matchIndex] = { ...merged[matchIndex], ...imp, updatedAt: new Date().toISOString() };
      } else {
        merged.push({
          ...imp,
          createdAt: imp.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });

    saveState(merged);
    return merged;
  }
};
