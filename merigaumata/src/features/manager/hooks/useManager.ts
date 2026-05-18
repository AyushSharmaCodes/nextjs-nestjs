'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ManagerAccount, SanctuaryEvent, Product, Donation } from '../types/manager.types';
import { managerService } from '../services/manager.service';
import { managerKeys } from './managerKeys';

export type ManagerTab = 'events' | 'products' | 'welfare' | 'donations';

export function useManager() {
  const queryClient = useQueryClient();
  const [userSelectedTab, setUserSelectedTab] = useState<ManagerTab | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Queries
  const { data: managerProfile = null } = useQuery<ManagerAccount | null>({
    queryKey: managerKeys.profile(),
    queryFn: managerService.getManagerProfile,
    staleTime: 5 * 60 * 1000,
  });

  const { data: eventsList = [] } = useQuery<SanctuaryEvent[]>({
    queryKey: managerKeys.events(),
    queryFn: managerService.getEventsList,
    staleTime: 5 * 60 * 1000,
  });

  const { data: productsList = [] } = useQuery<Product[]>({
    queryKey: managerKeys.products(),
    queryFn: managerService.getProductsList,
    staleTime: 5 * 60 * 1000,
  });

  const { data: donationsList = [] } = useQuery<Donation[]>({
    queryKey: managerKeys.donations(),
    queryFn: managerService.getDonationsList,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate the active tab dynamically based on role permissions and user navigation (derived state)
  let activeTab: ManagerTab = 'events';
  if (userSelectedTab) {
    activeTab = userSelectedTab;
  } else if (managerProfile) {
    if (managerProfile.permissions.events) activeTab = 'events';
    else if (managerProfile.permissions.products) activeTab = 'products';
    else if (managerProfile.permissions.welfare) activeTab = 'welfare';
    else if (managerProfile.permissions.donations) activeTab = 'donations';
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Mutations
  const addEventMutation = useMutation({
    mutationFn: async (event: Omit<SanctuaryEvent, 'id' | 'status'>) => {
      const newEvent: SanctuaryEvent = {
        ...event,
        id: Math.random().toString(36).substring(2, 11),
        status: 'Scheduled',
      };
      const updated = [...eventsList, newEvent];
      await managerService.saveEventsList(updated);
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(managerKeys.events(), updated);
      showToast('New Vedic event successfully scheduled.');
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (product: Omit<Product, 'id'>) => {
      const formattedPrice = product.price.startsWith('₹') ? product.price : `₹${product.price}`;
      const newProduct: Product = {
        ...product,
        id: Math.random().toString(36).substring(2, 11),
        price: formattedPrice,
      };
      const updated = [...productsList, newProduct];
      await managerService.saveProductsList(updated);
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(managerKeys.products(), updated);
      showToast('Storefront product successfully created.');
    },
  });

  const hasAccess = (tab: ManagerTab) => {
    if (!managerProfile) return false;
    return managerProfile.permissions[tab];
  };

  return {
    managerProfile,
    activeTab,
    setActiveTab: setUserSelectedTab,
    hasAccess,
    toastMessage,
    eventsList,
    addEvent: (event: Omit<SanctuaryEvent, 'id' | 'status'>) => addEventMutation.mutate(event),
    productsList,
    addProduct: (product: Omit<Product, 'id'>) => addProductMutation.mutate(product),
    donationsList,
  };
}
