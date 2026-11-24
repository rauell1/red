import { asc, desc, eq } from 'drizzle-orm';
import type { AppBindings } from '../api/types';
import { demoClips, demoLoadouts, demoPackages, demoProfile } from '../shared/demoData';
import type { CodmLoadout, CreatorProfile, HighlightClip, InquiryStatus, SponsorInquiry, SponsorPackage } from '../shared/types';
import type { ClipSchema, LoadoutSchema, PackageSchema, ProfileSchema } from '../shared/schemas';
import { createDb } from './client';
import { codmLoadouts, creatorProfile, highlightClips, sponsorInquiries, sponsorPackages } from './schema';

export interface Repository {
  readonly mode: 'memory' | 'neon';
  getProfile(): Promise<CreatorProfile>;
  updateProfile(input: ProfileSchema): Promise<CreatorProfile>;
  listClips(): Promise<HighlightClip[]>;
  saveClip(input: ClipSchema, id?: number): Promise<HighlightClip>;
  deleteClip(id: number): Promise<boolean>;
  listLoadouts(): Promise<CodmLoadout[]>;
  saveLoadout(input: LoadoutSchema, id?: number): Promise<CodmLoadout>;
  deleteLoadout(id: number): Promise<boolean>;
  listPackages(): Promise<SponsorPackage[]>;
  savePackage(input: PackageSchema, id?: number): Promise<SponsorPackage>;
  deletePackage(id: number): Promise<boolean>;
  listInquiries(): Promise<SponsorInquiry[]>;
  createInquiry(input: Omit<SponsorInquiry, 'id' | 'status' | 'createdAt'>): Promise<SponsorInquiry>;
  setInquiryStatus(id: number, status: InquiryStatus): Promise<SponsorInquiry | null>;
}

const clone = <T>(value: T): T => structuredClone(value);

type MemoryState = {
  profile: CreatorProfile;
  clips: HighlightClip[];
  loadouts: CodmLoadout[];
  packages: SponsorPackage[];
  inquiries: SponsorInquiry[];
  ids: { clip: number; loadout: number; package: number; inquiry: number };
};

const memoryState: MemoryState = {
  profile: clone(demoProfile),
  clips: clone(demoClips),
  loadouts: clone(demoLoadouts),
  packages: clone(demoPackages),
  inquiries: [],
  ids: {
    clip: Math.max(...demoClips.map((item) => item.id)) + 1,
    loadout: Math.max(...demoLoadouts.map((item) => item.id)) + 1,
    package: Math.max(...demoPackages.map((item) => item.id)) + 1,
    inquiry: 1,
  },
};

class MemoryRepository implements Repository {
  readonly mode = 'memory' as const;

  async getProfile() { return clone(memoryState.profile); }
  async updateProfile(input: ProfileSchema) {
    memoryState.profile = { ...memoryState.profile, ...clone(input), updatedAt: new Date().toISOString() };
    return clone(memoryState.profile);
  }
  async listClips() { return clone(memoryState.clips.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)); }
  async saveClip(input: ClipSchema, id?: number) {
    if (id) {
      const index = memoryState.clips.findIndex((item) => item.id === id);
      if (index < 0) throw new Error('Clip not found');
      memoryState.clips[index] = { ...memoryState.clips[index], ...clone(input), id };
      return clone(memoryState.clips[index]);
    }
    const item = { ...clone(input), id: memoryState.ids.clip++ };
    memoryState.clips.push(item);
    return clone(item);
  }
  async deleteClip(id: number) {
    const before = memoryState.clips.length;
    memoryState.clips = memoryState.clips.filter((item) => item.id !== id);
    return memoryState.clips.length !== before;
  }
  async listLoadouts() { return clone(memoryState.loadouts.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)); }
  async saveLoadout(input: LoadoutSchema, id?: number) {
    if (id) {
      const index = memoryState.loadouts.findIndex((item) => item.id === id);
      if (index < 0) throw new Error('Loadout not found');
      memoryState.loadouts[index] = { ...memoryState.loadouts[index], ...clone(input), id };
      return clone(memoryState.loadouts[index]);
    }
    const item = { ...clone(input), id: memoryState.ids.loadout++ };
    memoryState.loadouts.push(item);
    return clone(item);
  }
  async deleteLoadout(id: number) {
    const before = memoryState.loadouts.length;
    memoryState.loadouts = memoryState.loadouts.filter((item) => item.id !== id);
    return memoryState.loadouts.length !== before;
  }
  async listPackages() { return clone(memoryState.packages.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)); }
  async savePackage(input: PackageSchema, id?: number) {
    if (id) {
      const index = memoryState.packages.findIndex((item) => item.id === id);
      if (index < 0) throw new Error('Package not found');
      memoryState.packages[index] = { ...memoryState.packages[index], ...clone(input), id };
      return clone(memoryState.packages[index]);
    }
    const item = { ...clone(input), id: memoryState.ids.package++ };
    memoryState.packages.push(item);
    return clone(item);
  }
  async deletePackage(id: number) {
    const before = memoryState.packages.length;
    memoryState.packages = memoryState.packages.filter((item) => item.id !== id);
    return memoryState.packages.length !== before;
  }
  async listInquiries() { return clone(memoryState.inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); }
  async createInquiry(input: Omit<SponsorInquiry, 'id' | 'status' | 'createdAt'>) {
    const item: SponsorInquiry = { ...clone(input), id: memoryState.ids.inquiry++, status: 'new', createdAt: new Date().toISOString() };
    memoryState.inquiries.unshift(item);
    return clone(item);
  }
  async setInquiryStatus(id: number, status: InquiryStatus) {
    const inquiry = memoryState.inquiries.find((item) => item.id === id);
    if (!inquiry) return null;
    inquiry.status = status;
    return clone(inquiry);
  }
}

