'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Role, PersonalDetails, AccountDetails } from '../types/profile.types';
import { profileService } from '../services/profile.service';
import { profileKeys } from './profileKeys';
import { logError } from '@/shared/lib/errors';

export function useProfile() {
  const queryClient = useQueryClient();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // Clean up object URL to prevent browser memory leaks
  useEffect(() => {
    return () => {
      if (profilePicture && profilePicture.startsWith('blob:')) {
        URL.revokeObjectURL(profilePicture);
      }
    };
  }, [profilePicture]);

  // Queries
  const { data: userRole = 'USER' } = useQuery<Role>({
    queryKey: profileKeys.role(),
    queryFn: async () => profileService.getUserRole(),
    staleTime: Infinity,
  });

  const { data: personalDetails = {
    fullName: '',
    dob: '',
    gender: '',
    nationality: '',
    address: '',
    phone: '',
  } } = useQuery<PersonalDetails>({
    queryKey: profileKeys.personal(),
    queryFn: profileService.getPersonalDetails,
    staleTime: 5 * 60 * 1000,
  });

  const { data: accountDetails = {
    displayName: '',
    timeZone: '',
  } } = useQuery<AccountDetails>({
    queryKey: profileKeys.account(),
    queryFn: profileService.getAccountDetails,
    staleTime: 5 * 60 * 1000,
  });

  // Local temp editing states
  const [tempPersonalDetailsState, setTempPersonalDetailsState] = useState<PersonalDetails | null>(null);
  const [isEditingPersonal, setIsEditingPersonalState] = useState(false);

  const [tempAccountDetailsState, setTempAccountDetailsState] = useState<AccountDetails | null>(null);
  const [isEditingAccount, setIsEditingAccountState] = useState(false);

  // Expose standard temp structures computed dynamically on-the-fly during render (derived state)
  const tempPersonalDetails = tempPersonalDetailsState !== null ? tempPersonalDetailsState : personalDetails;
  const tempAccountDetails = tempAccountDetailsState !== null ? tempAccountDetailsState : accountDetails;

  const setTempPersonalDetails = (details: PersonalDetails | ((prev: PersonalDetails) => PersonalDetails)) => {
    setTempPersonalDetailsState((prev) => {
      const current = prev !== null ? prev : personalDetails;
      return typeof details === 'function' ? details(current) : details;
    });
  };

  const setTempAccountDetails = (details: AccountDetails | ((prev: AccountDetails) => AccountDetails)) => {
    setTempAccountDetailsState((prev) => {
      const current = prev !== null ? prev : accountDetails;
      return typeof details === 'function' ? details(current) : details;
    });
  };

  const setIsEditingPersonal = (editing: boolean) => {
    setIsEditingPersonalState(editing);
    if (!editing) {
      setTempPersonalDetailsState(null);
    }
  };

  const setIsEditingAccount = (editing: boolean) => {
    setIsEditingAccountState(editing);
    if (!editing) {
      setTempAccountDetailsState(null);
    }
  };

  const handleProfilePictureUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setProfilePicture(url);
  };

  // Mutations
  const savePersonalMutation = useMutation({
    mutationFn: profileService.updatePersonalDetails,
    onSuccess: (updated) => {
      queryClient.setQueryData(profileKeys.personal(), updated);
      setIsEditingPersonal(false);
    },
    onError: (error) => {
      logError(error, { feature: 'profile', action: 'updatePersonalDetails' });
    }
  });

  const saveAccountMutation = useMutation({
    mutationFn: profileService.updateAccountDetails,
    onSuccess: (updated) => {
      queryClient.setQueryData(profileKeys.account(), updated);
      setIsEditingAccount(false);
    },
    onError: (error) => {
      logError(error, { feature: 'profile', action: 'updateAccountDetails' });
    }
  });

  const hasPersonalChanges = JSON.stringify(personalDetails) !== JSON.stringify(tempPersonalDetails);
  const hasAccountChanges = JSON.stringify(accountDetails) !== JSON.stringify(tempAccountDetails);

  return {
    userRole,
    profilePicture,
    handleProfilePictureUpload,
    personalDetails,
    tempPersonalDetails,
    setTempPersonalDetails,
    isEditingPersonal,
    setIsEditingPersonal,
    savePersonalDetails: () => savePersonalMutation.mutate(tempPersonalDetails),
    hasPersonalChanges,
    accountDetails,
    tempAccountDetails,
    setTempAccountDetails,
    isEditingAccount,
    setIsEditingAccount,
    saveAccountDetails: () => saveAccountMutation.mutate(tempAccountDetails),
    hasAccountChanges,
  };
}
