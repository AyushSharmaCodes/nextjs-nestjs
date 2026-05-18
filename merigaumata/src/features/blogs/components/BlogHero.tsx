'use client';

import Image from 'next/image';

interface BlogHeroProps {
  image: string;
  title: string;
}

export function BlogHero({ image, title }: BlogHeroProps) {
  return (
    <div className="relative w-full h-[45vh] md:h-[60vh] rounded-[2.5rem] overflow-hidden shadow-xl border border-black/5 dark:border-neutral-800 bg-[#403833]">
      <Image 
        src={image}
        alt={title}
        fill
        priority
        className="object-cover object-center transition-transform duration-[6s] hover:scale-105"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-black/5" />
    </div>
  );
}
