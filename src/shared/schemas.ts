import { z } from 'zod';

const shortText = (max: number, label: string) => z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);
const optionalUrl = z.string().trim().max(2000).refine((value) => !value || /^https:\/\//i.test(value) || value.startsWith('/'), 'Use an HTTPS URL or a local path').optional().default('');

export const inquirySchema = z.object({
  brandName: shortText(120, 'Brand name'),
  contactName: shortText(120, 'Contact name'),
  contactInfo: shortText(180, 'Email or WhatsApp').refine((value) => value.includes('@') ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : /^\+?[\d\s().-]{7,}$/.test(value), 'Enter a valid email or WhatsApp number'),
  campaignType: shortText(100, 'Campaign type'),
  budgetRange: shortText(80, 'Budget range'),
  message: shortText(2000, 'Campaign brief'),
  website: z.string().max(0, 'Spam detected').optional().default(''),
});

export const profileSchema = z.object({
  displayName: shortText(80, 'Display name'),
  handle: shortText(80, 'Handle'),
  tagline: shortText(180, 'Tagline'),
  bio: shortText(1200, 'Bio'),
  tiktokUrl: optionalUrl,
  whatsappUrl: optionalUrl,
  email: z.string().trim().email('Enter a valid email').max(180),
  followersLabel: shortText(40, 'Followers'),
  avgViewsLabel: shortText(40, 'Average views'),
  engagementLabel: shortText(40, 'Engagement'),
  livePeakLabel: shortText(40, 'Live peak'),
  primaryModes: shortText(80, 'Primary modes'),
});

export const clipSchema = z.object({
  codeLabel: shortText(10, 'Clip number'),
  title: shortText(100, 'Title'),
  subtitle: shortText(240, 'Description'),
  category: shortText(80, 'Category'),
  mapOrMode: shortText(80, 'Map or mode'),
  videoUrl: optionalUrl,
  posterUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  sponsorTag: z.string().trim().max(100).default(''),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export const loadoutSchema = z.object({
  tabType: z.enum(['hud', 'sensitivity', 'gunsmith', 'device']),
  title: shortText(100, 'Title'),
  subtitle: shortText(180, 'Subtitle'),
  shareCode: z.string().trim().max(160).default(''),
  specs: z.array(z.object({ label: shortText(60, 'Spec label'), value: shortText(180, 'Spec value') })).max(30),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export const packageSchema = z.object({
  name: shortText(120, 'Package name'),
  tagline: shortText(180, 'Tagline'),
  priceLabel: shortText(80, 'Price label'),
  deliverables: z.array(shortText(180, 'Deliverable')).max(12),
  highlightBadge: z.string().trim().max(80).default(''),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export const inquiryStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'booked', 'archived']),
});

export const loginSchema = z.object({ password: z.string().min(1).max(300) });

export type InquirySchema = z.infer<typeof inquirySchema>;
export type ProfileSchema = z.infer<typeof profileSchema>;
export type ClipSchema = z.infer<typeof clipSchema>;
export type LoadoutSchema = z.infer<typeof loadoutSchema>;
export type PackageSchema = z.infer<typeof packageSchema>;
