'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import s from './beauty.module.css';
import { Sparkles, ArrowRight, Check, Layers, Info } from 'lucide-react';

type CategoryType = 'Skincare' | 'Cosmetics' | 'Perfume';
type StyleType = 'Premium & minimal' | 'Natural & organic' | 'Bold & modern';
type GoalType = 'educate' | 'care' | 'promote';

interface ContentPreset {
  headline: string;
  badge: string;
  image: string;
  subCards: {
    title: string;
    image: string;
  }[];
}

const PRESETS: Record<CategoryType, Record<StyleType, Record<GoalType, ContentPreset>>> = {
  Skincare: {
    'Premium & minimal': {
      educate: {
        headline: 'Simple steps for healthy, radiant skin',
        badge: 'Clean Science',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Your skin matters', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80' },
          { title: 'Natural care. Real results.', image: 'https://images.unsplash.com/photo-1608248597359-54859a688b56?auto=format&fit=crop&w=600&q=80' },
          { title: 'Skincare is a form of self care.', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      care: {
        headline: 'Gentle on your skin. Kind to the planet.',
        badge: 'Conscious Luxury',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Cruelty-free formulas', image: 'https://images.unsplash.com/photo-1608248597359-54859a688b56?auto=format&fit=crop&w=600&q=80' },
          { title: 'Responsibly sourced botanicals', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80' },
          { title: 'Sustainable glass packaging', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      promote: {
        headline: 'The Barrier Recovery Elixir: Wake up with renewed glow',
        badge: 'Hero Launch',
        image: 'https://images.unsplash.com/photo-1608248597359-54859a688b56?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Immediate 72h moisture', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80' },
          { title: 'Dermatologist tested', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80' },
          { title: 'Exclusive first batch order', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80' },
        ],
      },
    },
    'Natural & organic': {
      educate: {
        headline: 'The power of raw botanicals & cold-pressed oils',
        badge: '100% Organic',
        image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Why cold-pressed matters', image: 'https://images.unsplash.com/photo-1608248597359-54859a688b56?auto=format&fit=crop&w=600&q=80' },
          { title: 'Plant-derived squalane', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80' },
          { title: 'Rooted in botanical wisdom', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      care: {
        headline: 'Zero synthetics. Pure earth-grown nourishment.',
        badge: 'Holistic Skin',
        image: 'https://images.unsplash.com/photo-1608248597359-54859a688b56?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Small batch production', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80' },
          { title: 'Earth-honoring ethics', image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80' },
          { title: 'Compostable refills', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      promote: {
        headline: 'Dew Drops Serum: Nature’s most potent antidote to dullness',
        badge: 'Best Seller',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Fresh harvest edition', image: 'https://images.unsplash.com/photo-1608248597359-54859a688b56?auto=format&fit=crop&w=600&q=80' },
          { title: '14-day visible glow', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80' },
          { title: 'Limited seasonal bottles', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80' },
        ],
      },
    },
    'Bold & modern': {
      educate: {
        headline: 'Active ingredients explained: Peptides, Zinc & Hyaluronic',
        badge: 'Active Efficacy',
        image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Layering active serums', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80' },
          { title: 'pH balanced perfection', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80' },
          { title: 'Proven clinical results', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      care: {
        headline: 'Transparent formulations. Zero secrets on our labels.',
        badge: 'Clean Truth',
        image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Zero parabens or sulfates', image: 'https://images.unsplash.com/photo-1608248597359-54859a688b56?auto=format&fit=crop&w=600&q=80' },
          { title: 'Sensitive skin approved', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80' },
          { title: 'Formulated in France', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      promote: {
        headline: 'The Hyper-Hydration Barrier Creme is officially here',
        badge: 'Trending Now',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Cloud-light texture', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80' },
          { title: 'Fast-absorbing finish', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80' },
          { title: 'Free shipping on orders', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80' },
        ],
      },
    },
  },
  Cosmetics: {
    'Premium & minimal': {
      educate: {
        headline: 'How to master the weightless no-makeup glow',
        badge: 'Editorial Beauty',
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Skin-first finish', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' },
          { title: 'Invisible blending', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80' },
          { title: 'Natural radiance', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      care: {
        headline: 'Cosmetics that nourish your skin while you wear them',
        badge: 'Hybrid Care',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Infused with jojoba', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80' },
          { title: 'Zero pore-clogging waxes', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80' },
          { title: 'Clean mineral pigments', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      promote: {
        headline: 'The Velvet Lip Tint: Weightless stain that lasts 12 hours',
        badge: 'Iconic Shades',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: '6 universally flattering tones', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' },
          { title: 'Transfer-resistant formula', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80' },
          { title: 'Limited gold packaging', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80' },
        ],
      },
    },
    'Natural & organic': {
      educate: {
        headline: 'Plant pigments that blend seamlessly with natural skin',
        badge: 'Botanical Color',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Berry extract stains', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80' },
          { title: 'Non-comedogenic glow', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' },
          { title: 'Safe for ultra-sensitive skin', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      care: {
        headline: 'Beauty in harmony with nature: Refillable & recyclable',
        badge: 'Circular Design',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Aluminium pods', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80' },
          { title: '100% vegan certified', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80' },
          { title: 'No microplastics', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      promote: {
        headline: 'The Golden Hour Cheek & Lip Balm is back in stock',
        badge: 'Cult Favorite',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Buildable sheer pigment', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' },
          { title: 'Pocket-sized applicator', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80' },
          { title: 'Order today with 10% off', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80' },
        ],
      },
    },
    'Bold & modern': {
      educate: {
        headline: 'Precision pigments: High-impact color for fearless looks',
        badge: 'High Performance',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'High-density color payoff', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80' },
          { title: '24-hour crease-free wear', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' },
          { title: 'Studio-grade definition', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      care: {
        headline: 'Clean performance makeup without compromise',
        badge: 'Bold & Clean',
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Cruelty-free certified', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80' },
          { title: 'Ophthalmologist tested', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' },
          { title: 'Sweat & humidity proof', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      promote: {
        headline: 'Unleash your shade: The Matte Suede Collection drops now',
        badge: 'New Release',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: '12 saturated shades', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80' },
          { title: 'Featherlight feel', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80' },
          { title: 'Complimentary mini brush', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' },
        ],
      },
    },
  },
  Perfume: {
    'Premium & minimal': {
      educate: {
        headline: 'The anatomy of a fragrance: Top, heart and base accords',
        badge: 'Haute Parfumerie',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Top: Italian bergamot', image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80' },
          { title: 'Heart: Damask rose', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80' },
          { title: 'Base: Warm amber woods', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      care: {
        headline: 'Artisanal extraction with respect for rare flora',
        badge: 'Handcrafted',
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Ethical Grasse harvests', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80' },
          { title: '100% organic grain alcohol', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80' },
          { title: 'Aged in French glass', image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      promote: {
        headline: 'L’Heure Dorée: An intoxicating amber trail you can’t forget',
        badge: 'Signature Scent',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Over 14h sillage longevity', image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80' },
          { title: 'Numbered glass flacons', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80' },
          { title: 'Complimentary 2ml discovery', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80' },
        ],
      },
    },
    'Natural & organic': {
      educate: {
        headline: 'Pure botanical essences: Distilled directly from wild petals',
        badge: 'Pure Extract',
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Cold-pressed neroli', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80' },
          { title: 'Wild cedar infusion', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80' },
          { title: 'Zero synthetic fixatives', image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      care: {
        headline: 'Natural wellness perfumes that calm the nervous system',
        badge: 'Aromatherapy',
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Therapeutic grade oils', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80' },
          { title: 'Hand-blended in small vats', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80' },
          { title: 'Zero allergen dyes', image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      promote: {
        headline: 'Forest Rain: Crisp pine needles, vetiver and ozone',
        badge: 'New Olfactory',
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Unisex grounding scent', image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80' },
          { title: 'Refill pouches available', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80' },
          { title: 'Free sample with trial', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80' },
        ],
      },
    },
    'Bold & modern': {
      educate: {
        headline: 'Molecular perfumery: Scents that react to your body chemistry',
        badge: 'Avant-Garde',
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Unique on every skin', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80' },
          { title: 'Iso E Super boost', image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80' },
          { title: 'Magnetic presence', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      care: {
        headline: 'Cruelty-free synthetic musks preserving wild habitats',
        badge: 'Future Fragrance',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: '100% cruelty-free', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80' },
          { title: 'Zero endangered woods', image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80' },
          { title: 'Carbon neutral lab', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80' },
        ],
      },
      promote: {
        headline: 'Noir Santal: Smoky cardamom, leather and creamy iris',
        badge: 'Limited Drop',
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80',
        subCards: [
          { title: 'Extrait de parfum 28%', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80' },
          { title: 'Custom engraved cap', image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80' },
          { title: 'Only 300 bottles cast', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80' },
        ],
      },
    },
  },
};

const STYLE_THUMBNAILS: Record<CategoryType, Record<StyleType, string>> = {
  Skincare: {
    'Premium & minimal': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    'Natural & organic': 'https://images.unsplash.com/photo-1608248597359-54859a688b56?auto=format&fit=crop&w=400&q=80',
    'Bold & modern': 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80',
  },
  Cosmetics: {
    'Premium & minimal': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    'Natural & organic': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80',
    'Bold & modern': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80',
  },
  Perfume: {
    'Premium & minimal': 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80',
    'Natural & organic': 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80',
    'Bold & modern': 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80',
  },
};

export default function BeautyLandingPage() {
  const router = useRouter();
  const previewCanvasRef = useRef<HTMLDivElement>(null);

  // User interactive state
  const [category, setCategory] = useState<CategoryType>('Skincare');
  const [style, setStyle] = useState<StyleType>('Premium & minimal');
  const [brandName, setBrandName] = useState<string>('Bloom Skin');
  const [socialHandle, setSocialHandle] = useState<string>('');
  const [goal, setGoal] = useState<GoalType>('educate');
  const [previewFlash, setPreviewFlash] = useState<boolean>(false);

  // Active preset data
  const currentPreset = PRESETS[category]?.[style]?.[goal] || PRESETS.Skincare['Premium & minimal'].educate;

  // Handle CTA conversion
  const handleProceed = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('markmosaiq_beauty_outreach', JSON.stringify({
          brandName: brandName.trim() || 'Bloom Skin',
          category,
          style,
          goal,
          socialHandle,
        }));
      }
    } catch {
      // ignore
    }
    const cleanBrand = encodeURIComponent(brandName.trim() || 'Bloom Skin');
    router.push(`/signup?ref=beauty&brand=${cleanBrand}&category=${encodeURIComponent(category)}`);
  };

  const handlePreviewClick = () => {
    setPreviewFlash(true);
    setTimeout(() => setPreviewFlash(false), 500);
    if (previewCanvasRef.current) {
      previewCanvasRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className={s.pageWrapper}>
      {/* 1. TOP NAVBAR */}
      <header className={s.nav}>
        <div className={s.navInner}>
          <Link href="/" className={s.logoArea}>
            <div className={s.logoMark}>
              <Sparkles size={22} strokeWidth={2.2} />
            </div>
            <span className={s.brandText}>MarkMosaiq</span>
          </Link>

          <nav className={s.navLinks}>
            <Link href="/beauty" className={`${s.navLink} ${s.navLinkActive}`}>
              For Beauty Brands
            </Link>
            <Link href="#features" className={s.navLink}>
              Features
            </Link>
            <Link href="/pricing" className={s.navLink}>
              Pricing
            </Link>
            <Link href="/login" className={s.navLink}>
              Login
            </Link>
          </nav>

          <button onClick={handleProceed} className={s.navCta}>
            Get started
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className={s.heroSection}>
        <div className={s.heroContent}>
          <div className={s.eyebrow}>Branded Content for Beauty Brands</div>
          <h1 className={s.heroTitle}>
            Your beauty brand deserves to be remembered.
          </h1>
          <p className={s.heroSubtitle}>
            Turn your brand’s story, values and customer care into beautiful Instagram posts and Stories — and stay present in your customers’ feeds.
          </p>

          <div className={s.heroCtaGroup}>
            <button onClick={handleProceed} className={s.primaryPillButton}>
              <span>Create your first branded post</span>
              <ArrowRight size={17} />
            </button>
            <span className={s.ctaSubtext}>No sign up required. Just your brand and an idea.</span>
          </div>

          <div className={s.featureBadgesRow}>
            <div className={s.featureBadge}>
              <span className={s.featureBadgeIcon}>✦</span>
              <span>On-brand content</span>
            </div>
            <div className={s.featureBadge}>
              <span className={s.featureBadgeIcon}>◫</span>
              <span>Made for Instagram</span>
            </div>
            <div className={s.featureBadge}>
              <span className={s.featureBadgeIcon}>✎</span>
              <span>No design skills needed</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Showcase */}
        <div className={s.heroVisualArea}>
          <div className={s.heroLeavesOverlay} />

          {/* Floating Left Story Card */}
          <div className={s.floatingStoryLeft}>
            <img
              src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80"
              alt="Glow with care story"
              className={s.floatingCardImage}
            />
            <div className={s.floatingCardContent}>
              <span className={s.floatingCardTitle}>Glow with care</span>
            </div>
          </div>

          {/* iPhone Mockup Frame */}
          <div className={s.phoneFrame}>
            <div className={s.phoneNotch} />
            <div className={s.igHeader}>
              <div className={s.igStoriesBar}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={s.igStoryCircle}>
                    <img
                      src={`https://images.unsplash.com/photo-15${34528741 + i * 50000}?auto=format&fit=crop&w=100&q=80`}
                      alt="Story avatar"
                      className={s.igStoryInner}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=100&q=80';
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className={s.igPostUserBar}>
                <div className={s.igUserLeft}>
                  <img
                    src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=100&q=80"
                    alt="Brand avatar"
                    className={s.igUserAvatar}
                  />
                  <span className={s.igUsername}>
                    {brandName.toLowerCase().replace(/\s+/g, '') || 'bloomskin'}
                  </span>
                </div>
                <span style={{ fontSize: 13, color: '#9CA3AF' }}>•••</span>
              </div>
            </div>

            <div className={s.igImageWrapper}>
              <img
                src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"
                alt="Instagram beauty post"
                className={s.igPostImage}
              />
              <div className={s.igPostOverlayTitle}>
                Healthy skin is self care
              </div>
            </div>

            <div className={s.igPostActions}>
              <div className={s.igActionGroup}>
                {/* Heart icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#E11D48" stroke="#E11D48" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {/* Comment icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                {/* Share icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </div>
              {/* Bookmark */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>

            <div className={s.igCaptionArea}>
              <p className={s.igCaption}>
                <span className={s.igCaptionBrand}>
                  {brandName.toLowerCase().replace(/\s+/g, '') || 'bloomskin'}
                </span>
                Because your skin deserves the best, every day. 🌿
              </p>
            </div>
          </div>

          {/* Floating Right Top Story Card */}
          <div className={s.floatingStoryRightTop}>
            <img
              src="https://images.unsplash.com/photo-1608248597359-54859a688b56?auto=format&fit=crop&w=600&q=80"
              alt="Natural ingredients"
              className={s.floatingCardImage}
            />
            <div className={s.floatingCardContent}>
              <span className={s.floatingCardTitle}>Natural ingredients. Real results.</span>
            </div>
          </div>

          {/* Floating Right Bottom Story Card */}
          <div className={s.floatingStoryRightBottom}>
            <img
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80"
              alt="Best days ahead"
              className={s.floatingCardImage}
            />
            <div className={s.floatingCardContent}>
              <span className={s.floatingCardTitle}>Your skin’s best days ahead.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STEP 1: CHOOSE YOUR BRAND STYLE */}
      <section className={s.interactiveSection} id="brand-style">
        <div className={s.stepHeader}>
          <span className={s.stepNumber}>1. Choose your brand style</span>
          <h2 className={s.stepTitle}>What kind of beauty brand are you?</h2>
          <p className={s.stepSubtitle}>
            Select your category and style to see a preview of your branded content.
          </p>
        </div>

        <div className={s.styleSelectionRow}>
          {/* Category Tabs */}
          <div className={s.categoryPills}>
            {(['Skincare', 'Cosmetics', 'Perfume'] as CategoryType[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`${s.categoryPill} ${category === cat ? s.categoryPillActive : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Visual Style Cards */}
          <div className={s.visualStyleArea}>
            <span className={s.visualStyleLabel}>Visual style</span>
            <div className={s.styleCardsGrid}>
              {(['Premium & minimal', 'Natural & organic', 'Bold & modern'] as StyleType[]).map((st) => (
                <div
                  key={st}
                  onClick={() => setStyle(st)}
                  className={`${s.styleCard} ${style === st ? s.styleCardActive : ''}`}
                >
                  <div className={s.styleCardImgWrapper}>
                    <img
                      src={STYLE_THUMBNAILS[category][st]}
                      alt={st}
                      className={s.styleCardImg}
                    />
                  </div>
                  <div className={s.styleCardTitle}>{st}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. STEP 2: TELL US ABOUT YOUR BRAND & LIVE PREVIEW */}
      <section className={s.detailsSection} id="features">
        <div className={s.formArea}>
          <div className={s.stepHeader}>
            <span className={s.stepNumber}>2. Tell us about your brand</span>
            <h2 className={s.stepTitle}>A few details help us create the perfect content.</h2>
            <p className={s.stepSubtitle}>
              Share your brand name, website or Instagram, and what you’d like to communicate.
            </p>
          </div>

          <div className={s.inputGroup}>
            <label className={s.inputLabel}>Brand name</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Bloom Skin, Lumière Botanics..."
              className={s.textInput}
            />
          </div>

          <div className={s.inputGroup}>
            <label className={s.inputLabel}>Website or Instagram (optional)</label>
            <input
              type="text"
              value={socialHandle}
              onChange={(e) => setSocialHandle(e.target.value)}
              placeholder="e.g. www.bloomskin.com or @bloomskin"
              className={s.textInput}
            />
          </div>

          <div className={s.optionsGroup}>
            <label className={s.inputLabel}>What do you want to share?</label>

            <div
              onClick={() => setGoal('educate')}
              className={`${s.optionCard} ${goal === 'educate' ? s.optionCardActive : ''}`}
            >
              <div className={`${s.optionRadioCircle} ${goal === 'educate' ? s.optionRadioCircleActive : ''}`}>
                {goal === 'educate' && <div className={s.optionRadioInner} />}
              </div>
              <div className={s.optionText}>
                <div className={s.optionTitle}>Educate my customers</div>
                <div className={s.optionSubtitle}>Share tips, routines or how to use your products.</div>
              </div>
            </div>

            <div
              onClick={() => setGoal('care')}
              className={`${s.optionCard} ${goal === 'care' ? s.optionCardActive : ''}`}
            >
              <div className={`${s.optionRadioCircle} ${goal === 'care' ? s.optionRadioCircleActive : ''}`}>
                {goal === 'care' && <div className={s.optionRadioInner} />}
              </div>
              <div className={s.optionText}>
                <div className={s.optionTitle}>Show how we care</div>
                <div className={s.optionSubtitle}>Communicate your values and customer care.</div>
              </div>
            </div>

            <div
              onClick={() => setGoal('promote')}
              className={`${s.optionCard} ${goal === 'promote' ? s.optionCardActive : ''}`}
            >
              <div className={`${s.optionRadioCircle} ${goal === 'promote' ? s.optionRadioCircleActive : ''}`}>
                {goal === 'promote' && <div className={s.optionRadioInner} />}
              </div>
              <div className={s.optionText}>
                <div className={s.optionTitle}>Promote a product</div>
                <div className={s.optionSubtitle}>Highlight a product benefit or special offer.</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePreviewClick}
            className={s.previewCtaButton}
          >
            <span>Preview my brand content</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Dynamic Live Preview Canvas */}
        <div
          ref={previewCanvasRef}
          className={`${s.previewCanvasBox} ${previewFlash ? 'ring-2 ring-emerald-500' : ''}`}
        >
          <div className={s.previewCanvasHeader}>
            <div className={s.previewBadge}>
              <span className={s.previewBadgeDot} />
              <span>Preview only</span>
            </div>
            <span style={{ fontSize: 12, color: '#8A857D', fontWeight: 500 }}>
              {category} • {style}
            </span>
          </div>

          {/* Main Large Post Card */}
          <div className={s.mainPreviewCard}>
            <img
              src={currentPreset.image}
              alt="Main preview post"
              className={s.mainPreviewImg}
            />
            <div className={s.mainPreviewOverlay}>
              <div className={s.mainPreviewHeadline}>
                {currentPreset.headline}
              </div>

              <div className={s.mainPreviewBrandBadge}>
                ✦ {brandName.trim().toUpperCase() || 'BLOOM SKIN'} ✦
              </div>
            </div>
          </div>

          {/* 3 Story Thumbnails Below */}
          <div className={s.subPreviewGrid}>
            {currentPreset.subCards.map((sub, idx) => (
              <div key={idx} className={s.subPreviewCard}>
                <img
                  src={sub.image}
                  alt={sub.title}
                  className={s.subPreviewImg}
                />
                <div className={s.subPreviewOverlay}>
                  <span className={s.subPreviewText}>{sub.title}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={s.previewDisclaimer}>
            <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              This is a preview of your brand’s content. The actual content will be created based on your inputs after you sign up.
            </span>
          </div>
        </div>
      </section>

      {/* 5. SECTION 3: EXAMPLE CONTENT */}
      <section className={s.showcaseSection}>
        <div className={s.showcaseInner}>
          <div className={s.showcaseHeader}>
            <div className={s.eyebrow}>Example Content</div>
            <h2 className={s.showcaseTitle}>Real content. Your brand.</h2>
            <p className={s.showcaseSubtitle}>
              This is just a sample of what you can create. Every piece is designed to match your brand’s style, voice and message.
            </p>

            <div className={s.showcaseChecklist}>
              <div className={s.checkItem}>
                <div className={s.checkCircle}>
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Feed posts</span>
              </div>
              <div className={s.checkItem}>
                <div className={s.checkCircle}>
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Instagram Stories</span>
              </div>
              <div className={s.checkItem}>
                <div className={s.checkCircle}>
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Carousel posts</span>
              </div>
            </div>
          </div>

          {/* 3 Vertical Example Story Cards */}
          <div className={s.showcaseCardsRow}>
            {/* Story 1 */}
            <div className={s.showcaseStoryCard}>
              <img
                src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80"
                alt="The power of natural ingredients"
                className={s.showcaseCardImg}
              />
              <div className={s.showcaseCardOverlay}>
                <div className={s.showcaseCardHeadline}>
                  The power of natural ingredients
                </div>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.85 }}>
                  {brandName.toUpperCase() || 'BLOOM SKIN'}
                </div>
              </div>
            </div>

            {/* Story 2 */}
            <div className={s.showcaseStoryCard}>
              <img
                src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80"
                alt="Skincare tips for glowing skin"
                className={s.showcaseCardImg}
              />
              <div className={s.showcaseCardOverlay}>
                <div className={s.showcaseCardHeadline}>
                  Skincare tips for glowing skin.
                </div>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.85 }}>
                  Daily Ritual
                </div>
              </div>
            </div>

            {/* Story 3 */}
            <div className={s.showcaseStoryCard}>
              <img
                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"
                alt="3 steps for a healthier skin barrier"
                className={s.showcaseCardImg}
              />
              <div className={s.showcaseCardOverlay}>
                <div className={s.showcaseCardHeadline}>
                  3 steps for a healthier skin barrier
                </div>
                <div className={s.showcaseStepsList}>
                  <div className={s.showcaseStepBullet}>
                    <div className={s.showcaseStepDot} />
                    <span>Cleanse gently</span>
                  </div>
                  <div className={s.showcaseStepBullet}>
                    <div className={s.showcaseStepDot} />
                    <span>Hydrate deeply</span>
                  </div>
                  <div className={s.showcaseStepBullet}>
                    <div className={s.showcaseStepDot} />
                    <span>Protect daily</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION 4: HOW IT WORKS */}
      <section className={s.howItWorksSection}>
        <h2 className={s.howItWorksTitle}>How it works</h2>
        <p className={s.howItWorksSubtitle}>
          From your idea to beautiful content — in just a few steps.
        </p>

        <div className={s.stepsGrid}>
          {/* Step 1 */}
          <div className={s.stepCard}>
            <div className={s.stepTopRow}>
              <span className={s.stepBadgeNumber}>01</span>
              <div className={s.stepIconWrap}>
                <Layers size={17} />
              </div>
            </div>
            <div className={s.stepName}>Choose your brand style</div>
            <p className={s.stepDesc}>
              Pick your category, visual style and tell us about your brand.
            </p>
          </div>

          {/* Step 2 */}
          <div className={s.stepCard}>
            <div className={s.stepTopRow}>
              <span className={s.stepBadgeNumber}>02</span>
              <div className={s.stepIconWrap}>
                <Sparkles size={17} />
              </div>
            </div>
            <div className={s.stepName}>See your preview</div>
            <p className={s.stepDesc}>
              Get a beautiful example of your branded content, instantly.
            </p>
          </div>

          {/* Step 3 */}
          <div className={s.stepCard}>
            <div className={s.stepTopRow}>
              <span className={s.stepBadgeNumber}>03</span>
              <div className={s.stepIconWrap}>
                <Check size={17} />
              </div>
            </div>
            <div className={s.stepName}>Create your account</div>
            <p className={s.stepDesc}>
              Save your content and get 10 free credits to launch your campaign.
            </p>
          </div>

          {/* Step 4 */}
          <div className={s.stepCard}>
            <div className={s.stepTopRow}>
              <span className={s.stepBadgeNumber}>04</span>
              <div className={s.stepIconWrap}>
                <ArrowRight size={17} />
              </div>
            </div>
            <div className={s.stepName}>Keep creating</div>
            <p className={s.stepDesc}>
              Generate more posts, stories and carousels whenever you’re ready.
            </p>
          </div>
        </div>
      </section>

      {/* 7. SECTION 5: OUTREACH OFFER BANNER */}
      <section className={s.offerSection}>
        <div className={s.offerCard}>
          <div className={s.offerImgSide}>
            <img
              src="https://images.unsplash.com/photo-1608248597359-54859a688b56?auto=format&fit=crop&w=1000&q=80"
              alt="Skincare bottle with soft light"
              className={s.offerImg}
            />
          </div>

          <div className={s.offerContentSide}>
            <div className={s.eyebrow}>Get Started</div>
            <h2 className={s.offerTitle}>
              Your first 10 content credits are on us.
            </h2>
            <p className={s.offerSubtitle}>
              Explore MarkMosaiq and discover how your brand’s next posts could look — before deciding whether it’s right for you.
            </p>

            <div className={s.offerChecklist}>
              <div className={s.offerCheckItem}>
                <div className={s.offerCheckCircle}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>10 free credits</span>
              </div>
              <div className={s.offerCheckItem}>
                <div className={s.offerCheckCircle}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>No credit card required</span>
              </div>
              <div className={s.offerCheckItem}>
                <div className={s.offerCheckCircle}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>No sales call required</span>
              </div>
              <div className={s.offerCheckItem}>
                <div className={s.offerCheckCircle}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>Create with your own brand identity</span>
              </div>
            </div>

            <button onClick={handleProceed} className={s.primaryPillButton}>
              <span>Create my first branded post</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerLeft}>
            <div className={s.logoArea}>
              <div className={s.logoMark}>
                <Sparkles size={20} />
              </div>
              <span className={s.brandText} style={{ fontSize: 18 }}>MarkMosaiq</span>
            </div>
            <span className={s.footerTagline}>
              Branded content for beauty businesses.
            </span>
          </div>

          <div className={s.footerLinks}>
            <Link href="/contact" className={s.footerLink}>
              Contact
            </Link>
            <Link href="/privacy" className={s.footerLink}>
              Privacy Policy
            </Link>
            <Link href="/terms" className={s.footerLink}>
              Terms of Service
            </Link>
          </div>

          <div className={s.footerSocials}>
            {/* Instagram Icon */}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={s.socialIconLink} aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            {/* LinkedIn Icon */}
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={s.socialIconLink} aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>

            {/* YouTube Icon */}
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={s.socialIconLink} aria-label="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

