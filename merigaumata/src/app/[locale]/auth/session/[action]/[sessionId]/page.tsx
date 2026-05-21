import SessionActionPage from '@/features/auth/components/SessionActionPage';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    locale: string;
    action: string;
    sessionId: string;
  }>;
}

export default async function AuthSessionActionPage({ params }: PageProps) {
  const { locale, action, sessionId } = await params;

  if (action !== 'confirm' && action !== 'revoke') {
    notFound();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.14),_transparent_38%),linear-gradient(180deg,_#fffdf8_0%,_#ffffff_42%,_#f5f5f4_100%)] px-4 py-16 dark:bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),_transparent_30%),linear-gradient(180deg,_#111111_0%,_#0a0a0a_100%)]">
      <SessionActionPage action={action} locale={locale} sessionId={sessionId} />
    </div>
  );
}
