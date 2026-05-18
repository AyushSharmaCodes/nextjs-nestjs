"use client";

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

// Container
export interface SidebarContainerProps extends HTMLMotionProps<"aside"> {
  isCollapsed?: boolean;
}
export const SidebarContainer = React.forwardRef<HTMLDivElement, SidebarContainerProps>(
  ({ className, isCollapsed, children, ...props }, ref) => {
    return (
      <motion.aside
        ref={ref}
        className={cn(
          "h-[calc(100vh-16px)] my-2 sticky top-2 flex flex-col bg-card border-t border-b border-r border-earth-200/60 dark:border-transparent rounded-tr-2xl rounded-br-2xl shadow-sm flex-shrink-0 z-40 selection:bg-primary-500/20 overflow-hidden select-none",
          className
        )}
        {...props}
      >
        {children}
      </motion.aside>
    );
  }
);
SidebarContainer.displayName = "SidebarContainer";

// Header
export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "h-16 flex items-center px-4 border-b border-earth-100/50 dark:border-transparent justify-between flex-shrink-0 bg-card",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SidebarHeader.displayName = "SidebarHeader";

// Body
export interface SidebarBodyProps extends React.HTMLAttributes<HTMLDivElement> {}
export const SidebarBody = React.forwardRef<HTMLDivElement, SidebarBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex-1 overflow-y-auto px-3 py-4 custom-scrollbar space-y-6 select-none bg-card",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SidebarBody.displayName = "SidebarBody";

// Footer
export interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export const SidebarFooter = React.forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "p-3 border-t border-earth-100/50 dark:border-transparent flex-shrink-0 bg-card select-none",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SidebarFooter.displayName = "SidebarFooter";

// Section
export interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {}
export const SidebarSection = React.forwardRef<HTMLDivElement, SidebarSectionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-1 select-none", className)} {...props}>
        {children}
      </div>
    );
  }
);
SidebarSection.displayName = "SidebarSection";

// Section Label
export interface SidebarSectionLabelProps extends HTMLMotionProps<"div"> {
  isCollapsed?: boolean;
}
export const SidebarSectionLabel = React.forwardRef<HTMLDivElement, SidebarSectionLabelProps>(
  ({ className, isCollapsed, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "text-[10px] font-semibold text-foreground/45 uppercase tracking-wider mb-2 ml-3 h-4 select-none",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
SidebarSectionLabel.displayName = "SidebarSectionLabel";

// Nav Wrapper
export interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {}
export const SidebarNav = React.forwardRef<HTMLDivElement, SidebarNavProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <nav ref={ref} className={cn("space-y-1 select-none", className)} {...props}>
        {children}
      </nav>
    );
  }
);
SidebarNav.displayName = "SidebarNav";

// Nav Item variants
export const navItemVariants = cva(
  "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 select-none group cursor-pointer text-left",
  {
    variants: {
      active: {
        true: "bg-primary-50/70 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 font-semibold shadow-[sm_inset_0_1px_1px_rgba(0,0,0,0.02)]",
        false: "text-foreground/70 hover:bg-earth-100/50 hover:text-primary-600 dark:hover:bg-earth-900/30 dark:hover:text-primary-400"
      },
      collapsed: {
        true: "justify-center px-0 py-2 h-10 w-10 mx-auto",
        false: ""
      }
    },
    defaultVariants: {
      active: false,
      collapsed: false
    }
  }
);

// Sidebar Nav Item Interface
export interface SidebarNavItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof navItemVariants> {
  icon?: React.ComponentType<{ className?: string }>;
  isExpanded?: boolean;
  hasChildren?: boolean;
}

export const SidebarNavItem = React.forwardRef<HTMLButtonElement, SidebarNavItemProps>(
  ({ className, active, collapsed, icon: Icon, isExpanded, hasChildren, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(navItemVariants({ active, collapsed }), className)}
        {...props}
      >
        <div className={cn("flex items-center w-full", collapsed && "justify-center")}>
          {Icon && (
            <Icon
              className={cn(
                "h-[18px] w-[18px] flex-shrink-0 transition-colors duration-150",
                active 
                  ? "text-primary-500 dark:text-primary-400" 
                  : "text-foreground/45 group-hover:text-primary-500 dark:group-hover:text-primary-400",
                !collapsed && "mr-3"
              )}
            />
          )}
          {!collapsed && <span className="flex-1 truncate">{children}</span>}
        </div>
        {hasChildren && !collapsed && (
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200 text-foreground/40",
              isExpanded && "rotate-180"
            )}
          />
        )}
      </button>
    );
  }
);
SidebarNavItem.displayName = "SidebarNavItem";

// Sidebar Submenu Children Link Interface
export const SidebarNavChild = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn("overflow-hidden ml-[21px] mt-1 space-y-1 select-none", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
});
SidebarNavChild.displayName = "SidebarNavChild";

// Divider
export const SidebarDivider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("h-px bg-earth-100/50 dark:bg-earth-800/40 my-4 select-none", className)}
      {...props}
    />
  );
});
SidebarDivider.displayName = "SidebarDivider";

// Floating collapse Button
export const SidebarCollapseButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "hidden md:flex absolute top-5 -right-3 h-6 w-6 rounded-full border border-earth-200 bg-card hover:bg-earth-50 text-foreground/60 hover:text-foreground items-center justify-center shadow-sm z-50 cursor-pointer select-none transition-colors dark:border-earth-800 dark:hover:bg-earth-900 outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50",
        className
      )}
      {...props}
    />
  );
});
SidebarCollapseButton.displayName = "SidebarCollapseButton";
