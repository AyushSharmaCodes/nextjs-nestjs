'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const t = useTranslations('home.carousel');

  const slides = [
    {
      id: 1,
      title: t('slide1.title'),
      subtitle: t('slide1.subtitle'),
      image: 'https://picsum.photos/seed/sacredcow1/1920/1080',
      cta1: { text: t('slide1.cta1'), href: '/shop' },
      cta2: { text: t('slide1.cta2'), href: '/donate' },
    },
    {
      id: 2,
      title: t('slide2.title'),
      subtitle: t('slide2.subtitle'),
      image: 'https://picsum.photos/seed/sacredcow2/1920/1080',
      cta1: { text: t('slide2.cta1'), href: '/shop' },
      cta2: { text: t('slide2.cta2'), href: '/about' },
    },
    {
      id: 3,
      title: t('slide3.title'),
      subtitle: t('slide3.subtitle'),
      image: 'https://picsum.photos/seed/sacredcow3/1920/1080',
      cta1: { text: t('slide3.cta1'), href: '/events' },
      cta2: { text: t('slide3.cta2'), href: '/gallery' },
    },
  ];

  const slideVariants = {
    hiddenRight: { x: '100%', opacity: 0.5 },
    hiddenLeft: { x: '-100%', opacity: 0.5 },
    visible: { x: '0', opacity: 1 },
    exitRight: { x: '-20%', opacity: 0 },
    exitLeft: { x: '20%', opacity: 0 },
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev === 2 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [current]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-earth-900">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial={direction > 0 ? 'hiddenRight' : 'hiddenLeft'}
          animate="visible"
          exit={direction > 0 ? 'exitRight' : 'exitLeft'}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <div className="relative w-full h-full">
            <Image
              src={slides[current].image}
              alt={slides[current].title}
              fill
              sizes="100vw"
              priority={current === 0}
              className="object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/50 to-neutral-900/40"></div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Text Content overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pointer-events-none pt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-5xl pointer-events-auto"
          >
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-tight text-shadow-lg">
              {slides[current].title}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-neutral-200 mb-10 font-medium max-w-3xl mx-auto text-shadow">
              {slides[current].subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={slides[current].cta1.href} className="bg-primary-500 text-neutral-950 hover:bg-primary-400 px-8 py-4 rounded-xl font-bold transition-colors shadow-lg text-lg">
                {slides[current].cta1.text}
              </Link>
              <Link href={slides[current].cta2.href} className="bg-neutral-900/60 backdrop-blur-md border border-neutral-700 text-white hover:bg-neutral-800 px-8 py-4 rounded-xl font-bold transition-colors shadow-lg text-lg">
                {slides[current].cta2.text}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-12 z-20 flex flex-col-reverse md:flex-row justify-between items-center px-8 md:px-16 pointer-events-none gap-6">
        <div className="flex gap-3 pointer-events-auto">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > current ? 1 : -1);
                setCurrent(index);
              }}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                index === current ? 'w-12 bg-primary-500' : 'w-2.5 bg-neutral-400/50 hover:bg-neutral-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        <div className="flex gap-4 pointer-events-auto">
          <button 
            onClick={prevSlide}
            className="p-3.5 rounded-full bg-neutral-900/40 backdrop-blur-md border border-neutral-700 hover:bg-neutral-800 text-white transition-all transform hover:scale-110 shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="p-3.5 rounded-full bg-neutral-900/40 backdrop-blur-md border border-neutral-700 hover:bg-neutral-800 text-white transition-all transform hover:scale-110 shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
