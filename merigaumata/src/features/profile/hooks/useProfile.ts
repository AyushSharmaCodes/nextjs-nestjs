'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Role, PersonalDetails, AccountDetails } from '../types/profile.types';
import { profileService } from '../services/profile.service';
import { useStrictAuth } from '../../auth/hooks/useStrictAuth';
import { profileKeys } from './profileKeys';
import { logError } from '@/shared/lib/errors';
import { toast } from '@/shared/lib/toast';

export function useProfile() {
  const queryClient = useQueryClient();

  const authState = useStrictAuth();
  const isAuthenticated = authState.status === 'authenticated';
  const userRole = authState.user?.role || 'CUSTOMER';

  const { data: media = { avatarUrl: null, coverUrl: null }, isPending: isMediaPending } = useQuery({
    queryKey: profileKeys.media(),
    queryFn: profileService.getMedia,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60000,
  });

  const { data: personalDetails = {
    firstName: '',
    lastName: '',
    dob: null,
    gender: null,
    genderId: null,
    nationality: null,
    nationalityCountryCode: null,
    preferredCurrency: 'INR',
    emailNotification: true,
    phoneCountryId: null,
    address: '',
    phone: '',
  }, isPending: isPersonalPending } = useQuery<PersonalDetails>({
    queryKey: profileKeys.personal(),
    queryFn: profileService.getPersonalDetails,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30000, // Refetch every 30 seconds for "realtime" feel
  });

  const { data: accountDetails = { timeZone: 'UTC' }, isPending: isAccountPending } = useQuery<AccountDetails>({
    queryKey: profileKeys.account(),
    queryFn: profileService.getAccountDetails,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30000, // Refetch every 30 seconds for "realtime" feel
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

  // Media Mutations
  const uploadAvatarMutation = useMutation({
    mutationFn: profileService.uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.media() });
      toast.success('Avatar updated successfully');
    },
    onError: (error) => {
      logError(error, { feature: 'profile', action: 'uploadAvatar' });
      toast.error('Failed to update avatar');
    }
  });

  const removeAvatarMutation = useMutation({
    mutationFn: profileService.removeAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.media() });
      toast.success('Avatar removed');
    },
  });

  const uploadCoverMutation = useMutation({
    mutationFn: profileService.uploadCover,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.media() });
      toast.success('Cover photo updated successfully');
    },
    onError: (error) => {
      logError(error, { feature: 'profile', action: 'uploadCover' });
      toast.error('Failed to update cover photo');
    }
  });

  const removeCoverMutation = useMutation({
    mutationFn: profileService.removeCover,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.media() });
      toast.success('Cover photo removed');
    },
  });

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
    profilePicture: media.avatarUrl,
    coverPicture: media.coverUrl,
    handleProfilePictureUpload: (file: File) => uploadAvatarMutation.mutate(file),
    handleCoverPictureUpload: (file: File) => uploadCoverMutation.mutate(file),
    removeAvatar: () => removeAvatarMutation.mutate(),
    removeCover: () => removeCoverMutation.mutate(),
    isUploadingAvatar: uploadAvatarMutation.isPending,
    isUploadingCover: uploadCoverMutation.isPending,
    personalDetails,
    tempPersonalDetails,
    setTempPersonalDetails,
    isEditingPersonal,
    setIsEditingPersonal,
    savePersonalDetails: () => savePersonalMutation.mutate(tempPersonalDetails),
    saveCurrency: (currency: string) => savePersonalMutation.mutate({
      ...personalDetails,
      preferredCurrency: currency
    }),
    saveEmailNotification: (subscribed: boolean) => {
      savePersonalMutation.mutate({
        ...personalDetails,
        emailNotification: subscribed
      }, {
        onSuccess: () => {
          toast.success(subscribed ? 'Subscribed to email notifications' : 'Unsubscribed from email notifications');
        },
        onError: () => {
          toast.error('Failed to update email preferences');
        }
      });
    },
    hasPersonalChanges,
    accountDetails,
    tempAccountDetails,
    setTempAccountDetails,
    isEditingAccount,
    setIsEditingAccount,
    saveAccountDetails: () => saveAccountMutation.mutate(tempAccountDetails),
    hasAccountChanges,
    isPersonalPending,
    isAccountPending,
    isMediaPending,
  };
}