class NeonRepository implements Repository {
  readonly mode = 'neon' as const;
  private readonly db;

  constructor(databaseUrl: string) { this.db = createDb(databaseUrl); }

  async getProfile(): Promise<CreatorProfile> {
    const [row] = await this.db.select().from(creatorProfile).limit(1);
    return (row as CreatorProfile | undefined) ?? clone(demoProfile);
  }
  async updateProfile(input: ProfileSchema): Promise<CreatorProfile> {
    const [row] = await this.db.insert(creatorProfile).values({ id: 1, ...input, updatedAt: new Date() })
      .onConflictDoUpdate({ target: creatorProfile.id, set: { ...input, updatedAt: new Date() } }).returning();
    return row as CreatorProfile;
  }
  async listClips(): Promise<HighlightClip[]> {
    return await this.db.select().from(highlightClips).orderBy(asc(highlightClips.sortOrder), asc(highlightClips.id)) as HighlightClip[];
  }
  async saveClip(input: ClipSchema, id?: number): Promise<HighlightClip> {
    const query = id
      ? this.db.update(highlightClips).set(input).where(eq(highlightClips.id, id)).returning()
      : this.db.insert(highlightClips).values(input).returning();
    const [row] = await query;
    if (!row) throw new Error('Clip not found');
    return row as HighlightClip;
  }
  async deleteClip(id: number) {
    const rows = await this.db.delete(highlightClips).where(eq(highlightClips.id, id)).returning({ id: highlightClips.id });
    return rows.length > 0;
  }
  async listLoadouts(): Promise<CodmLoadout[]> {
    return await this.db.select().from(codmLoadouts).orderBy(asc(codmLoadouts.sortOrder), asc(codmLoadouts.id)) as CodmLoadout[];
  }
  async saveLoadout(input: LoadoutSchema, id?: number): Promise<CodmLoadout> {
    const query = id
      ? this.db.update(codmLoadouts).set(input).where(eq(codmLoadouts.id, id)).returning()
      : this.db.insert(codmLoadouts).values(input).returning();
    const [row] = await query;
    if (!row) throw new Error('Loadout not found');
    return row as CodmLoadout;
  }
  async deleteLoadout(id: number) {
    const rows = await this.db.delete(codmLoadouts).where(eq(codmLoadouts.id, id)).returning({ id: codmLoadouts.id });
    return rows.length > 0;
  }
  async listPackages(): Promise<SponsorPackage[]> {
    return await this.db.select().from(sponsorPackages).orderBy(asc(sponsorPackages.sortOrder), asc(sponsorPackages.id)) as SponsorPackage[];
  }
  async savePackage(input: PackageSchema, id?: number): Promise<SponsorPackage> {
    const query = id
      ? this.db.update(sponsorPackages).set(input).where(eq(sponsorPackages.id, id)).returning()
      : this.db.insert(sponsorPackages).values(input).returning();
    const [row] = await query;
    if (!row) throw new Error('Package not found');
    return row as SponsorPackage;
  }
  async deletePackage(id: number) {
    const rows = await this.db.delete(sponsorPackages).where(eq(sponsorPackages.id, id)).returning({ id: sponsorPackages.id });
    return rows.length > 0;
  }
  async listInquiries(): Promise<SponsorInquiry[]> {
    return await this.db.select().from(sponsorInquiries).orderBy(desc(sponsorInquiries.createdAt)) as SponsorInquiry[];
  }
  async createInquiry(input: Omit<SponsorInquiry, 'id' | 'status' | 'createdAt'>): Promise<SponsorInquiry> {
    const [row] = await this.db.insert(sponsorInquiries).values(input).returning();
    return row as SponsorInquiry;
  }
  async setInquiryStatus(id: number, status: InquiryStatus): Promise<SponsorInquiry | null> {
    const [row] = await this.db.update(sponsorInquiries).set({ status }).where(eq(sponsorInquiries.id, id)).returning();
    return (row as SponsorInquiry | undefined) ?? null;
  }
}

const memoryRepository = new MemoryRepository();
export function getRepository(env: AppBindings = {}): Repository {
  const databaseUrl = env.DATABASE_URL?.trim();
  return databaseUrl ? new NeonRepository(databaseUrl) : memoryRepository;
}
