'use client';

import React, { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
import * as Sentry from '@sentry/nextjs';
import { useTranslations } from 'next-intl';
import { initLogTape, logger } from '@/shared/lib/logger';
import { logError } from '@/shared/lib/errors';

/**
 * Custom React Error Boundary Component.
 * Catches unhandled client rendering crashes, logs them via LogTape, and reports them to Sentry.
 */
class ClientErrorBoundary extends React.Component<
  { 
    children: React.ReactNode;
    somethingWentWrong: string;
    renderingCrashDesc: string;
    reloadInterface: string;
  },
  { hasError: boolean }
> {
  constructor(props: { 
    children: React.ReactNode;
    somethingWentWrong: string;
    renderingCrashDesc: string;
    reloadInterface: string;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, {
      component: 'ClientErrorBoundary',
      errorInfo: errorInfo.componentStack,
    });
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-background text-foreground border border-red-500/20 rounded-2xl m-4">
          <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 text-3xl">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">{this.props.somethingWentWrong}</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            {this.props.renderingCrashDesc}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:opacity-90 transition-all duration-200"
          >
            {this.props.reloadInterface}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Production-Grade Client Observability Provider.
 * Wraps root components to manage client-side monitoring.
 */
export default function ObservabilityProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations('errors');

  // 1. Initialize LogTape on client mount
  useEffect(() => {
    initLogTape();
    logger.info('📱 Client logging and telemetry layer initialized.');
  }, []);

  // 2. Automatically capture and report Core Web Vitals to Sentry
  useReportWebVitals((metric) => {
    const { id, name, label, value } = metric;
    
    // Log Web Vital structured log
    logger.debug(`📊 Web Vital Metric: ${name} = ${value}`, {
      metricId: id,
      metricName: name,
      metricLabel: label,
      metricValue: value,
    });

    // Report vitals to Sentry as custom spans if Sentry is active
    try {
      const activeSpan = Sentry.getActiveSpan();
      if (activeSpan) {
        Sentry.startSpan(
          {
            name: `web-vital-${name.toLowerCase()}`,
            op: 'ui.web-vital',
            attributes: {
              metric_id: id,
              metric_value: value,
              metric_label: label,
            },
          },
          () => {} // Auto-ends immediately
        );
      }
    } catch {
      // Fail silently if Sentry span recording is unavailable
    }
  });

  return (
    <ClientErrorBoundary
      somethingWentWrong={t('somethingWentWrong')}
      renderingCrashDesc={t('renderingCrashDesc')}
      reloadInterface={t('reloadInterface')}
    >
      {children}
    </ClientErrorBoundary>
  );
}
