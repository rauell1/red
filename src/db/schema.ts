import { boolean, integer, jsonb, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import type { LoadoutSpec } from '../shared/types';

export const creatorProfile = pgTable('creator_profile', {
  id: serial('id').primaryKey(),
  displayName: varchar('display_name', { length: 80 }).notNull(),
  handle: varchar('handle', { length: 80 }).notNull(),
  tagline: varchar('tagline', { length: 180 }).notNull(),
  bio: text('bio').notNull(),
  tiktokUrl: text('tiktok_url').notNull().default(''),
  whatsappUrl: text('whatsapp_url').notNull().default(''),
  email: varchar('email', { length: 180 }).notNull(),
  followersLabel: varchar('followers_label', { length: 40 }).notNull(),
  avgViewsLabel: varchar('avg_views_label', { length: 40 }).notNull(),
  engagementLabel: varchar('engagement_label', { length: 40 }).notNull(),
  livePeakLabel: varchar('live_peak_label', { length: 40 }).notNull(),
  primaryModes: varchar('primary_modes', { length: 80 }).notNull().default('S&D / BR'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const highlightClips = pgTable('highlight_clips', {
  id: serial('id').primaryKey(),
  codeLabel: varchar('code_label', { length: 10 }).notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  subtitle: varchar('subtitle', { length: 240 }).notNull(),
  category: varchar('category', { length: 80 }).notNull(),
  mapOrMode: varchar('map_or_mode', { length: 80 }).notNull(),
  videoUrl: text('video_url').notNull().default(''),
  posterUrl: text('poster_url').notNull().default(''),
  tiktokUrl: text('tiktok_url').notNull().default(''),
  sponsorTag: varchar('sponsor_tag', { length: 100 }).notNull().default(''),
  isFeatured: boolean('is_featured').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const codmLoadouts = pgTable('codm_loadouts', {
  id: serial('id').primaryKey(),
  tabType: varchar('tab_type', { length: 24, enum: ['hud', 'sensitivity', 'gunsmith', 'device'] }).notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  subtitle: varchar('subtitle', { length: 180 }).notNull(),
  shareCode: varchar('share_code', { length: 160 }).notNull().default(''),
  specs: jsonb('specs').$type<LoadoutSpec[]>().notNull().default([]),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const sponsorPackages = pgTable('sponsor_packages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  tagline: varchar('tagline', { length: 180 }).notNull(),
  priceLabel: varchar('price_label', { length: 80 }).notNull(),
  deliverables: jsonb('deliverables').$type<string[]>().notNull().default([]),
  highlightBadge: varchar('highlight_badge', { length: 80 }).notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const sponsorInquiries = pgTable('sponsor_inquiries', {
  id: serial('id').primaryKey(),
  brandName: varchar('brand_name', { length: 120 }).notNull(),
  contactName: varchar('contact_name', { length: 120 }).notNull(),
  contactInfo: varchar('contact_info', { length: 180 }).notNull(),
  campaignType: varchar('campaign_type', { length: 100 }).notNull(),
  budgetRange: varchar('budget_range', { length: 80 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 24, enum: ['new', 'contacted', 'booked', 'archived'] }).notNull().default('new'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
