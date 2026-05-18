import { getTranslations, setRequestLocale } from 'next-intl/server';
import { contactService } from '@/features/contact/services/contact.service';
import { ContactView } from '@/features/contact/components/ContactView';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: 'contact' });
  return {
    title: `${t('hero.titleLine1')} ${t('hero.titleLine2')} - Meri Gau Mata`,
    description: t('hero.description'),
  };
}

export default async function ContactPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);

  // Fetch FAQs directly on the server to prevent blank frames or clientside useEffect layout shifts
  const faqs = await contactService.getContactFaqs();

  return <ContactView faqs={faqs} />;
}
