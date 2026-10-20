'use client';

import React from 'react';
import StudioShell from './StudioShell';

interface AppShellProps {
  children: React.ReactNode;
  activeNav?: string;
  pageTitle?: string;
  pageBadge?: React.ReactNode;
  contentNoPadding?: boolean;
}

export default function AppShell({
  children,
  activeNav = 'studio',
  pageTitle,
  pageBadge,
  contentNoPadding = false,
}: AppShellProps) {
  return (
    <StudioShell
      activeNav={activeNav}
      pageTitle={pageTitle}
      pageBadge={pageBadge}
      contentNoPadding={contentNoPadding}
    >
      {children}
    </StudioShell>
  );
}
