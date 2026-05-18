'use client';

import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Product } from '../types/manager.types';

interface ManagerProductsProps {
  productsList: Product[];
  addProduct: (product: { name: string; price: string; stock: number }) => void;
  translateIfKey: (text: string) => string;
}

export function ManagerProducts({
  productsList,
  addProduct,
  translateIfKey
}: ManagerProductsProps) {
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return;

    addProduct({
      name: newProduct.name,
      price: newProduct.price,
      stock: parseInt(newProduct.stock) || 0
    });
    setNewProduct({ name: '', price: '', stock: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Vedic Storefront Products</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Alter and manage stock quantities and create new sacred listings.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pt-2">
        <form onSubmit={handleAddProduct} className="xl:col-span-5 space-y-4 p-5 rounded-xl border border-border bg-neutral-50/50 dark:bg-neutral-900/40 h-max">
          <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-primary-500" /> Create Listing
          </h3>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Product Title</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Distilled Gir Cow Ark" 
              value={newProduct.name}
              onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 border rounded-xl dark:bg-neutral-900 dark:border-neutral-800 text-foreground text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-700 font-medium" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Base Price (₹)</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. ₹450" 
                value={newProduct.price}
                onChange={e => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-4 py-2.5 border rounded-xl dark:bg-neutral-900 dark:border-neutral-800 text-foreground text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-700 font-medium" 
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Initial Stock</label>
              <input 
                type="number" 
                required 
                placeholder="e.g. 50" 
                value={newProduct.stock}
                onChange={e => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                className="w-full px-4 py-2.5 border rounded-xl dark:bg-neutral-900 dark:border-neutral-800 text-foreground text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-700 font-medium" 
              />
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all mt-2 focus:outline-none">
            Add to Storefront
          </button>
        </form>

        {/* Product list */}
        <div className="xl:col-span-7 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Active E-Commerce Catalog ({productsList.length})</h3>
          <div className="space-y-3">
            {productsList.map(prod => (
              <div key={prod.id} className="p-4 border border-border bg-card rounded-xl flex justify-between items-center hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{translateIfKey(prod.name)}</h4>
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-semibold block mt-0.5">Catalog Price: {prod.price}</span>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/40">
                    In Stock: {prod.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
