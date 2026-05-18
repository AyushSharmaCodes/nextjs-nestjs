import HeroCarousel from '@/features/home/components/HeroCarousel';
import RunningBanner from '@/features/home/components/RunningBanner';
import FeaturedShowcase from '@/features/products/components/FeaturedShowcase';
import BenefitsSection from '@/features/home/components/BenefitsSection';
import EventsSection from '@/features/events/components/EventsSection';
import BlogsSection from '@/features/blogs/components/BlogsSection';
import DonationBanner from '@/features/home/components/DonationBanner';

import { eventsService } from '@/features/events/services/events.service';
import { blogsService } from '@/features/blogs/services/blogs.service';

export default async function HomeIndex() {
  // Fetch events and blogs in parallel server-side
  const [events, posts] = await Promise.all([
    eventsService.getFeatured(),
    blogsService.getAll(),
  ]);

  return (
    <div>
      <HeroCarousel />
      
      <RunningBanner />

      <FeaturedShowcase />

      <BenefitsSection />
      
      <EventsSection events={events} />

      <BlogsSection posts={posts} />

      <DonationBanner />
    </div>
  );
}
