import { CowStat, TimelineItem, TeamMember, Testimonial } from '../types/about.types';

export const MOCK_COW_STATS: CowStat[] = [
  { value: '15,000+', label: 'Cows Protected' },
  { value: '50+', label: 'Sanctuaries' },
  { value: '2,500+', label: 'Volunteers' },
  { value: '10M+', label: 'Meals Served' },
];

export const MOCK_TIMELINE: TimelineItem[] = [
  { year: '2010', title: 'Humble Beginnings', description: 'Started with our first small shelter rescuing 10 cows from slaughter, laying the foundation for a lifelong commitment to animal welfare.' },
  { year: '2015', title: 'Milestones and Achievements', description: 'Expanded to 5 different regions, focusing on sick and injured cows and establishing fully equipped veterinary units.' },
  { year: '2020', title: 'Building a Legacy of Trust', description: 'Launched cruelty-free dairy and cow-dung based sustainable products, creating a self-sustaining ecosystem.' },
  { year: '2024', title: 'Shaping the Future, Rooted in the Past', description: 'Reached international milestones through our volunteer programs, continuing to empower communities globally.' },
];

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { name: 'Dr. Aarav Sharma', role: 'Chief Veterinarian', image: 'https://picsum.photos/seed/doc1/400/400' },
  { name: 'Meera Patel', role: 'Shelter Coordinator', image: 'https://picsum.photos/seed/coord1/400/400' },
  { name: 'Rahul Desai', role: 'Head of Operations', image: 'https://picsum.photos/seed/ops1/400/400' },
  { name: 'Priya Singh', role: 'Community Outreach', image: 'https://picsum.photos/seed/out1/400/400' },
];

export const MOCK_TESTIMONIALS_ROW1: Testimonial[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `r1-${i}`,
  name: `Supporter ${i + 1}`,
  role: i % 2 === 0 ? 'Volunteer' : 'Donor',
  avatar: `https://picsum.photos/seed/avatar1${i}/100/100`,
  content: "The dedication and care provided to the sacred cows here is truly inspiring. I've never seen such a well-maintained and loving sanctuary.",
  rating: 5,
}));

export const MOCK_TESTIMONIALS_ROW2: Testimonial[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `r2-${i}`,
  name: `Community Member ${i + 1}`,
  role: 'Advocate',
  avatar: `https://picsum.photos/seed/avatar2${i}/100/100`,
  content: "Their self-sustaining model utilizing cruelty-free dairy and organic products is revolutionizing how we approach cow welfare. Highly recommend getting involved!",
  rating: 5,
}));
