import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  RefreshCcw, 
  DollarSign, 
  Users, 
  FileText, 
  Settings, 
  HelpCircle,
  Building2,
  Layers,
  Sparkles,
  Percent,
  Compass,
  Truck,
  ShieldCheck,
  Globe,
  Coins,
  Store,
  Eye,
  Sliders,
  Palette,
  Box,
  PlusCircle,
  ClipboardList,
  MapPin,
  Languages,
  Paintbrush
} from 'lucide-react';
import { SidebarRoute } from '../types';

export interface SidebarSectionConfig {
  id: string;
  labelKey: string; // e.g. "admin.AdminSidebar.section.general"
  items: SidebarRoute[];
}

export const SIDEBAR_SECTIONS: SidebarSectionConfig[] = [
  {
    id: 'general',
    labelKey: 'generalSection',
    items: [
      {
        id: 'dashboard',
        labelKey: 'dashboard',
        icon: LayoutDashboard,
        href: '/admin',
      }
    ]
  },
  {
    id: 'catalog',
    labelKey: 'catalogSection',
    items: [
      {
        id: 'products',
        labelKey: 'products',
        icon: ShoppingBag,
        children: [
          { id: 'allProducts', labelKey: 'allProducts', href: '/admin/products', icon: Box },
          { id: 'addProducts', labelKey: 'addProducts', href: '/admin/products/new', icon: PlusCircle },
        ]
      },
      {
        id: 'categories',
        labelKey: 'categories',
        icon: Layers,
        href: '/admin/categories',
      },
      {
        id: 'attributes',
        labelKey: 'attributes',
        icon: Sliders,
        href: '/admin/attributes',
      },
      {
        id: 'coupons',
        labelKey: 'coupons',
        icon: Percent,
        href: '/admin/coupons',
      },
      {
        id: 'campaigns',
        labelKey: 'campaigns',
        icon: Compass,
        href: '/admin/campaigns',
      },
      {
        id: 'productSliders',
        labelKey: 'productSliders',
        icon: Sparkles,
        href: '/admin/sliders',
      }
    ]
  },
  {
    id: 'sales',
    labelKey: 'salesSection',
    items: [
      {
        id: 'orders',
        labelKey: 'orders',
        icon: ShoppingCart,
        children: [
          { id: 'allOrders', labelKey: 'allOrders', href: '/admin/orders', icon: ClipboardList },
          { id: 'returns', labelKey: 'returns', href: '/admin/orders/returns', icon: RefreshCcw },
          { id: 'orderTracking', labelKey: 'orderTracking', href: '/admin/orders/tracking', icon: MapPin },
        ]
      },
      {
        id: 'deliveryBoys',
        labelKey: 'deliveryBoys',
        icon: Truck,
        href: '/admin/delivery',
      },
      {
        id: 'customers',
        labelKey: 'customers',
        icon: Users,
        href: '/admin/customers',
      }
    ]
  },
  {
    id: 'staff',
    labelKey: 'staffSection',
    items: [
      {
        id: 'ourStaff',
        labelKey: 'ourStaff',
        icon: ShieldCheck,
        href: '/admin/staff',
      }
    ]
  },
  {
    id: 'settingsGroup',
    labelKey: 'settingsSection',
    items: [
      {
        id: 'settings',
        labelKey: 'settings',
        icon: Settings,
        children: [
          { id: 'generalSettings', labelKey: 'general', href: '/admin/settings', icon: Sliders },
          { id: 'usersSettings', labelKey: 'users', href: '/admin/settings/users', icon: Users },
          { id: 'themesSettings', labelKey: 'themes', href: '/admin/settings/themes', icon: Palette },
        ]
      }
    ]
  },
  {
    id: 'international',
    labelKey: 'internationalSection',
    items: [
      {
        id: 'localization',
        labelKey: 'localization',
        icon: Globe,
        children: [
          { id: 'languages', labelKey: 'languages', href: '/admin/settings/languages', icon: Languages },
          { id: 'currencies', labelKey: 'currencies', href: '/admin/settings/currencies', icon: Coins },
        ]
      }
    ]
  },
  {
    id: 'onlineStore',
    labelKey: 'onlineStoreSection',
    items: [
      {
        id: 'onlineStoreMenu',
        labelKey: 'onlineStore',
        icon: Store,
        children: [
          { id: 'viewStore', labelKey: 'viewStore', href: '/admin/store/view', icon: Eye },
          { id: 'storeCustomization', labelKey: 'storeCustomization', href: '/admin/store/customize', icon: Paintbrush },
          { id: 'storeSettings', labelKey: 'storeSettings', href: '/admin/store/settings', icon: Settings },
        ]
      }
    ]
  }
];
