import { Module, Global, Inject, OnApplicationShutdown } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: SUPABASE_CLIENT,
      useFactory: (): SupabaseClient => {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

        if (!url || !key) {
          throw new Error(
            '[SupabaseModule] SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY environment variables must be defined.',
          );
        }

        return createClient(url, key, {
          auth: {
            persistSession: false,
          },
        });
      },
    },
  ],
  exports: [SUPABASE_CLIENT],
})
export class SupabaseModule implements OnApplicationShutdown {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    console.log('[SupabaseModule] Cleaning up active Supabase realtime connections...');
    try {
      await this.supabase.removeAllChannels();
      console.log('[SupabaseModule] Supabase client resources successfully cleaned up.');
    } catch (err: unknown) {
      console.error('[SupabaseModule] Failed to clean up channels:', err);
    }
  }
}
