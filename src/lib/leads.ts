import leadsData from '@/data/outreach_leads.json';

export interface OutreachLead {
  id: string;
  fitScore: number;
  brand: string;
  niche: string;
  instagram: string;
  followers: number;
  email: string | null;
  hasEmail: boolean;
  contactRoute: string;
  website: string | null;
  latestPost: string;
  sourcePost: string;
  whyTheyFit: string;
  emailSubject: string;
  emailMessage: string;
  status: 'READY_FOR_OUTREACH' | 'CONTACTED' | 'REPLIED' | 'CONVERTED' | 'UNRESPONSIVE';
}

export interface OutreachDataset {
  totalLeads: number;
  withEmailCount: number;
  dmOnlyCount: number;
  highFitCount: number;
  mediumFitCount: number;
  lowerFitCount: number;
  metaNotes: Record<string, string>;
  leads: OutreachLead[];
}

export const OUTREACH_DATASET = leadsData as OutreachDataset;

/**
 * Retourne tous les leads prêts pour cold emailing (ceux qui ont une adresse e-mail vérifiée)
 */
export function getEmailableLeads(): OutreachLead[] {
  return OUTREACH_DATASET.leads.filter((lead) => lead.hasEmail && lead.email);
}

/**
 * Retourne les leads à contacter via Instagram DM (ceux sans adresse email publique)
 */
export function getDmLeads(): OutreachLead[] {
  return OUTREACH_DATASET.leads.filter((lead) => !lead.hasEmail);
}

/**
 * Filtre les leads par score de correspondance (Fit score: 5, 4, ou 3)
 */
export function getLeadsByFit(minFit: number = 4): OutreachLead[] {
  return OUTREACH_DATASET.leads.filter((lead) => lead.fitScore >= minFit);
}

/**
 * Filtre les leads par niche (ex: 'Candles', 'Jewellery')
 */
export function getLeadsByNiche(niche: string): OutreachLead[] {
  return OUTREACH_DATASET.leads.filter((lead) => lead.niche.toLowerCase().includes(niche.toLowerCase()));
}

