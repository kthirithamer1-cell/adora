'use client';

import React, { useState } from 'react';
import StudioSidebar from './StudioSidebar';
import StudioNavbar from './StudioNavbar';
import BrandKitModal from './BrandKitModal';
import ProductCatalogModal from './ProductCatalogModal';
import CheckoutModal from './CheckoutModal';
import { CatalogProduct, BrandKit } from '@/lib/brandkit';
import s from './StudioShell.module.css';

export interface StudioShellProps {
  children: React.ReactNode;
  activeNav?: string;
  pageTitle?: string;
  pageBadge?: React.ReactNode;
  contentNoPadding?: boolean;
  onSelectCatalogProduct?: (product: CatalogProduct) => void;
  onBrandKitSaved?: (kit: BrandKit) => void;
}

export default function StudioShell({
  children,
  activeNav = 'studio',
  pageTitle = 'Studio Créatif IA',
  pageBadge,
  contentNoPadding = false,
  onSelectCatalogProduct,
  onBrandKitSaved,
}: StudioShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isBrandKitOpen, setIsBrandKitOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutInitialPlan, setCheckoutInitialPlan] = useState<'flash' | 'pro' | 'agency_299'>('pro');

  const handleOpenCheckout = (planId?: string) => {
    if (planId === 'agency_299' || planId === 'flash' || planId === 'pro') {
      setCheckoutInitialPlan(planId);
    } else {
      setCheckoutInitialPlan('pro');
    }
    setIsCheckoutOpen(true);
  };

  const handleOpenBrandKit = () => {
    setIsBrandKitOpen(true);
  };

  const handleOpenCatalog = () => {
    setIsCatalogOpen(true);
  };

  const handleSelectProduct = (product: CatalogProduct) => {
    setIsCatalogOpen(false);
    if (onSelectCatalogProduct) {
      onSelectCatalogProduct(product);
    }
  };

  return (
    <div className={s.studioContainer}>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`${s.studioBackdrop} ${mobileSidebarOpen ? s.backdropOpen : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* Shared Sidebar */}
      <StudioSidebar
        activeNav={activeNav}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenBrandKit={handleOpenBrandKit}
        onOpenCatalog={handleOpenCatalog}
        onOpenCheckout={handleOpenCheckout}
      />

      {/* Main Layout Area */}
      <main className={s.mainLayout}>
        {/* Shared Top Navbar */}
        <StudioNavbar
          pageTitle={pageTitle}
          pageBadge={pageBadge}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenBrandKit={handleOpenBrandKit}
          onOpenCheckout={handleOpenCheckout}
        />

        {/* Content Body */}
        <div className={contentNoPadding ? undefined : s.pageContent}>
          {children}
        </div>
      </main>

      {/* Brand Kit Modal */}
      <BrandKitModal
        isOpen={isBrandKitOpen}
        onClose={() => setIsBrandKitOpen(false)}
        onSaved={(kit) => {
          if (onBrandKitSaved) onBrandKitSaved(kit);
        }}
      />

      {/* Product Catalog Modal */}
      <ProductCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectProduct={handleSelectProduct}
      />

      {/* Checkout & Plans Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialPlanId={checkoutInitialPlan}
      />
    </div>
  );
}
