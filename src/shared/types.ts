export type LoadoutTab = 'hud' | 'sensitivity' | 'gunsmith' | 'device';
export type InquiryStatus = 'new' | 'contacted' | 'booked' | 'archived';

export interface CreatorProfile {
  id: number;
  displayName: string;
  handle: string;
  tagline: string;
  bio: string;
  tiktokUrl: string;
  whatsappUrl: string;
  email: string;
  followersLabel: string;
  avgViewsLabel: string;
  engagementLabel: string;
  livePeakLabel: string;
  primaryModes: string;
  updatedAt?: string | Date;
}

export interface HighlightClip {
  id: number;
  codeLabel: string;
  title: string;
  subtitle: string;
  category: string;
  mapOrMode: string;
  videoUrl: string;
  posterUrl: string;
  tiktokUrl: string;
  sponsorTag: string;
  isFeatured: boolean;
  sortOrder: number;
}

export interface LoadoutSpec {
  label: string;
  value: string;
}

export interface CodmLoadout {
  id: number;
  tabType: LoadoutTab;
  title: string;
  subtitle: string;
  shareCode: string;
  specs: LoadoutSpec[];
  sortOrder: number;
}

export interface SponsorPackage {
  id: number;
  name: string;
  tagline: string;
  priceLabel: string;
  deliverables: string[];
  highlightBadge: string;
  sortOrder: number;
}

export interface SponsorInquiry {
  id: number;
  brandName: string;
  contactName: string;
  contactInfo: string;
  campaignType: string;
  budgetRange: string;
  message: string;
  status: InquiryStatus;
  createdAt: string | Date;
}

export interface PortfolioMeta {
  storage: 'memory' | 'neon';
  demoMode: boolean;
}

export interface PortfolioData {
  profile: CreatorProfile;
  clips: HighlightClip[];
  loadouts: CodmLoadout[];
  packages: SponsorPackage[];
  meta: PortfolioMeta;
}

export interface InquiryPayload {
  brandName: string;
  contactName: string;
  contactInfo: string;
  campaignType: string;
  budgetRange: string;
  message: string;
  website?: string;
}
