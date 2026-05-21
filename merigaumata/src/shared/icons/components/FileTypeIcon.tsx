'use client';

import React from 'react';
import { AppIcon } from './AppIcon';
import { AppIconProps } from '../types';

export interface FileTypeIconProps extends Omit<AppIconProps, 'name'> {
  /**
   * The file extension (e.g., 'pdf', 'png', 'zip') to choose the matching icon.
   */
  extension?: string;
}

export const FileTypeIcon = React.forwardRef<SVGSVGElement, FileTypeIconProps>(
  ({ extension = '', ...props }, ref) => {
    let iconName: 'file' | 'gallery' | 'folder' = 'file';
    const ext = extension.toLowerCase().trim();

    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
      iconName = 'gallery';
    } else if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) {
      iconName = 'folder';
    }

    return <AppIcon ref={ref} name={iconName} {...props} />;
  }
);

FileTypeIcon.displayName = 'FileTypeIcon';
export default FileTypeIcon;
