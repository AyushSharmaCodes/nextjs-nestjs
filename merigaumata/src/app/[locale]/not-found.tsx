import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-earth-50 text-center px-4 relative overflow-hidden">
      {/* Aesthetic background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary-200/20 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>

      <div className="max-w-2xl w-full flex flex-col items-center relative z-10">
        <div className="mb-8 relative w-48 h-48 md:w-64 md:h-64">
          <Image 
            src="https://picsum.photos/seed/nature-404/600/600" 
            alt="Lost in nature" 
            fill 
            className="object-cover rounded-full shadow-xl border-8 border-white mix-blend-luminosity opacity-90"
            sizes="(max-width: 768px) 192px, 256px"
            referrerPolicy="no-referrer"
          />
        </div>

        <h1 className="text-8xl md:text-9xl font-serif font-bold text-tertiary-900 mb-4 tracking-tighter">
          404
        </h1>
        
        <h2 className="text-2xl md:text-4xl font-serif font-bold text-tertiary-800 mb-6">
          Lost in the pasture
        </h2>
        
        <p className="text-tertiary-600 font-medium text-lg mb-10 max-w-md mx-auto">
          The page you are looking for seems to have wandered off. Let&apos;s guide you back to familiar grounds.
        </p>
        
        <Link 
          href="/" 
          className="bg-primary-600 text-white hover:bg-primary-700 px-8 py-3.5 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 inline-block"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
