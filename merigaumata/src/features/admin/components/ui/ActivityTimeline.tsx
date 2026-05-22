import React from 'react';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  icon?: React.ReactNode;
}

export function ActivityTimeline({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) {
    return <div className="text-sm text-muted">No recent activity.</div>;
  }

  return (
    <div className="relative border-l border-surface-border ml-3 space-y-6 pb-4">
      {events.map((event, index) => (
        <div key={event.id} className="relative pl-6">
          <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary-500 border-2 border-surface" />
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-1">
            <h4 className="text-sm font-semibold text-foreground">{event.title}</h4>
            <time className="text-xs text-muted">{new Date(event.date).toLocaleString()}</time>
          </div>
          <p className="text-sm text-muted">{event.description}</p>
        </div>
      ))}
    </div>
  );
}
