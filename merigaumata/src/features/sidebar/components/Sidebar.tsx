"use client";

import React, { useEffect, useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Building2 
} from 'lucide-react';
import Image from 'next/image';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { useSidebarStore } from '../stores/useSidebarStore';
import { SIDEBAR_SECTIONS } from '../config/routes';
import { SidebarRoute } from '../types';
import { 
  sidebarVariants, 
  textVariants, 
  brandTextVariants,
  submenuVariants 
} from '../animations/sidebar.animations';
import {
  SidebarContainer,
  SidebarHeader,
  SidebarBody,
  SidebarFooter,
  SidebarSection,
  SidebarSectionLabel,
  SidebarNav,
  SidebarNavItem,
  SidebarNavChild,
  SidebarDivider
} from './SidebarPrimitives';
import { SidebarTooltip } from './SidebarTooltip';
import { SidebarProfile } from './SidebarProfile';
import { SidebarMobileDrawer } from './SidebarMobileDrawer';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const t = useTranslations('admin.AdminSidebar');
  const pathname = usePathname();
  
  // Local state to prevent Next.js hydration mismatches on localStorage persistent state
  const [mounted, setMounted] = useState(false);
  
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const expandedGroups = useSidebarStore((state) => state.expandedGroups);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);
  const toggleGroup = useSidebarStore((state) => state.toggleGroup);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href?: string) => {
    if (!href) return false;
    if (pathname === href) return true;
    if (href === '/admin') return false; // Keep dashboard strict to exact match
    return pathname.startsWith(href);
  };

  const isParentActive = (route: SidebarRoute) => {
    if (!route.children) return false;
    return route.children.some(child => isActive(child.href));
  };

  // Expand parent accordions on load/route change if children are active
  useEffect(() => {
    if (!mounted) return;
    SIDEBAR_SECTIONS.forEach(section => {
      section.items.forEach(item => {
        if (item.children) {
          const hasActiveChild = item.children.some(child => isActive(child.href));
          if (hasActiveChild && !expandedGroups.includes(item.id)) {
            toggleGroup(item.id);
          }
        }
      });
    });
  }, [pathname, mounted]);

  const handleGroupClick = (itemId: string) => {
    if (isCollapsed) {
      // Expand sidebar first if collapsed, then toggle group open
      setCollapsed(false);
      if (!expandedGroups.includes(itemId)) {
        toggleGroup(itemId);
      }
    } else {
      toggleGroup(itemId);
    }
  };

  const renderItem = (item: SidebarRoute, isSub = false) => {
    const hasChildren = !!item.children;
    const isExpanded = expandedGroups.includes(item.id);
    const active = hasChildren ? isParentActive(item) : isActive(item.href);
    const label = t.has(item.labelKey) ? t(item.labelKey) : item.labelKey;

    const navItemElement = (
      <SidebarNavItem
        icon={item.icon}
        active={active}
        collapsed={isCollapsed}
        isExpanded={isExpanded}
        hasChildren={hasChildren}
        onClick={hasChildren ? () => handleGroupClick(item.id) : undefined}
      >
        {label}
      </SidebarNavItem>
    );

    // If it's a child menu node or a parent route accordion header
    if (hasChildren) {
      return (
        <div key={item.id} className="w-full">
          {/* Tooltip trigger in collapsed state, otherwise normal element */}
          {isCollapsed ? (
            <SidebarTooltip content={label}>
              {navItemElement}
            </SidebarTooltip>
          ) : (
            navItemElement
          )}

          <AnimatePresence initial={false}>
            {isExpanded && !isCollapsed && (
              <SidebarNavChild
                initial="collapsedSubmenu"
                animate="expandedSubmenu"
                exit="collapsedSubmenu"
                variants={submenuVariants}
              >
                <div className="border-l border-earth-200/60 dark:border-earth-800/40 pl-3 space-y-0.5 mt-0.5">
                  {item.children!.map((child) => {
                    const childActive = isActive(child.href);
                    const childLabel = t.has(child.labelKey) ? t(child.labelKey) : child.labelKey;
                    const ChildIcon = child.icon;
                    return (
                      <Link
                        key={child.id}
                        href={child.href!}
                        onClick={onClose}
                        className={`flex items-center gap-2 py-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-150 outline-none select-none text-left cursor-pointer border border-transparent ${
                          childActive
                            ? "bg-earth-100 font-semibold text-primary-600 dark:bg-earth-900/30 dark:text-primary-400 border-earth-200/10"
                            : "text-foreground/60 hover:text-foreground/90 hover:bg-earth-50/50 dark:hover:bg-earth-900/10"
                        }`}
                      >
                        {ChildIcon && (
                          <ChildIcon 
                            className={`h-[15px] w-[15px] flex-shrink-0 transition-colors ${
                              childActive 
                                ? "text-primary-500 dark:text-primary-400" 
                                : "text-foreground/45 group-hover:text-primary-500 dark:group-hover:text-primary-400"
                            }`} 
                          />
                        )}
                        <span className="truncate">{childLabel}</span>
                      </Link>
                    );
                  })}
                </div>
              </SidebarNavChild>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Single route hyperlink
    const linkElement = (
      <Link href={item.href!} onClick={onClose} className="block w-full">
        {navItemElement}
      </Link>
    );

    return (
      <div key={item.id} className="w-full">
        {isCollapsed ? (
          <SidebarTooltip content={label}>
            {linkElement}
          </SidebarTooltip>
        ) : (
          linkElement
        )}
      </div>
    );
  };

  const SidebarInnerContent = (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      {/* Sidebar Header */}
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 relative rounded-full overflow-hidden border border-earth-200 dark:border-transparent bg-white dark:bg-earth-900/60 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
            <Image 
              src="https://picsum.photos/seed/merigaumata/100/100" 
              alt="MeriGauMata Logo" 
              fill 
              sizes="32px"
              referrerPolicy="no-referrer"
              className="object-cover" 
            />
          </div>
          {!isCollapsed && (
            <motion.div 
              initial="collapsed"
              animate="expanded"
              variants={brandTextVariants}
              className="flex flex-col justify-center select-none"
            >
              <span className="font-serif text-sm font-bold tracking-tight text-foreground leading-none mb-0.5">
                {t.has('brandName') ? t('brandName') : "MeriGauMata"}
              </span>
              <span className="font-sans text-[7px] font-bold text-[#DE7A41] tracking-[0.12em] uppercase leading-none">
                {t.has('brandByline') ? t('brandByline') : "Sacred Vedic Essence"}
              </span>
            </motion.div>
          )}
        </Link>
        {/* Mobile View Toggle */}
        <button 
          onClick={onClose} 
          className="md:hidden p-1.5 -mr-1 rounded-lg text-foreground/50 hover:bg-earth-100 hover:text-foreground border border-earth-200 dark:border-transparent shadow-sm transition-colors cursor-pointer"
          aria-label={t('closeSidebar')}
        >
          <X className="h-4 w-4" />
        </button>
      </SidebarHeader>

      {/* Navigation Groups */}
      <SidebarBody className="custom-scrollbar">
        {SIDEBAR_SECTIONS.map((section) => {
          const sectionLabel = t.has(section.labelKey) ? t(section.labelKey) : section.id;
          return (
            <SidebarSection key={section.id}>
              {!isCollapsed && (
                <SidebarSectionLabel
                  initial="collapsed"
                  animate="expanded"
                  variants={textVariants}
                >
                  {sectionLabel}
                </SidebarSectionLabel>
              )}
              {isCollapsed && (
                <div className="h-px bg-earth-100/50 dark:bg-earth-800/40 my-3 mx-2" aria-hidden="true" />
              )}
              <SidebarNav>
                {section.items.map((item) => renderItem(item))}
              </SidebarNav>
            </SidebarSection>
          );
        })}
      </SidebarBody>

      {/* Footer Profile Dropdown */}
      <SidebarFooter>
        <SidebarProfile />
      </SidebarFooter>
    </div>
  );

  if (!mounted) {
    return (
      <aside className="hidden md:flex h-screen sticky top-0 flex-col bg-card border-r border-earth-200/60 w-64 shadow-sm z-40" />
    );
  }

  return (
    <>
      {/* Desktop Persistent Sidebar Panel */}
      <SidebarContainer
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        className="hidden md:flex"
      >
        {SidebarInnerContent}
      </SidebarContainer>

      {/* Mobile Slide-out Drawer Panel */}
      <SidebarMobileDrawer isOpen={isOpen} onClose={onClose}>
        {SidebarInnerContent}
      </SidebarMobileDrawer>
    </>
  );
}
