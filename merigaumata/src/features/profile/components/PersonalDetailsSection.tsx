'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppIcon } from '@/shared/icons';
import { useTranslations } from 'next-intl';
import { PersonalDetails, CountryOption, GenderOption } from '../types/profile.types';
import { profileService } from '../services/profile.service';
import { profileKeys } from '../hooks/profileKeys';
import { EmailChangeModal } from './EmailChangeModal';

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

  const { data: countries = [] } = useQuery<CountryOption[]>({
    queryKey: profileKeys.countries(),
    queryFn: profileService.getCountries,
  });

  const { data: genders = [] } = useQuery<GenderOption[]>({
    queryKey: profileKeys.genders(),
    queryFn: profileService.getGenders,
  });

  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  useEffect(() => {
    if (isCountryDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isCountryDropdownOpen]);

  // Client-side auto-populate phoneCountryId based on nationality selection
  useEffect(() => {
    if (
      isEditingPersonal &&
      !tempPersonalDetails.phoneCountryId &&
      tempPersonalDetails.nationalityCountryCode &&
      countries.length > 0
    ) {
      const match = countries.find(c => c.iso2 === tempPersonalDetails.nationalityCountryCode);
      if (match) {
        setTempPersonalDetails({
          ...tempPersonalDetails,
          phoneCountryId: match.id,
        });
      }
    }
  }, [
    isEditingPersonal,
    tempPersonalDetails.phoneCountryId,
    tempPersonalDetails.nationalityCountryCode,
    countries,
    setTempPersonalDetails,
  ]);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.iso2.toLowerCase().includes(countrySearch.toLowerCase())
  );

  /** Countries that actually have a dial code (filter out territories with no phonecode) */
  const dialCountries = countries.filter(c => c.phonecode);

  // ── Derived helpers ────────────────────────────────────────────────────────

  /** Look up the selected phone country by id and return its normalised phonecode (e.g. "+91") */
  const getPhoneCodeDisplay = (countryId?: number | null): string => {
    if (!countryId) return '';
    const c = countries.find(x => x.id === countryId);
    if (!c?.phonecode) return '';
    return c.phonecode.startsWith('+') ? c.phonecode : `+${c.phonecode}`;
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const selectCountry = (country: CountryOption) => {
    setTempPersonalDetails({
      ...tempPersonalDetails,
      nationality: country.name,
      nationalityCountryCode: country.iso2,
      preferredCurrency: country.currency || 'INR',
      // Auto-populate the phone country FK from the newly selected nationality
      phoneCountryId: country.id,
    });
    setCountrySearch('');
    setIsCountryDropdownOpen(false);
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedGender = genders.find(g => g.id === selectedId);
    setTempPersonalDetails({
      ...tempPersonalDetails,
      genderId: selectedId || null,
      gender: selectedGender ? selectedGender.name : null,
    });
  };

  const handlePhoneCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? Number(e.target.value) : null;
    setTempPersonalDetails({ ...tempPersonalDetails, phoneCountryId: id });
  };

  return (
    <div className="bg-card rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col relative h-max">
      <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-card">
        <h3 className="font-semibold text-foreground">{t('personalDetails.title')}</h3>
        {!isEditingPersonal && (
          <button
            onClick={() => { setIsEditingPersonal(true); setTempPersonalDetails(personalDetails); }}
            className="text-neutral-500 hover:text-foreground transition-colors flex items-center gap-1.5 text-sm font-medium focus:outline-none"
          >
            <AppIcon name="edit2" size="xs" /> {t('edit')}
          </button>
        )}
      </div>
      <div className="flex flex-col py-1 flex-1">
        {isEditingPersonal ? (
          <div className="p-6 grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">{t('personalForm.firstName')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                  value={translateIfKey(tempPersonalDetails.firstName) || ''}
                  onChange={e => setTempPersonalDetails({...tempPersonalDetails, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">{t('personalForm.lastName')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                  value={translateIfKey(tempPersonalDetails.lastName) || ''}
                  onChange={e => setTempPersonalDetails({...tempPersonalDetails, lastName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">{t('personalForm.dateOfBirth')}</label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                value={tempPersonalDetails.dob ? (tempPersonalDetails.dob.includes('T') ? tempPersonalDetails.dob.split('T')[0] : tempPersonalDetails.dob) : ''}
                onChange={e => setTempPersonalDetails({...tempPersonalDetails, dob: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">{t('personalForm.gender')}</label>
              <select
                className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                value={tempPersonalDetails.genderId || ''}
                onChange={handleGenderChange}
              >
                <option value="">{t('personalForm.selectGender')}</option>
                {genders.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Nationality dropdown */}
            <div className="space-y-1.5" ref={dropdownRef}>
              <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">{t('personalForm.nationality')}</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm flex justify-between items-center focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 text-left"
                >
                  <span className="truncate">
                    {tempPersonalDetails.nationality ? (
                      <span className="flex items-center gap-2">
                        {countries.find(c => c.iso2 === tempPersonalDetails.nationalityCountryCode)?.emoji && (
                          <span>{countries.find(c => c.iso2 === tempPersonalDetails.nationalityCountryCode)?.emoji}</span>
                        )}
                        <span>{translateIfKey(tempPersonalDetails.nationality)}</span>
                      </span>
                    ) : (
                      <span className="text-neutral-400">{t('personalForm.selectNationality')}</span>
                    )}
                  </span>
                  <AppIcon name="chevronDown" size="sm" className="text-neutral-400" />
                </button>

                {isCountryDropdownOpen && (
                  <div className="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-card shadow-lg flex flex-col">
                    <input
                      type="text"
                      ref={searchInputRef}
                      placeholder={t('personalForm.searchCountry')}
                      className="w-full px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 text-foreground text-sm bg-transparent outline-none focus:border-neutral-300 dark:focus:border-neutral-600"
                      value={countrySearch}
                      onChange={e => setCountrySearch(e.target.value)}
                    />
                    <div className="max-h-48 overflow-y-auto bg-card" data-lenis-prevent>
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map(country => (
                          <button
                            key={country.id}
                            type="button"
                            onClick={() => selectCountry(country)}
                            className="w-full px-4 py-2 text-sm text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer flex items-center gap-2 text-left"
                          >
                            {country.emoji && <span>{country.emoji}</span>}
                            <span>{country.name}</span>
                            <span className="text-neutral-400 text-xs ml-auto">({country.iso2})</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-neutral-500 text-center">{t('personalForm.noCountries')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">{t('personalForm.address')}</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                value={translateIfKey(tempPersonalDetails.address) || ''}
                onChange={e => setTempPersonalDetails({...tempPersonalDetails, address: e.target.value})}
              />
            </div>

            {/* Phone number — country code select (by country id) + subscriber number */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">{t('personalForm.phone')}</label>
              <div className="flex gap-2">
                {/* Dial-code country selector — value is country.id (integer FK) */}
                <div className="relative w-44 shrink-0">
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 appearance-none cursor-pointer pr-8"
                    value={tempPersonalDetails.phoneCountryId ?? ''}
                    onChange={handlePhoneCountryChange}
                  >
                    <option value="">{t('personalForm.selectCode')}</option>
                    {dialCountries.map(c => {
                      const code = c.phonecode!.startsWith('+') ? c.phonecode! : `+${c.phonecode!}`;
                      return (
                        <option key={c.id} value={c.id}>
                          {c.emoji} {code} ({c.name})
                        </option>
                      );
                    })}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                    <AppIcon name="chevronDown" size="sm" />
                  </div>
                </div>
                <input
                  type="tel"
                  placeholder={t('personalForm.phonePlaceholder')}
                  className="flex-1 px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                  value={tempPersonalDetails.phone || ''}
                  onChange={e => setTempPersonalDetails({...tempPersonalDetails, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setIsEditingPersonal(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-foreground transition-colors focus:outline-none"
              >
                {t('cancel')}
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
            <DetailRow label={`${t('personalDetails.firstName')}:`} value={translateIfKey(personalDetails.firstName)} />
            <DetailRow label={`${t('personalDetails.lastName')}:`} value={translateIfKey(personalDetails.lastName)} />
            <DetailRow label={`${t('personalDetails.dateOfBirth')}:`} value={personalDetails.dob ? new Date(personalDetails.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}) : ''} />
            <DetailRow label={`${t('personalDetails.gender')}:`} value={translateIfKey(personalDetails.gender || '')} />
            <DetailRow label={`${t('personalDetails.nationality')}:`} value={
              <span className="flex items-center gap-2">
                {countries.find(c => c.iso2 === personalDetails.nationalityCountryCode)?.emoji && (
                  <span>{countries.find(c => c.iso2 === personalDetails.nationalityCountryCode)?.emoji}</span>
                )}
                <span>{translateIfKey(personalDetails.nationality || '')}</span>
              </span>
            } />
            <DetailRow label={`${t('accountDetails.address')}:`} value={<span className="flex items-center gap-2"><AppIcon name="mapPin" size="xs" className="text-neutral-400" /> {translateIfKey(personalDetails.address)}</span>} />
            <DetailRow
              label={`${t('personalDetails.phone')}:`}
              value={(() => {
                const code = getPhoneCodeDisplay(personalDetails.phoneCountryId);
                return code
                  ? `${code} ${personalDetails.phone || ''}`.trim()
                  : (personalDetails.phone || '—');
              })()}
            />
            <DetailRow
              label={`${t('personalDetails.email')}:`}
              value={
                <div className="flex justify-between items-center w-full">
                  <span className="truncate">{userEmail}</span>
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(true)}
                    className="text-[13px] font-semibold text-neutral-500 hover:text-foreground transition-colors hover:underline decoration-1 underline-offset-2 focus:outline-none shrink-0"
                  >
                    {t('personalForm.changeEmail')}
                  </button>
                </div>
              }
            />
          </>
        )}
      </div>

      {/* Email Change Modal overlay leaf */}
      <EmailChangeModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
    </div>
  );
}
