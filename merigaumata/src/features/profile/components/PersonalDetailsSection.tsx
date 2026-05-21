'use client';

import { AppIcon } from '@/shared/icons';
import { useTranslations } from 'next-intl';
import { PersonalDetails } from '../types/profile.types';

interface PersonalDetailsSectionProps {
  personalDetails: PersonalDetails;
  tempPersonalDetails: PersonalDetails;
  setTempPersonalDetails: (details: PersonalDetails) => void;
  isEditingPersonal: boolean;
  setIsEditingPersonal: (val: boolean) => void;
  savePersonalDetails: () => void;
  hasPersonalChanges: boolean;
  userEmail: string;
  translateIfKey: (text: string) => string;
}

const DetailRow = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-neutral-100 dark:border-neutral-800/60 gap-1 sm:gap-4 group last:border-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors px-6">
    <div className="w-full sm:w-1/3 text-[14px] text-neutral-500 dark:text-neutral-400 font-medium">{label}</div>
    <div className="w-full sm:w-2/3 text-[14px] text-foreground font-medium">{value}</div>
  </div>
);

export function PersonalDetailsSection({
  personalDetails,
  tempPersonalDetails,
  setTempPersonalDetails,
  isEditingPersonal,
  setIsEditingPersonal,
  savePersonalDetails,
  hasPersonalChanges,
  userEmail,
  translateIfKey,
}: PersonalDetailsSectionProps) {
  const t = useTranslations('profile');

  return (
    <div className="bg-card rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col relative h-max">
      <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-card">
        <h3 className="font-semibold text-foreground">{t('personalDetails.title')}</h3>
        {!isEditingPersonal && (
          <button 
            onClick={() => { setIsEditingPersonal(true); setTempPersonalDetails(personalDetails); }} 
            className="text-neutral-500 hover:text-foreground transition-colors flex items-center gap-1.5 text-sm font-medium focus:outline-none"
          >
            <AppIcon name="edit2" size="xs" /> Edit
          </button>
        )}
      </div>
      <div className="flex flex-col py-1 flex-1">
        {isEditingPersonal ? (
          <div className="p-6 grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">First name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                  value={translateIfKey(tempPersonalDetails.firstName)} 
                  onChange={e => setTempPersonalDetails({...tempPersonalDetails, firstName: e.target.value})} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">Last name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                  value={translateIfKey(tempPersonalDetails.lastName)} 
                  onChange={e => setTempPersonalDetails({...tempPersonalDetails, lastName: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">Date of Birth</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                value={tempPersonalDetails.dob} 
                onChange={e => setTempPersonalDetails({...tempPersonalDetails, dob: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">Gender</label>
              <select 
                className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                value={translateIfKey(tempPersonalDetails.gender)} 
                onChange={e => setTempPersonalDetails({...tempPersonalDetails, gender: e.target.value})}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">Nationality</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                value={translateIfKey(tempPersonalDetails.nationality)} 
                onChange={e => setTempPersonalDetails({...tempPersonalDetails, nationality: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">Address</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                value={translateIfKey(tempPersonalDetails.address)} 
                onChange={e => setTempPersonalDetails({...tempPersonalDetails, address: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">Phone</label>
              <input 
                type="tel" 
                className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                value={tempPersonalDetails.phone} 
                onChange={e => setTempPersonalDetails({...tempPersonalDetails, phone: e.target.value})} 
              />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button 
                onClick={() => setIsEditingPersonal(false)} 
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-foreground transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button 
                onClick={savePersonalDetails} 
                disabled={!hasPersonalChanges}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${hasPersonalChanges ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm' : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'}`}
              >
                {t('saveChanges')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <DetailRow label="First name:" value={translateIfKey(personalDetails.firstName)} />
            <DetailRow label="Last name:" value={translateIfKey(personalDetails.lastName)} />
            <DetailRow label="Date of Birth:" value={personalDetails.dob ? new Date(personalDetails.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}) : ''} />
            <DetailRow label="Gender:" value={translateIfKey(personalDetails.gender)} />
            <DetailRow label="Nationality:" value={translateIfKey(personalDetails.nationality)} />
            <DetailRow label="Address:" value={<span className="flex items-center gap-2"><AppIcon name="mapPin" size="xs" className="text-neutral-400" /> {translateIfKey(personalDetails.address)}</span>} />
            <DetailRow label="Phone Number:" value={personalDetails.phone} />
            <DetailRow label="Email:" value={userEmail} />
          </>
        )}
      </div>
    </div>
  );
}
