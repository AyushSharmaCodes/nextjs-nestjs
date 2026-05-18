import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className="relative inline-block" ref={triggerRef}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const context = useContext(DropdownContext);
  if (!context) throw new Error('DropdownMenuTrigger must be used inside DropdownMenu');

  const { isOpen, setIsOpen } = context;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        handleClick(e);
        (children.props as any).onClick?.(e);
      }
    });
  }

  return (
    <div onClick={handleClick} className="inline-block">
      {children}
    </div>
  );
}

export function DropdownMenuContent({
  children,
  align = 'end',
  className,
}: {
  children: React.ReactNode;
  align?: 'start' | 'end';
  className?: string;
}) {
  const context = useContext(DropdownContext);
  if (!context) throw new Error('DropdownMenuContent must be used inside DropdownMenu');

  const { isOpen, setIsOpen, triggerRef } = context;
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto-close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current && 
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, triggerRef, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={clsx(
        'absolute mt-1.5 z-40 min-w-[8rem] overflow-hidden rounded-xl border border-stone-200 bg-white p-1 text-stone-900 shadow-lg animate-in fade-in-80 slide-in-from-top-1 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100',
        align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  disabled = false,
  className,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
  className?: string;
}) {
  const context = useContext(DropdownContext);
  if (!context) throw new Error('DropdownMenuItem must be used inside DropdownMenu');

  const { setIsOpen } = context;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.stopPropagation();
    onClick?.(e);
    setIsOpen(false);
  };

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-xs outline-none transition-colors hover:bg-stone-50 dark:hover:bg-stone-800 focus:bg-stone-50 dark:focus:bg-stone-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 font-sans',
        disabled && 'pointer-events-none opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={clsx('-mx-1 my-1 h-px bg-stone-100 dark:bg-stone-850', className)} />;
}
