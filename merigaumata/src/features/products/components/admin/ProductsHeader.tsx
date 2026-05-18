import React from 'react';
import { useTranslations } from 'next-intl';
import { Layers, Package, AlertTriangle, XOctagon } from 'lucide-react';
import { Product } from '../../types/products.types';

interface ProductsHeaderProps {
  products: Product[];
}

export function ProductsHeader({ products }: ProductsHeaderProps) {
  const t = useTranslations('products');

  // Dynamic calculations based on current active list
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, curr) => acc + curr.stock, 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10 && p.status !== 'archived').length;
  const outOfStockCount = products.filter(p => p.stock === 0 && p.status !== 'archived').length;

  const stats = [
    {
      label: t('totalProducts'),
      value: totalProducts,
      icon: Layers,
      color: 'text-stone-700 bg-stone-100 dark:text-stone-300 dark:bg-stone-850',
    },
    {
      label: t('totalStock'),
      value: totalStock,
      icon: Package,
      color: 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20',
    },
    {
      label: t('lowStockAlerts'),
      value: lowStockCount,
      icon: AlertTriangle,
      color: 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20',
    },
    {
      label: t('outOfStockAlerts'),
      value: outOfStockCount,
      icon: XOctagon,
      color: 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20',
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Title & description row */}
      <div>
        <h1 className="font-serif font-bold text-2xl md:text-3xl text-stone-900 dark:text-stone-100 tracking-tight leading-none mb-2">
          {t('title')}
        </h1>
        <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400 font-medium">
          {t('subtitle')}
        </p>
      </div>

      {/* Grid of 4 high-aesthetic stock metrics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 bg-white dark:bg-stone-900/40 p-4 border border-stone-200/80 dark:border-stone-850 rounded-2xl shadow-sm hover:shadow transition-shadow duration-300"
            >
              <div className={`p-2 rounded-xl shrink-0 ${stat.color}`}>
                <Icon className="h-4.5 w-4.5 stroke-[2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500">
                  {stat.label}
                </span>
                <span className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mt-0.5 leading-none">
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
