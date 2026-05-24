"use client";

import React, { useState } from 'react';
import { AppIcon } from '@/shared/icons';
import { Category, CategoryType } from '../types';
import clsx from 'clsx';

interface CategoryTreeViewProps {
  categories: Category[];
  categoryType: CategoryType;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onReorder: (reordered: { id: string; parentId: string | null; sortOrder: number }[]) => void;
  onAddSub: (parentId: string) => void;
}

export function CategoryTreeView({
  categories,
  categoryType,
  onEdit,
  onDelete,
  onToggleActive,
  onReorder,
  onAddSub
}: CategoryTreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Depth limits: Product (5), Event/Blog/FAQ (3)
  const MAX_DEPTH = {
    product: 5,
    event: 3,
    blog: 3,
    faq: 3
  }[categoryType];

  // Helper to construct hierarchy tree
  const buildTree = (
    items: Category[], 
    parentId: string | null = null, 
    currentDepth: number = 1
  ): { node: Category; children: any[]; depth: number }[] => { // ts-audit-ignore
    return items
      .filter(item => item.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(item => ({
        node: item,
        children: buildTree(items, item.id, currentDepth + 1),
        depth: currentDepth
      }));
  };

  const treeData = buildTree(categories);

  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Reorder commands: Move node up/down within its siblings
  const handleMoveSibling = (node: Category, direction: 'up' | 'down') => {
    const siblings = categories
      .filter(c => c.parentId === node.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
      
    const currentIndex = siblings.findIndex(s => s.id === node.id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= siblings.length) return;

    // Swap sort orders
    const targetSibling = siblings[newIndex];
    const originalSort = node.sortOrder;
    const targetSort = targetSibling.sortOrder;

    const reorderedItems = [
      { id: node.id, parentId: node.parentId, sortOrder: targetSort },
      { id: targetSibling.id, parentId: targetSibling.parentId, sortOrder: originalSort }
    ];

    onReorder(reorderedItems);
  };

  // Nest / De-nest helpers for nesting control
  const handleIndent = (node: Category, action: 'nest' | 'unnest', depth: number) => {
    if (action === 'nest') {
      // Find previous sibling to act as new parent
      const siblings = categories
        .filter(c => c.parentId === node.parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const currentIndex = siblings.findIndex(s => s.id === node.id);
      
      if (currentIndex > 0 && depth < MAX_DEPTH) {
        const newParent = siblings[currentIndex - 1];
        // Move under new parent
        onReorder([
          { id: node.id, parentId: newParent.id, sortOrder: 999 } // Place at end of list
        ]);
        // Expand the new parent automatically
        setExpandedNodes(prev => ({ ...prev, [newParent.id]: true }));
      }
    } else {
      // Move under grandparent (or root if parent is root)
      if (node.parentId) {
        const parentNode = categories.find(c => c.id === node.parentId);
        const grandparentId = parentNode ? parentNode.parentId : null;
        
        onReorder([
          { id: node.id, parentId: grandparentId, sortOrder: (parentNode?.sortOrder || 1) + 1 }
        ]);
      }
    }
  };

  // Recursive Renderer Function
  const renderTreeNode = (
    item: { node: Category; children: any[]; depth: number },  // ts-audit-ignore
    index: number, 
    totalSiblings: number
  ) => {
    const { node, children, depth } = item;
    const isExpanded = expandedNodes[node.id];
    const hasChildren = children.length > 0;
    
    // Check if node is fully translated across locales (en, hi)
    const isFullyTranslated = node.translations.en?.name && node.translations.hi?.name;
    const localesCount = Object.keys(node.translations).length;

    return (
      <div key={node.id} className="select-none animate-fade-in">
        
        {/* Row Element Container */}
        <div 
          className={clsx(
            "flex items-center justify-between py-2 px-3 hover:bg-earth-50 rounded-2xl group border border-transparent transition-all",
            draggingId === node.id && "bg-primary-50/50 border-primary-300 border-dashed opacity-70"
          )}
          style={{ paddingLeft: `${(depth - 1) * 32 + 12}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            
            {/* Visual Depth connecting dotted guide */}
            {depth > 1 && (
              <div 
                className="flex items-center text-foreground/20"
                style={{ marginLeft: '-18px', marginRight: '6px' }}
              >
                <AppIcon name="cornerDownRight" className="h-4 w-4" />
              </div>
            )}

            {/* Tree Drag handle simulator */}
            <div className="p-1 cursor-grab text-foreground/30 hover:text-foreground/60 transition-colors">
              <AppIcon name="gripVertical" className="h-4 w-4" />
            </div>

            {/* Expand / Collapse clicker */}
            <button
              type="button"
              onClick={() => toggleExpand(node.id)}
              className={clsx(
                "p-1 rounded-lg hover:bg-earth-200 transition-colors",
                !hasChildren && "opacity-0 cursor-default"
              )}
              disabled={!hasChildren}
            >
              {isExpanded ? (
                <AppIcon name="chevronDown" className="h-4 w-4 text-foreground/60" />
              ) : (
                <AppIcon name="chevronRight" className="h-4 w-4 text-foreground/60" />
              )}
            </button>

            {/* Category Image thumbnail preview */}
            {node.image ? (
              <img 
                src={node.image} 
                alt="Thumbnail" 
                className="h-7 w-7 rounded-lg object-cover shadow-inner border border-earth-100 flex-shrink-0"
              />
            ) : (
              <div className="h-7 w-7 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                {node.translations.en?.name?.charAt(0).toUpperCase() || 'C'}
              </div>
            )}

            {/* Details and Labels */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground truncate">
                  {node.translations.en?.name || 'Untitled Category'}
                </span>
                
                {/* Locale badges */}
                <div className="flex gap-0.5 scale-90">
                  {Object.keys(node.translations).map(locale => (
                    <span 
                      key={locale} 
                      className="px-1 text-[9px] font-bold font-mono bg-earth-200 text-foreground/60 rounded-md uppercase"
                      title={`${locale.toUpperCase()} translation present`}
                    >
                      {locale}
                    </span>
                  ))}
                </div>

                {('featured' in node && node.featured) && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 rounded-full uppercase">
                    Featured
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] text-foreground/40 font-mono select-all">/{node.slug}</span>
                {node.itemCount !== undefined && (
                  <span className="text-[10px] text-foreground/50 flex items-center gap-1 font-medium">
                    • <span className="bg-earth-100 px-1 py-0.5 rounded text-[9px] font-bold">{node.itemCount} items</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            
            {/* Reorder and nesting controls */}
            <button
              type="button"
              onClick={() => handleMoveSibling(node, 'up')}
              className={clsx(
                "p-1.5 text-foreground/45 hover:text-primary-500 rounded-xl hover:bg-earth-100 transition-colors flex items-center justify-center",
                index === 0 && "opacity-20 pointer-events-none"
              )}
              title="Move Up"
            >
              <AppIcon name="arrowUp" className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleMoveSibling(node, 'down')}
              className={clsx(
                "p-1.5 text-foreground/45 hover:text-primary-500 rounded-xl hover:bg-earth-100 transition-colors flex items-center justify-center",
                index === totalSiblings - 1 && "opacity-20 pointer-events-none"
              )}
              title="Move Down"
            >
              <AppIcon name="arrowDown" className="h-3.5 w-3.5" />
            </button>
            
            {/* Indent (Nest) buttons */}
            <button
              type="button"
              onClick={() => handleIndent(node, 'nest', depth)}
              className={clsx(
                "p-1.5 text-foreground/45 hover:text-primary-500 rounded-xl hover:bg-earth-100 transition-colors flex items-center justify-center",
                (index === 0 || depth >= MAX_DEPTH) && "opacity-20 pointer-events-none"
              )}
              title={`Nest under previous sibling (Max depth: ${MAX_DEPTH})`}
            >
              <AppIcon name="cornerDownRight" className="h-3.5 w-3.5" />
            </button>

            {node.parentId && (
              <button
                type="button"
                onClick={() => handleIndent(node, 'unnest', depth)}
                className="p-1.5 text-foreground/45 hover:text-primary-500 rounded-xl hover:bg-earth-100 transition-colors flex items-center justify-center"
                title="Unnest (Move Out One Level)"
              >
                <AppIcon name="cornerDownRight" className="h-3.5 w-3.5 rotate-180" />
              </button>
            )}

            <div className="h-4 w-px bg-earth-200 mx-1"></div>

            {/* Quick child add */}
            {depth < MAX_DEPTH && (
              <button
                type="button"
                onClick={() => onAddSub(node.id)}
                className="p-1.5 text-foreground/45 hover:text-secondary-600 rounded-xl hover:bg-earth-100 transition-colors flex items-center justify-center"
                title="Add Nest-Level Child"
              >
                <AppIcon name="folderPlus" className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Status toggle */}
            <button
              type="button"
              onClick={() => onToggleActive(node.id, !node.isActive)}
              className={clsx(
                "p-1.5 rounded-xl hover:bg-earth-100 transition-colors flex items-center justify-center",
                node.isActive ? "text-secondary-600 hover:text-secondary-700" : "text-foreground/30 hover:text-foreground/50"
              )}
              title={node.isActive ? "Disable Category" : "Enable Category"}
            >
              {node.isActive ? <AppIcon name="eye" className="h-3.5 w-3.5" /> : <AppIcon name="eyeOff" className="h-3.5 w-3.5" />}
            </button>

            {/* Edit and Delete */}
            <button
              type="button"
              onClick={() => onEdit(node.id)}
              className="p-1.5 text-foreground/45 hover:text-primary-500 rounded-xl hover:bg-earth-100 transition-colors flex items-center justify-center"
              title="Edit Fields"
            >
              <AppIcon name="edit" className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(node.id)}
              className="p-1.5 text-foreground/45 hover:text-red-500 rounded-xl hover:bg-earth-100 transition-colors flex items-center justify-center"
              title="Delete Category"
            >
              <AppIcon name="trash" className="h-3.5 w-3.5" />
            </button>

          </div>
        </div>

        {/* Render child elements recursively */}
        {hasChildren && isExpanded && (
          <div className="relative border-l border-dashed border-earth-200/60 ml-9 mt-0.5 space-y-0.5">
            {children.map((childItem, childIndex) => 
              renderTreeNode(childItem, childIndex, children.length)
            )}
          </div>
        )}

      </div>
    );
  };

  return (
    <div className="bg-card border border-earth-200 rounded-3xl p-6 shadow-sm">
      
      {/* Help header banner */}
      <div className="flex items-start gap-3 p-4 bg-earth-50 rounded-2xl border border-earth-200 mb-6">
        <AppIcon name="info" className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-foreground/60 leading-relaxed">
          <p className="font-semibold text-foreground mb-0.5">Hierarchy Controls</p>
          Drag handles denote visual ordering. Hover over any row to reveal context controls: 
          <strong> Move Up/Down</strong>, <strong>Nest</strong> under the previous node, or create child nodes. 
          The maximum depth limit is strictly set to <strong>{MAX_DEPTH}</strong> levels for 
          <span className="capitalize"> {categoryType} Categories</span>.
        </div>
      </div>

      {/* Main Categories Tree list */}
      {treeData.length > 0 ? (
        <div className="space-y-1">
          {treeData.map((item, index) => renderTreeNode(item, index, treeData.length))}
        </div>
      ) : (
        <div className="text-center py-12 bg-earth-50 rounded-2xl border-2 border-dashed border-earth-200">
          <AppIcon name="folderPlus" className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-foreground">No Categories Configured</h4>
          <p className="text-xs text-foreground/40 mt-1 max-w-sm mx-auto">
            Get started by adding your primary root-level {categoryType} category.
          </p>
        </div>
      )}

    </div>
  );
}
