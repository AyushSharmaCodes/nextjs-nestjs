'use client';

import { useState, useEffect } from 'react';
import { useStrictAuth } from '@/features/auth/hooks/useStrictAuth';
import { authClient } from '@/lib/auth-client';
import { useRouter, Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { toast } from '@/shared/lib/toast';

const DetailRow = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-neutral-100 dark:border-neutral-800/60 gap-1 sm:gap-4 group last:border-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors px-6">
    <div className="w-full sm:w-1/3 text-[14px] text-neutral-500 dark:text-neutral-400 font-medium">{label}</div>
    <div className="w-full sm:w-2/3 text-[14px] text-foreground font-medium">{value}</div>
  </div>
);

export function SecuritySection() {
  const authState = useStrictAuth();
  const router = useRouter();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Detect whether account has a credential (password) provider
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  const user = authState.status === 'authenticated' ? authState.user : null;
  const twoFactorEnabled = user?.twoFactorEnabled || false;
  const emailVerified = user?.emailVerified || false;

  useEffect(() => {
    if (authState.status !== 'authenticated') return;
    authClient.listAccounts().then(({ data, error }) => {
      if (error || !data) { setHasPassword(false); return; }
      setHasPassword(data.some(acc => acc.providerId === 'credential'));
    });
  }, [authState.status]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await authClient.changePassword({
        newPassword: passwordForm.new,
        currentPassword: passwordForm.current,
        revokeOtherSessions: true,
      });
      if (res.error) {
        setErrorMsg(res.error.message || 'Failed to change password');
        toast.error('Password update failed', { description: res.error.message });
      } else {
        toast.success('Password updated', { description: 'Your password has been changed successfully.' });
        setIsChangingPassword(false);
        setPasswordForm({ current: '', new: '', confirm: '' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setErrorMsg(msg);
      toast.error('Password update failed', { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      // For OAuth/Magic Link users, we attempt changePassword with empty currentPassword
      const res = await authClient.changePassword({ newPassword: passwordForm.new, currentPassword: '', revokeOtherSessions: true });
      if (res?.error) {
        setErrorMsg(res.error.message || 'Failed to set password');
        toast.error('Failed to set password', { description: res.error.message });
      } else {
        toast.success('Password set!', { description: 'You can now enable Two-Factor Authentication.' });
        setIsChangingPassword(false);
        setPasswordForm({ current: '', new: '', confirm: '' });
        setHasPassword(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setErrorMsg(msg);
      toast.error('Failed to set password', { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!user?.email) return;
    setIsSendingVerification(true);
    try {
      const [, maybeLocale] = window.location.pathname.split('/');
      const locale = (routing.locales as readonly string[]).includes(maybeLocale)
        ? maybeLocale
        : routing.defaultLocale;
      const callbackURL = `${window.location.origin}/${locale}/auth/verify`;

      const res = await authClient.sendVerificationEmail({ email: user.email, callbackURL });
      if (res?.error) {
        toast.error('Failed to send verification email', { description: res.error.message });
      } else {
        toast.success('Verification email sent!', { description: `Check your inbox at ${user.email}` });
      }
    } catch (err: unknown) {
      toast.error('Failed to send verification email');
    } finally {
      setIsSendingVerification(false);
    }
  };

  return (
    <div id="security" className="bg-card rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col h-max scroll-mt-24">
      <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <h3 className="font-semibold text-foreground">Security & Access</h3>
      </div>
      <div className="flex flex-col py-1">

        {/* Email Verification Row */}
        <DetailRow label="Email Verified:" value={
          <div className="flex items-center justify-between w-full">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[12px] font-medium ${
              emailVerified
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30'
                : 'bg-amber-50 text-amber-600 border border-amber-200/50 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30'
            }`}>
              {emailVerified ? '✓ Verified' : '⚠ Not Verified'}
            </span>
            {!emailVerified && (
              <button
                onClick={handleSendVerificationEmail}
                disabled={isSendingVerification}
                className="text-[13px] font-semibold text-foreground hover:underline decoration-1 underline-offset-2 focus:outline-none disabled:opacity-50"
              >
                {isSendingVerification ? 'Sending…' : 'Send Verification Email'}
              </button>
            )}
          </div>
        } />

        {/* Password Row */}
        {isChangingPassword ? (
           <div className="p-6 border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/30 dark:bg-neutral-900/10 animate-in fade-in duration-200">
             <form onSubmit={hasPassword ? handlePasswordChange : handleSetPassword} className="grid grid-cols-1 gap-4 max-w-sm">
               {hasPassword && (
                 <div className="space-y-1.5">
                   <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">Current Password</label>
                   <input
                     type="password"
                     required
                     className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                     value={passwordForm.current}
                     onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                   />
                 </div>
               )}
               <div className="space-y-1.5">
                 <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">New Password</label>
                 <input
                   type="password"
                   required
                   minLength={8}
                   className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                   value={passwordForm.new}
                   onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-[13px] font-semibold text-foreground dark:text-neutral-300">Confirm Password</label>
                 <input
                   type="password"
                   required
                   minLength={8}
                   className="w-full px-4 py-2 border rounded-lg bg-card border-neutral-200 dark:border-neutral-700 text-foreground text-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                   value={passwordForm.confirm}
                   onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                 />
               </div>
               {errorMsg && (
                 <p className="text-red-500 text-xs font-semibold px-1">{errorMsg}</p>
               )}
               <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-bold bg-neutral-900 text-white dark:bg-white dark:text-black rounded-xl shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors focus:outline-none disabled:opacity-50"
                  >
                    {isLoading ? 'Saving…' : hasPassword ? 'Update Password' : 'Set Password'}
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => { setIsChangingPassword(false); setErrorMsg(''); }}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-foreground transition-colors focus:outline-none disabled:opacity-50"
                  >
                    Cancel
                  </button>
               </div>
             </form>
           </div>
        ) : (
          <DetailRow label="Password:" value={
            <div className="flex items-center justify-between w-full">
              <span>{hasPassword ? '••••••••' : <span className="text-neutral-400 text-[13px] font-normal italic">No password set</span>}</span>
              <button
                onClick={() => setIsChangingPassword(true)}
                className="text-[13px] font-semibold text-foreground hover:underline decoration-1 underline-offset-2 focus:outline-none"
              >
                {hasPassword ? 'Change Password' : 'Set Password'}
              </button>
            </div>
          } />
        )}

        {/* 2FA Row */}
        <DetailRow label="Two-Factor Authentication:" value={
          <div className="flex items-center justify-between w-full">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium ${twoFactorEnabled ? 'bg-purple-50 text-purple-600 border border-purple-200/50 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'}`}>
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
            {hasPassword === false && !twoFactorEnabled ? (
              <span className="text-[12px] text-amber-600 dark:text-amber-400 font-medium">
                Set a password first to enable 2FA
              </span>
            ) : (
              <Link
                href="/auth/setup2FA"
                className="text-[13px] font-semibold text-foreground hover:underline decoration-1 underline-offset-2 focus:outline-none"
              >
                {twoFactorEnabled ? 'Manage / Disable 2FA' : 'Enable 2FA'}
              </Link>
            )}
          </div>
        } />
      </div>
    </div>
  );
}
