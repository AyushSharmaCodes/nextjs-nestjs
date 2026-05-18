'use client';

import { 
  ShoppingBag, Calendar, Heart, ShieldAlert, Lock, 
  CheckCircle, Sliders, DollarSign 
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useManager } from '../hooks/useManager';

// Code-split operations panels on-demand based on authorization & active tab
const ManagerEvents = dynamic(() => import('./ManagerEvents').then(m => m.ManagerEvents), { ssr: false });
const ManagerProducts = dynamic(() => import('./ManagerProducts').then(m => m.ManagerProducts), { ssr: false });
const ManagerWelfare = dynamic(() => import('./ManagerWelfare').then(m => m.ManagerWelfare), { ssr: false });
const ManagerDonations = dynamic(() => import('./ManagerDonations').then(m => m.ManagerDonations), { ssr: false });

export function ManagerDashboardClient() {
  const tManager = useTranslations('manager');
  
  const {
    managerProfile,
    activeTab,
    setActiveTab,
    hasAccess,
    toastMessage,
    eventsList,
    addEvent,
    productsList,
    addProduct,
    donationsList
  } = useManager();

  const translateIfKey = (text: string) => {
    if (text && text.startsWith('MockData.')) {
      const key = text.replace('MockData.', 'mockData.');
      return tManager(key as Parameters<typeof tManager>[0]);
    }
    return text;
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full mx-auto">
        
        {/* Dynamic Toast Alerts */}
        {toastMessage && (
          <div className="fixed top-24 right-6 z-50 bg-foreground text-background px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-border animate-in fade-in slide-in-from-top-4 duration-300 font-medium text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            {toastMessage}
          </div>
        )}

        {/* Dashboard Title Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/10 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                Sanctuary Portal
              </span>
              <span className="text-neutral-300 dark:text-neutral-700">|</span>
              <span className="text-xs text-neutral-400 dark:text-neutral-500 font-semibold">{managerProfile?.email}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif">
              Manager Panel: <span className="text-primary-600 dark:text-primary-400">{managerProfile ? translateIfKey(managerProfile.name) : 'Loading Profile...'}</span>
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Control assigned operations and log holy Gau Shala resource parameters.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.href = '/en/profile'}
              className="px-4 py-2 border border-border bg-card rounded-xl text-neutral-600 dark:text-neutral-400 font-semibold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors focus:outline-none cursor-pointer"
            >
              Back to Profile
            </button>
          </div>
        </div>

        {/* Dynamic Stretch Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          
          {/* Left Navigation: Toggle accessible tabs and locked sections */}
          <div className="w-full lg:w-[260px] shrink-0 bg-card p-4 rounded-[14px] border border-border shadow-sm flex flex-col gap-6">
            <div>
              <h4 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3 px-3 flex items-center justify-between">
                Operations Panel 
                <Sliders className="w-3 h-3 text-neutral-400" />
              </h4>
              <nav className="space-y-1">
                
                {/* Events Tab */}
                <button
                  onClick={() => setActiveTab('events')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all focus:outline-none cursor-pointer ${
                    activeTab === 'events'
                      ? 'bg-primary-500/10 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Calendar className="w-4 h-4" /> {tManager('eventsTab')}
                  </span>
                  {!hasAccess('events') && <Lock className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />}
                </button>

                {/* Products Tab */}
                <button
                  onClick={() => setActiveTab('products')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all focus:outline-none cursor-pointer ${
                    activeTab === 'products'
                      ? 'bg-primary-500/10 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4" /> {tManager('productsTab')}
                  </span>
                  {!hasAccess('products') && <Lock className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />}
                </button>

                {/* Welfare Tab */}
                <button
                  onClick={() => setActiveTab('welfare')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all focus:outline-none cursor-pointer ${
                    activeTab === 'welfare'
                      ? 'bg-primary-500/10 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-emerald-500" /> {tManager('welfareTab')}
                  </span>
                  {!hasAccess('welfare') && <Lock className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />}
                </button>

                {/* Donations Tab */}
                <button
                  onClick={() => setActiveTab('donations')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all focus:outline-none cursor-pointer ${
                    activeTab === 'donations'
                      ? 'bg-primary-500/10 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4" /> {tManager('donationsTab')}
                  </span>
                  {!hasAccess('donations') && <Lock className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />}
                </button>

              </nav>
            </div>

            {/* Manager Details Summary */}
            <div className="mt-auto pt-6 border-t border-border">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/30 rounded-xl border border-border flex flex-col gap-2">
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Access Permissions</span>
                
                <div className="space-y-1.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${hasAccess('events') ? 'bg-green-500' : 'bg-red-400'}`}></span>
                    Events Module: {hasAccess('events') ? 'Granted' : 'Restricted'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${hasAccess('products') ? 'bg-green-500' : 'bg-red-400'}`}></span>
                    Products Module: {hasAccess('products') ? 'Granted' : 'Restricted'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${hasAccess('welfare') ? 'bg-green-500' : 'bg-red-400'}`}></span>
                    Welfare Module: {hasAccess('welfare') ? 'Granted' : 'Restricted'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${hasAccess('donations') ? 'bg-green-500' : 'bg-red-400'}`}></span>
                    Donations: {hasAccess('donations') ? 'Granted' : 'Restricted'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Content Pane */}
          <div className="flex-1 w-full bg-card rounded-[14px] border border-border shadow-sm overflow-hidden flex flex-col p-6 sm:p-8">
            
            {/* 1. Access Check Block */}
            {!hasAccess(activeTab) ? (
              <div className="flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-6">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground font-serif mb-2">{tManager('noAccess')}</h2>
                <p className="max-w-md text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-8">
                  {tManager('noAccessDesc')}
                </p>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-border flex items-center gap-3 text-left">
                  <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                    Administrator grants access dynamically through Local Storage controls.
                  </span>
                </div>
              </div>
            ) : (
              // Display Content Tabs
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* A. Events Panel */}
                {activeTab === 'events' && (
                  <ManagerEvents 
                    eventsList={eventsList}
                    addEvent={addEvent}
                    translateIfKey={translateIfKey}
                  />
                )}

                {/* B. Products Panel */}
                {activeTab === 'products' && (
                  <ManagerProducts 
                    productsList={productsList}
                    addProduct={addProduct}
                    translateIfKey={translateIfKey}
                  />
                )}

                {/* C. Cow Welfare Panel */}
                {activeTab === 'welfare' && (
                  <ManagerWelfare />
                )}

                {/* D. Donations Panel */}
                {activeTab === 'donations' && (
                  <ManagerDonations 
                    donationsList={donationsList}
                    translateIfKey={translateIfKey}
                  />
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
