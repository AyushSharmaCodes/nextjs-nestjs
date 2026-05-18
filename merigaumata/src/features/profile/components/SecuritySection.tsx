'use client';

import { useState } from 'react';

const DetailRow = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-neutral-100 dark:border-neutral-800/60 gap-1 sm:gap-4 group last:border-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors px-6">
    <div className="w-full sm:w-1/3 text-[14px] text-neutral-500 dark:text-neutral-400 font-medium">{label}</div>
    <div className="w-full sm:w-2/3 text-[14px] text-foreground font-medium">{value}</div>
  </div>
);

export function SecuritySection() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new === passwordForm.confirm) {
      alert("Password successfully updated!");
      setIsChangingPassword(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
    } else {
      alert("Passwords do not match");
    }
  };

  return (
    <div id="security" className="bg-card rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col h-max scroll-mt-24">
      <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <h3 className="font-semibold text-foreground">Security & Access</h3>
      </div>
      <div className="flex flex-col py-1">
        {isChangingPassword ? (
           <div className="p-6 border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/30 dark:bg-neutral-900/10 animate-in fade-in duration-200">
             <form onSubmit={handlePasswordReset} className="grid grid-cols-1 gap-4 max-w-sm">
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
               <div className="flex gap-2 pt-2">
                  <button 
                    type="submit" 
                    className="px-4 py-2 text-sm font-bold bg-neutral-900 text-white dark:bg-white dark:text-black rounded-xl shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors focus:outline-none"
                  >
                    Update Password
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsChangingPassword(false)} 
                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-foreground transition-colors focus:outline-none"
                  >
                    Cancel
                  </button>
               </div>
             </form>
           </div>
        ) : (
          <DetailRow label="Password:" value={
            <div className="flex items-center justify-between w-full">
              <span>••••••••</span>
              <button 
                onClick={() => setIsChangingPassword(true)} 
                className="text-[13px] font-semibold text-foreground hover:underline decoration-1 underline-offset-2 focus:outline-none"
              >
                Change Password
              </button>
            </div>
          } />
        )}
        
        <DetailRow label="Two-Factor Authentication:" value={
          <div className="flex items-center justify-between w-full">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium ${twoFactorEnabled ? 'bg-purple-50 text-purple-600 border border-purple-200/50 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'}`}>
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <button 
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)} 
              className="text-[13px] font-semibold text-foreground hover:underline decoration-1 underline-offset-2 focus:outline-none"
            >
              {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>
        } />
        <DetailRow label="Security Questions Set:" value="Yes" />
        <DetailRow label="Connected Devices:" value="3 Devices" />
        <DetailRow label="Recent Activity:" value="No Suspicious Activity" />
      </div>
    </div>
  );
}
