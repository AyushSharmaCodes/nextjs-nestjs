import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import { SmoothScrollProvider } from '@/shared/components/SmoothScrollProvider';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
