import { ReactNode } from 'react';

// Since we have a root `not-found.tsx` page, a root layout is required.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
