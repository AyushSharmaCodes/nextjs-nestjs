import { getTranslations, setRequestLocale } from 'next-intl/server';
import { aboutService } from '@/features/about/services/about.service';
import { AboutView } from '@/features/about/components/AboutView';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: 'about' });
  return {
    title: `${t('hero.title').replace('<br className="hidden md:block" />', '').replace('<br/>', '')} - Meri Gau Mata`,
    description: t('hero.description'),
  };
}

export default async function AboutPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);

  // Execute high-performance parallel server-side data fetching
  const [cowStats, timeline, teamMembers, testimonialsRow1, testimonialsRow2] = await Promise.all([
    aboutService.getStats(),
    aboutService.getTimeline(),
    aboutService.getTeam(),
    aboutService.getTestimonials(1),
    aboutService.getTestimonials(2)
  ]);

  return (
    <AboutView
      cowStats={cowStats}
      timeline={timeline}
      teamMembers={teamMembers}
      testimonialsRow1={testimonialsRow1}
      testimonialsRow2={testimonialsRow2}
    />
  );
}
