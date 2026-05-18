import Link from 'next/link';
import Image from 'next/image';
import { Home } from 'lucide-react';
import './[locale]/globals.css';

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F5F2] text-center px-4 font-sans">
          <div className="flex flex-col items-center">
            {/* Brand Logo inside a circle */}
            <div className="w-48 h-48 md:w-64 md:h-64 relative rounded-full overflow-hidden border-8 border-white shadow-xl mb-8 bg-white opacity-90">
              <Image 
                src="https://picsum.photos/seed/merigaumata/400/400" 
                alt="Brand Logo" 
                fill 
                sizes="(max-width: 768px) 192px, 256px"
                referrerPolicy="no-referrer"
                className="object-cover" 
              />
            </div>
            
            {/* Smaller 404 */}
            <h2 className="text-3xl md:text-5xl font-bold mb-3" style={{ color: '#403833' }}>
              404
            </h2>
            
            {/* Page not found */}
            <p className="text-lg md:text-xl font-medium mb-10" style={{ color: '#687761' }}>
              Page not found
            </p>
            
            {/* Button */}
            <Link 
              href="/" 
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-opacity hover:opacity-90 shadow-sm"
              style={{ backgroundColor: '#B85E31' }}
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
