'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AppIcon, StatusIcon } from '@/shared/icons';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useProfile } from '../hooks/useProfile';
import { PersonalDetailsSection } from './PersonalDetailsSection';
import { AccountDetailsSection } from './AccountDetailsSection';
import { SecuritySection } from './SecuritySection';
import { PreferencesSection } from './PreferencesSection';
import { DeleteAccountModal } from './DeleteAccountModal';
import { authClient } from '@/lib/auth-client';
import { toast } from '@/shared/lib/toast';
import { useStrictAuth } from '@/features/auth/hooks/useStrictAuth';

export function ProfileDashboardClient() {
  const t = useTranslations('profile');
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params.locale as string) || 'en';
  const [isSigningOut, setIsSigningOut] = useState(false);
  const authState = useStrictAuth();
  const authenticatedUser = authState.status === 'authenticated' ? authState.user : null;
  
  const {
    userRole,
    profilePicture,
    handleProfilePictureUpload,
    personalDetails,
    tempPersonalDetails,
    setTempPersonalDetails,
    isEditingPersonal,
    setIsEditingPersonal,
    savePersonalDetails,
    hasPersonalChanges,
    accountDetails,
    tempAccountDetails,
    setTempAccountDetails,
    isEditingAccount,
    setIsEditingAccount,
    saveAccountDetails,
    hasAccountChanges
  } = useProfile();

  const computedFullName = `${personalDetails.firstName || ''} ${personalDetails.lastName || ''}`.trim()
    || authenticatedUser?.firstName
    || authenticatedUser?.email.split('@')[0]
    || 'User';
  const userEmail = authenticatedUser?.email ?? '';
  const emailVerified = authenticatedUser?.emailVerified ?? false;

  // Danger Zone State
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const translateIfKey = (text: string) => {
    if (text && text.startsWith('MockData.')) {
      const key = text.replace('MockData.', 'mockData.');
      return t(key as Parameters<typeof t>[0]);
    }
    return text;
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      toast.success('Signed out successfully', { description: 'See you next time!' });
      sessionStorage.removeItem('mgm_modal_shown');
      router.replace(`/${currentLocale}/auth/login`);
    } catch {
      toast.error('Sign out failed', { description: 'Please try again.' });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-24 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          
          {/* Left Sidebar */}
          <div className="hidden lg:flex w-[240px] shrink-0 bg-card p-4 rounded-[14px] border border-neutral-200 dark:border-neutral-800 shadow-sm flex-col justify-between">
            <div className="space-y-6">
               {/* My Account Group */}
               <div>
                 <h4 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2 px-3">My Account</h4>
                 <nav className="space-y-0.5 text-[14px] font-medium">
                   <a href="#profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary-500/10 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 transition-colors">
                     <AppIcon name="user" size="sm" className="text-primary-500" /> Profile Details
                   </a>
                   <a href="#orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors">
                     <AppIcon name="products" size="sm" className="text-neutral-500" /> My Orders
                   </a>
                   <a href="#events" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors">
                     <AppIcon name="events" size="sm" className="text-neutral-500" /> Event Bookings
                   </a>
                   <a href="#welfare" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors">
                     <AppIcon name="heart" size="sm" className="text-red-500" /> Cow Support
                   </a>
                 </nav>
               </div>

               {/* Administrative Portal Group (Only shown to Admin or Manager) */}
               {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                 <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                   <h4 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2 px-3">Administrative</h4>
                   <nav className="space-y-1.5 px-1">
                     <a 
                       href={`/${currentLocale}/${userRole === 'ADMIN' ? 'admin' : 'manager'}`} 
                       className="group flex flex-col gap-1 p-3.5 rounded-xl border border-primary-200/50 dark:border-primary-900/30 bg-gradient-to-br from-primary-50/50 to-primary-100/10 dark:from-primary-950/20 dark:to-primary-900/5 hover:from-primary-50 dark:hover:from-primary-950/30 transition-all shadow-sm hover:shadow-md duration-200 text-left"
                     >
                       <span className="flex items-center justify-between text-[13.5px] font-bold text-primary-700 dark:text-primary-400">
                         <span className="flex items-center gap-2">
                           <AppIcon name="dashboard" size="sm" className="text-primary-500" />
                           {userRole === 'ADMIN' ? 'Admin Workspace' : 'Manager Workspace'}
                         </span>
                         <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-primary-200/70 text-primary-800 dark:bg-primary-950 dark:text-primary-300 border border-primary-300/30 dark:border-primary-800/40 uppercase tracking-wider">
                           {translateIfKey(`MockData.roles.${userRole.toLowerCase()}`)}
                         </span>
                       </span>
                       <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium leading-normal pl-6 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                         {userRole === 'ADMIN' 
                           ? 'Full sanctuary dashboard, manage products, events and set up manager accesses.' 
                           : 'View assigned administrative boards and cow sanctuary operations.'
                         }
                       </span>
                     </a>
                   </nav>
                 </div>
               )}
            </div>

            <div className="mt-auto pt-6">
              {/* Separator & Sign Out */}
              <div className="border-t border-neutral-200 dark:border-neutral-800/60 mb-4"></div>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500/90 dark:text-red-400/90 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-medium text-[14px] disabled:opacity-60"
              >
                <AppIcon name="logout" size="sm" />
                {isSigningOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          </div>

          {/* Main Content Pane */}
          <div className="flex-1 w-full bg-card rounded-[14px] border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
             
             {/* Top Breadcrumb */}
             <div className="flex items-center gap-2 px-8 py-5 border-b border-neutral-100 dark:border-neutral-800/60 bg-card text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">My Account</span>
                <span className="text-neutral-300 dark:text-neutral-600">/</span>
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <AppIcon name="user" size="sm" /> Profile
                </span>
             </div>

             {/* Header section with background pattern and Avatar */}
             <div className="relative pt-10 pb-8 flex flex-col items-center bg-card">
                {/* Subtle checkered pattern */}
                <div className="absolute inset-x-0 top-0 h-40 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    {/* Avatar Ring */}
                    <div className="relative mb-3 group">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-card shadow-sm border border-neutral-100 dark:border-neutral-800 relative z-30">
                        {/* Avatar Image / Letter */}
                        <div className="w-full h-full rounded-full bg-primary-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-medium overflow-hidden relative">
                          {profilePicture ? (
                            <Image src={profilePicture} alt="Profile" fill className="object-cover" />
                          ) : (
                            <span className="z-10">{translateIfKey(computedFullName).charAt(0).toUpperCase()}</span>
                          )}
                          
                          {/* Image Upload Overlay */}
                          <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center z-20">
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleProfilePictureUpload(e.target.files[0]);
                              }
                            }} />
                            <AppIcon name="camera" size="xl" className="text-white" />
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Name & Badge */}
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{translateIfKey(computedFullName)}</h2>
                      {/* Verified blue checkmark */}
                      <StatusIcon status="verified" size="md" showBackground={false} className="text-blue-500" />
                    </div>
                    
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{userEmail}</p>
                </div>
             </div>

             {/* Grid Details Area */}
             <div className="p-6 sm:p-8 bg-neutral-50/50 dark:bg-neutral-900/20 grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 border-t border-neutral-100 dark:border-neutral-800">
                
                {/* 1. Personal Details Section */}
                <PersonalDetailsSection 
                  personalDetails={personalDetails}
                  tempPersonalDetails={tempPersonalDetails}
                  setTempPersonalDetails={setTempPersonalDetails}
                  isEditingPersonal={isEditingPersonal}
                  setIsEditingPersonal={setIsEditingPersonal}
                  savePersonalDetails={savePersonalDetails}
                  hasPersonalChanges={hasPersonalChanges}
                  userEmail={userEmail}
                  translateIfKey={translateIfKey}
                />

                {/* 2. Account Details Section */}
                <AccountDetailsSection 
                  accountDetails={accountDetails}
                  tempAccountDetails={tempAccountDetails}
                  setTempAccountDetails={setTempAccountDetails}
                  isEditingAccount={isEditingAccount}
                  setIsEditingAccount={setIsEditingAccount}
                  saveAccountDetails={saveAccountDetails}
                  hasAccountChanges={hasAccountChanges}
                  userRole={userRole}
                  emailVerified={emailVerified}
                  translateIfKey={translateIfKey}
                />

                {/* 3. Security & Access Section */}
                <SecuritySection />

                {/* 4. Preferences Section */}
                <PreferencesSection />

             </div>

             {/* Danger Zone */}
             <div id="delete-account" className="p-6 sm:p-8 bg-neutral-50/50 dark:bg-neutral-900/20 border-t border-neutral-100 dark:border-neutral-800 scroll-mt-24">
                <div className="bg-card rounded-[14px] border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
                  <h3 className="text-[22px] font-bold text-red-500 mb-2 tracking-tight">Delete Your Account</h3>
                  <p className="text-[15px] text-neutral-600 dark:text-neutral-400 font-medium mb-6">We will check if your account can be deleted</p>
                  
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-2 text-red-500 text-[13px] font-bold tracking-wider uppercase mb-4">
                      <AppIcon name="alert" size="md" />
                      WARNING: THIS ACTION IS PERMANENT
                    </div>
                    <ul className="space-y-3 text-[14px] text-neutral-700 dark:text-neutral-300 font-medium list-none ml-1">
                      <li className="flex items-center gap-3">
                        <span className="w-1 h-1 rounded-full bg-red-500"></span>
                        Personal profile and login details
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-1 h-1 rounded-full bg-red-500"></span>
                        Saved addresses and payment methods
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-1 h-1 rounded-full bg-red-500"></span>
                        Shopping cart and wishlist items
                      </li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="px-6 py-3 rounded-full bg-red-50 dark:bg-red-950/30 text-red-500 font-bold text-[13px] tracking-wide border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors uppercase"
                  >
                    Delete my account
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal (Client Overlay Leaf) */}
      <DeleteAccountModal 
        showDeleteModal={showDeleteModal} 
        setShowDeleteModal={setShowDeleteModal} 
      />
    </div>
  );
}
