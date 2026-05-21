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
        icon: 'dashboard',
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
        icon: 'products',
        children: [
          { id: 'allProducts', labelKey: 'allProducts', href: '/admin/products', icon: 'box' },
          { id: 'addProducts', labelKey: 'addProducts', href: '/admin/products/new', icon: 'plusCircle' },
        ]
      },
      {
        id: 'categories',
        labelKey: 'categories',
        icon: 'layers',
        href: '/admin/categories',
      },
      {
        id: 'attributes',
        labelKey: 'attributes',
        icon: 'sliders',
        href: '/admin/attributes',
      },
      {
        id: 'coupons',
        labelKey: 'coupons',
        icon: 'percent',
        href: '/admin/coupons',
      },
      {
        id: 'campaigns',
        labelKey: 'campaigns',
        icon: 'compass',
        href: '/admin/campaigns',
      },
      {
        id: 'productSliders',
        labelKey: 'productSliders',
        icon: 'sparkles',
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
        icon: 'cart',
        children: [
          { id: 'allOrders', labelKey: 'allOrders', href: '/admin/orders', icon: 'clipboardList' },
          { id: 'returns', labelKey: 'returns', href: '/admin/orders/returns', icon: 'refreshCcw' },
          { id: 'orderTracking', labelKey: 'orderTracking', href: '/admin/orders/tracking', icon: 'mapPin' },
        ]
      },
      {
        id: 'deliveryBoys',
        labelKey: 'deliveryBoys',
        icon: 'truck',
        href: '/admin/delivery',
      },
      {
        id: 'customers',
        labelKey: 'customers',
        icon: 'users',
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
        icon: 'shieldCheck',
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
        icon: 'settings',
        children: [
          { id: 'generalSettings', labelKey: 'general', href: '/admin/settings', icon: 'sliders' },
          { id: 'usersSettings', labelKey: 'users', href: '/admin/settings/users', icon: 'users' },
          { id: 'themesSettings', labelKey: 'themes', href: '/admin/settings/themes', icon: 'palette' },
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
        icon: 'globe',
        children: [
          { id: 'languages', labelKey: 'languages', href: '/admin/settings/languages', icon: 'languages' },
          { id: 'currencies', labelKey: 'currencies', href: '/admin/settings/currencies', icon: 'coins' },
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
        icon: 'store',
        children: [
          { id: 'viewStore', labelKey: 'viewStore', href: '/admin/store/view', icon: 'eye' },
          { id: 'storeCustomization', labelKey: 'storeCustomization', href: '/admin/store/customize', icon: 'paintbrush' },
          { id: 'storeSettings', labelKey: 'storeSettings', href: '/admin/store/settings', icon: 'settings' },
        ]
      }
    ]
  }
];
