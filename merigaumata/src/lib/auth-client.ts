import { createAuthClient } from 'better-auth/react';
import { magicLinkClient, twoFactorClient, emailOTPClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { clientEnv } from '@/core/env/client';

export const authClient = createAuthClient({
  baseURL: clientEnv.NEXT_PUBLIC_API_URL,
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [
    magicLinkClient(),
    emailOTPClient(),
    twoFactorClient(),
    inferAdditionalFields({
      user: {
        lastName: { type: 'string' }
      }
    })
  ],
});
