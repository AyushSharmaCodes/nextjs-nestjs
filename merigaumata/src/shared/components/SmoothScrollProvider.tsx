'use client';

import { ReactLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if we are inside admin or manager portals to prevent smooth scroll interference
  const isAdminOrManager = pathname?.includes('/admin') || pathname?.includes('/manager');

  if (isAdminOrManager) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
