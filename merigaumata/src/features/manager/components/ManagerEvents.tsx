'use client';

import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { SanctuaryEvent } from '../types/manager.types';

interface ManagerEventsProps {
  eventsList: SanctuaryEvent[];
  addEvent: (event: { name: string; date: string; location: string }) => void;
  translateIfKey: (text: string) => string;
}

export function ManagerEvents({
  eventsList,
  addEvent,
  translateIfKey
}: ManagerEventsProps) {
  const [newEvent, setNewEvent] = useState({ name: '', date: '', location: '' });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.name || !newEvent.date || !newEvent.location) return;
    
    addEvent({
      name: newEvent.name,
      date: newEvent.date,
      location: newEvent.location
    });
    setNewEvent({ name: '', date: '', location: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Sanctuary Sacred Events</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Add and schedule upcoming dynamic Vedic festivals or pujas.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pt-2">
        <form onSubmit={handleAddEvent} className="xl:col-span-5 space-y-4 p-5 rounded-xl border border-border bg-neutral-50/50 dark:bg-neutral-900/40 h-max">
          <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-primary-500" /> Add New Event
          </h3>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Event Title</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Maha Kamadhenu Puja" 
              value={newEvent.name}
              onChange={e => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 border rounded-xl dark:bg-neutral-900 dark:border-neutral-800 text-foreground text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-700 font-medium" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Scheduled Date</label>
            <input 
              type="date" 
              required 
              value={newEvent.date}
              onChange={e => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-2.5 border rounded-xl dark:bg-neutral-900 dark:border-neutral-800 text-foreground text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-700 font-medium" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Location inside Sanctuary</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Gopala Gaushala Pavilion" 
              value={newEvent.location}
              onChange={e => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-2.5 border rounded-xl dark:bg-neutral-900 dark:border-neutral-800 text-foreground text-xs focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-700 font-medium" 
            />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all mt-2 focus:outline-none">
            Publish Event
          </button>
        </form>

        {/* Event list */}
        <div className="xl:col-span-7 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Live Scheduled Events ({eventsList.length})</h3>
          <div className="space-y-3">
            {eventsList.map(ev => (
              <div key={ev.id} className="p-4 border border-border bg-card rounded-xl flex justify-between items-center hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{translateIfKey(ev.name)}</h4>
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-semibold block mt-0.5">{translateIfKey(ev.location)} • {new Date(ev.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-green-500/10 text-green-600 border border-green-500/20">
                  {ev.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
