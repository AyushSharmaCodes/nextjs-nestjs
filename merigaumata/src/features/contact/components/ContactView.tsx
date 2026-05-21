import { Link } from '@/i18n/navigation';
import { AppIcon } from '@/shared/icons';
import { getTranslations } from 'next-intl/server';
import { ContactForm } from '@/features/contact/components/ContactForm';
import { FAQSection } from '@/features/contact/components/FAQSection';
import { FAQ } from '../types/contact.types';

interface ContactViewProps {
  faqs: FAQ[];
}

export async function ContactView({ faqs }: ContactViewProps) {
  const t = await getTranslations('contact');

  return (
    <div className="bg-neutral-50 dark:bg-[#121212] min-h-screen text-foreground">
      
      {/* Container for the main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 pb-20 space-y-8 lg:space-y-12">

        {/* Top Hero Section */}
        <section className="bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] p-8 md:p-12 lg:p-16 border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border-neutral-200 dark:border-neutral-800 relative xl:overflow-hidden">
          {/* Decorative element top left */}
          <div className="absolute top-0 left-6 sm:left-12 w-24 h-24 sm:w-32 sm:h-32 opacity-30 dark:opacity-10 pointer-events-none flex gap-2 sm:gap-3">
            <div className="w-6 sm:w-8 h-full bg-primary-200 rounded-b-2xl"></div>
            <div className="w-6 sm:w-8 h-3/4 bg-primary-200 rounded-b-2xl"></div>
            <div className="w-6 sm:w-8 h-1/2 bg-primary-200 rounded-b-2xl"></div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center lg:items-start justify-between relative z-10 pt-16 sm:pt-12 lg:pt-8">
            <div className="flex-1 w-full max-w-xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-tertiary-900 dark:text-white leading-snug tracking-tight">
                <span className="bg-[#E2FBB1] dark:bg-primary-900/40 px-3 py-1 rounded-xl inline-block mb-3">{t('hero.titleLine1')}</span><br/>
                <span className="bg-[#E2FBB1] dark:bg-primary-900/40 px-3 py-1 rounded-xl inline-block">{t('hero.titleLine2')}</span>
              </h1>
            </div>
            <div className="flex-1 w-full lg:max-w-md space-y-8">
              <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base leading-relaxed">
                {t('hero.description')}
              </p>
              <div className="bg-white dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 shadow-sm rounded-[2rem] p-2 inline-flex gap-3 items-center">
                <a href="#" className="w-12 h-12 bg-[#CCFF66] hover:bg-[#BDEB5B] dark:bg-primary-900/60 dark:hover:bg-primary-900/80 text-tertiary-900 dark:text-white rounded-full flex items-center justify-center transition-colors" aria-label="Facebook">
                  <AppIcon name="facebook" className="w-5 h-5 fill-current" />
                </a>
                <a href="#" className="w-12 h-12 bg-[#CCFF66] hover:bg-[#BDEB5B] dark:bg-primary-900/60 dark:hover:bg-primary-900/80 text-tertiary-900 dark:text-white rounded-full flex items-center justify-center transition-colors" aria-label="Twitter">
                  <AppIcon name="twitter" className="w-5 h-5 fill-current" />
                </a>
                <a href="#" className="w-12 h-12 bg-[#CCFF66] hover:bg-[#BDEB5B] dark:bg-primary-900/60 dark:hover:bg-primary-900/80 text-tertiary-900 dark:text-white rounded-full flex items-center justify-center transition-colors" aria-label="LinkedIn">
                  <AppIcon name="linkedin" className="w-5 h-5 fill-current" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Info Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow h-full">
            <div className="flex justify-between items-start mb-6">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{t('infoCards.addressLabel')}</span>
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-tertiary-800 flex items-center justify-center text-tertiary-900 dark:text-white group-hover:bg-tertiary-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-tertiary-900 transition-colors">
                <AppIcon name="arrowUpRight" className="w-5 h-5" />
              </div>
            </div>
            <p className="font-semibold text-tertiary-900 dark:text-white text-lg pr-4">{t('infoCards.addressValue')}</p>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow h-full">
            <div className="flex justify-between items-start mb-6">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{t('infoCards.emailLabel')}</span>
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-tertiary-800 flex items-center justify-center text-tertiary-900 dark:text-white group-hover:bg-tertiary-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-tertiary-900 transition-colors">
                <AppIcon name="arrowUpRight" className="w-5 h-5" />
              </div>
            </div>
            <p className="font-semibold text-tertiary-900 dark:text-white text-lg pr-4">{t('infoCards.emailValue')}</p>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow h-full">
            <div className="flex justify-between items-start mb-6">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{t('infoCards.phoneLabel')}</span>
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-tertiary-800 flex items-center justify-center text-tertiary-900 dark:text-white group-hover:bg-tertiary-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-tertiary-900 transition-colors">
                <AppIcon name="arrowUpRight" className="w-5 h-5" />
              </div>
            </div>
            <p className="font-semibold text-tertiary-900 dark:text-white text-lg pr-4">{t('infoCards.phoneValue')}</p>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow h-full">
            <div className="flex justify-between items-start mb-6">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{t('infoCards.hoursLabel')}</span>
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-tertiary-800 flex items-center justify-center text-tertiary-900 dark:text-white group-hover:bg-tertiary-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-tertiary-900 transition-colors">
                <AppIcon name="arrowUpRight" className="w-5 h-5" />
              </div>
            </div>
            <div className="font-semibold text-tertiary-900 dark:text-white text-lg pr-4">
              <span className="block">{t('infoCards.hoursWeekdays')}</span>
              <span className="block text-base text-neutral-500 dark:text-neutral-400 mt-1">{t('infoCards.hoursSunday')}</span>
            </div>
          </div>
        </section>

        {/* Redesigned Contact Form Section */}
        <section className="relative w-full max-w-5xl mx-auto py-8 lg:py-16 flex flex-col lg:block">
          {/* Left Overlapping Info Card */}
          <div className="lg:absolute lg:left-0 lg:top-[50%] lg:-translate-y-[50%] z-10 w-full lg:w-[38%] bg-tertiary-900 dark:bg-tertiary-800 text-white rounded-[2rem] p-8 md:p-10 shadow-2xl flex flex-col min-h-[460px] relative order-1 lg:order-none mt-8 lg:mt-0">
            <div className="flex-1">
              <h3 className="text-2xl font-semibold mb-10 tracking-tight">{t('infoOverlay.title')}</h3>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <AppIcon name="mapPin" className="w-6 h-6 shrink-0 opacity-80" />
                  <p className="text-white/90 leading-relaxed font-medium">
                    {t.rich('infoOverlay.address', {
                      br: () => <br />
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <AppIcon name="mail" className="w-6 h-6 shrink-0 opacity-80" />
                  <p className="text-white/90 font-medium tracking-wide">{t('infoOverlay.email')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <AppIcon name="phone" className="w-6 h-6 shrink-0 opacity-80" />
                  <p className="text-white/90 font-medium tracking-wide">{t('infoOverlay.phone')}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 mt-12 pt-8">
              <a href="#" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-tertiary-900 transition-colors" aria-label="Facebook link">
                <AppIcon name="facebook" className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-tertiary-900 transition-colors" aria-label="Twitter link">
                <AppIcon name="twitter" className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-tertiary-900 transition-colors" aria-label="LinkedIn link">
                <AppIcon name="linkedin" className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Form Card (Client Component Leaf) */}
          <ContactForm />
        </section>

        {/* Opportunities / Info Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] p-8 md:p-10 border shadow-sm border-neutral-200 dark:border-neutral-800 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-xl font-bold text-tertiary-900 dark:text-white mb-4">{t('volunteerCard.title')}</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                {t('volunteerCard.description')}
              </p>
            </div>
            <Link href="/volunteer" className="inline-flex items-center gap-3 bg-tertiary-900 dark:bg-white text-white dark:text-tertiary-900 px-6 py-3 rounded-full font-medium hover:bg-tertiary-800 dark:hover:bg-neutral-200 transition-colors w-fit">
              {t('volunteerCard.button')}
              <AppIcon name="arrowUpRight" className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] p-8 md:p-10 border shadow-sm border-neutral-200 dark:border-neutral-800 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-xl font-bold text-tertiary-900 dark:text-white mb-4">{t('donationCard.title')}</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                {t('donationCard.description')}
              </p>
            </div>
            <Link href="/donate" className="inline-flex items-center gap-3 bg-tertiary-900 dark:bg-white text-white dark:text-tertiary-900 px-6 py-3 rounded-full font-medium hover:bg-tertiary-800 dark:hover:bg-neutral-200 transition-colors w-fit">
              {t('donationCard.button')}
              <AppIcon name="arrowUpRight" className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Google Map Section */}
        <section className="w-full bg-neutral-100 dark:bg-[#1A1A1A] rounded-[2.5rem] overflow-hidden relative aspect-video md:aspect-[21/9] border shadow-sm border-neutral-200 dark:border-neutral-800">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113032.64621415694!2d77.58529322234057!3d27.56708304664741!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39736fc19d442db5%3A0xe5f87b1c4c81fd8k!2sVrindavan%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1716301298402!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Sanctuary Location Map"
            className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-700 opacity-80 hover:opacity-100"
          ></iframe>
        </section>

        {/* Donate CTA Banner */}
        <section className="bg-primary-300 dark:bg-primary-900/60 rounded-[2.5rem] p-10 md:p-16 text-center shadow-sm border border-primary-400 dark:border-primary-800 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-tertiary-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-tertiary-950 dark:text-white mb-6">
              {t('donateCTA.title')}
            </h2>
            <p className="text-tertiary-800 dark:text-neutral-300 mb-10 text-lg">
              {t('donateCTA.description')}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm pl-8 pr-2 py-2 rounded-full flex items-center justify-between gap-6 border border-white/50 dark:border-white/10 shadow-lg">
                <span className="text-tertiary-950 dark:text-white font-medium text-sm sm:text-base">{t('donateCTA.prompt')}</span>
                <Link href="/donate" className="bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500 text-white px-6 py-4 rounded-full font-bold transition-all flex items-center gap-2 group shadow-md shrink-0">
                  {t('donateCTA.button')}
                  <AppIcon name="arrowUpRight" className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section (Client Component Leaf) */}
        <FAQSection 
          faqs={faqs} 
          title={t('faqs.title')} 
          description={t('faqs.description')} 
          buttonText={t('faqs.button')}
        />

      </div>
    </div>
  );
}
