import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Boxes, Check, CircleHelp, ClipboardList, Clapperboard, LayoutDashboard, LockKeyhole, LogOut, PackageCheck, RefreshCw, ShieldCheck, SlidersHorizontal, UserRound } from 'lucide-react';
import type { CodmLoadout, CreatorProfile, HighlightClip, InquiryStatus, PortfolioMeta, SponsorInquiry, SponsorPackage } from '../../shared/types';
import { apiRequest, jsonBody } from '../lib/api';
import ProfileTab from '../components/admin/ProfileTab';
import ClipsTab from '../components/admin/ClipsTab';
import LoadoutsTab from '../components/admin/LoadoutsTab';
import PackagesTab from '../components/admin/PackagesTab';
import InquiriesTab from '../components/admin/InquiriesTab';

type AdminData = { profile: CreatorProfile; clips: HighlightClip[]; loadouts: CodmLoadout[]; packages: SponsorPackage[]; inquiries: SponsorInquiry[]; meta: PortfolioMeta };
type SessionInfo = { authenticated: boolean; demoMode: boolean; storage: 'memory' | 'neon' };
type TabId = 'profile' | 'clips' | 'loadouts' | 'packages' | 'inquiries';

const tabs: { id: TabId; label: string; icon: typeof UserRound }[] = [
  { id: 'profile', label: 'Profile & Stats', icon: UserRound },
  { id: 'clips', label: 'Highlight Clips', icon: Clapperboard },
  { id: 'loadouts', label: 'CODM Loadouts', icon: SlidersHorizontal },
  { id: 'packages', label: 'Sponsor Packages', icon: PackageCheck },
  { id: 'inquiries', label: 'Sponsor Inbox', icon: ClipboardList },
];

const emptyData: AdminData = {
  profile: { id: 1, displayName: '', handle: '', tagline: '', bio: '', tiktokUrl: '', whatsappUrl: '', email: '', followersLabel: '', avgViewsLabel: '', engagementLabel: '', livePeakLabel: '', primaryModes: '' },
  clips: [], loadouts: [], packages: [], inquiries: [], meta: { storage: 'memory', demoMode: true },
};

export default function AdminPage() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [data, setData] = useState<AdminData>(emptyData);
  const [tab, setTab] = useState<TabId>('profile');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadAdminData = useCallback(async () => {
    const next = await apiRequest<AdminData>('/api/admin/data');
    setData(next);
    setSession((previous) => previous ? { ...previous, storage: next.meta.storage } : previous);
  }, []);

  useEffect(() => {
    let active = true;
    apiRequest<SessionInfo>('/api/admin/session')
      .then(async (info) => {
        if (!active) return;
        setSession(info);
        if (info.authenticated) await loadAdminData();
      })
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Could not connect to the admin API.'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadAdminData]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = await apiRequest<{ demoMode: boolean }>('/api/admin/login', { method: 'POST', body: jsonBody({ password }) });
      const next = await apiRequest<SessionInfo>('/api/admin/session');
      setSession({ ...next, demoMode: result.demoMode });
      await loadAdminData();
      setPassword('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Sign-in failed.');
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    try { await apiRequest('/api/admin/logout', { method: 'POST' }); } catch { /* Keep local logout available if network is briefly unavailable. */ }
    setSession((previous) => previous ? { ...previous, authenticated: false } : previous);
    setData(emptyData);
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  }

  function updateProfile(profile: CreatorProfile) {
    setData((current) => ({ ...current, profile }));
    showNotice('Creator profile updated.');
  }
  function updateClips(clips: HighlightClip[]) { setData((current) => ({ ...current, clips })); showNotice('Highlight library updated.'); }
  function updateLoadouts(loadouts: CodmLoadout[]) { setData((current) => ({ ...current, loadouts })); showNotice('CODM loadouts updated.'); }
  function updatePackages(packages: SponsorPackage[]) { setData((current) => ({ ...current, packages })); showNotice('Sponsor packages updated.'); }
  function updateInquiries(inquiries: SponsorInquiry[]) { setData((current) => ({ ...current, inquiries })); showNotice('Inquiry status updated.'); }

  if (loading) return <div className="admin-loading"><div className="admin-loader-mark"><CrosshairLoader /></div><span className="hud-mono">CHECKING CLEARANCE…</span></div>;
  if (!session?.authenticated) return (
    <div className="admin-login-screen">
      <a className="admin-back" href="/"><ArrowLeft size={15} /> BACK TO PORTFOLIO</a>
      <div className="admin-login-card">
        <div className="admin-login-icon"><LockKeyhole size={21} /></div>
        <p className="section-kicker hud-mono"><span className="kicker-signal" /> RED / CREATOR CONSOLE</p>
        <h1>Command<br /><em>access.</em></h1>
        <p className="admin-login-copy">Sign in to update portfolio content, campaign packages, and sponsor inquiries.</p>
        {session?.demoMode && <div className="preview-mode-note"><CircleHelp size={15} /><span><strong>Preview Demo Mode</strong><small>Local preview password: <code>red-admin-demo</code></small></span></div>}
        {error && <div className="admin-alert admin-alert-error" role="alert">{error}</div>}
        <form className="admin-login-form" onSubmit={login}><label htmlFor="admin-password">ADMIN PASSWORD</label><input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter passphrase" autoComplete="current-password" required /><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'VERIFYING…' : <>UNLOCK CONSOLE <LockKeyhole size={15} /></>}</button></form>
        <div className="admin-login-foot"><ShieldCheck size={14} /> HMAC-SHA256 SESSION / HTTPONLY COOKIE</div>
      </div>
      <span className="admin-login-code hud-mono">AUTH GATE // 0x01</span>
    </div>
  );

  const activeTab = tabs.find((item) => item.id === tab)!;
  const ActiveIcon = activeTab.icon;
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/"><span className="brand-mark"><i />R</span><span><strong>RED</strong><small>CREATOR CONSOLE</small></span></a>
        <div className="admin-sidebar-label hud-mono">WORKSPACE</div>
        <nav className="admin-nav" aria-label="Admin sections">{tabs.map(({ id, label, icon: Icon }) => <button type="button" className={tab === id ? 'active' : ''} key={id} onClick={() => setTab(id)}><Icon size={16} /><span>{label}</span>{id === 'inquiries' && data.inquiries.filter((inquiry) => inquiry.status === 'new').length > 0 && <i className="nav-count">{data.inquiries.filter((inquiry) => inquiry.status === 'new').length}</i>}</button>)}</nav>
        <div className="admin-sidebar-bottom"><div className="admin-side-user"><span className="admin-user-avatar">R</span><div><strong>Red's Team</strong><small>PORTFOLIO ADMIN</small></div></div><button type="button" onClick={logout}><LogOut size={15} /> SIGN OUT</button></div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar"><div className="admin-mobile-brand"><a href="/" className="brand-mark"><i />R</a><span className="hud-mono">RED / ADMIN</span></div><div className="admin-breadcrumb"><a href="/">Portfolio</a><span>/</span><span>{activeTab.label}</span></div><div className="admin-top-actions"><span className={`storage-pill ${session.storage === 'neon' ? 'storage-neon' : ''}`}><i />{session.storage === 'neon' ? 'NEON POSTGRESQL CONNECTED' : 'PREVIEW MEMORY MODE'}</span><button className="admin-refresh" type="button" onClick={async () => { try { await loadAdminData(); showNotice('Data refreshed.'); } catch { setError('Could not refresh data.'); } }} aria-label="Refresh dashboard"><RefreshCw size={15} /></button><button className="admin-mobile-logout" type="button" aria-label="Sign out" onClick={logout}><LogOut size={14} /></button><a className="admin-view-site" href="/">VIEW SITE <ArrowUpLeft /></a></div></header>
        <nav className="admin-mobile-tabs" aria-label="Admin sections">{tabs.map(({ id, label, icon: Icon }) => <button type="button" className={tab === id ? 'active' : ''} key={id} onClick={() => setTab(id)}><Icon size={14} /><span>{label}</span></button>)}</nav>
        {error && <div className="admin-global-error" role="alert">{error}<button type="button" onClick={() => setError('')}>×</button></div>}
        <div className="admin-page-content">
          <div className="admin-page-heading"><div><span className="section-kicker hud-mono"><span className="kicker-signal" /> CREATOR OPERATIONS / {String(tabs.findIndex((item) => item.id === tab) + 1).padStart(2, '0')}</span><h1>{activeTab.label}</h1><p>Manage live portfolio content and keep the public profile in sync.</p></div><div className="admin-heading-mark"><ActiveIcon size={23} /><span className="hud-mono">NYK // 001</span></div></div>
          <div className="admin-tab-content">
            {tab === 'profile' && <ProfileTab profile={data.profile} onSaved={updateProfile} />}
            {tab === 'clips' && <ClipsTab clips={data.clips} onChanged={updateClips} />}
            {tab === 'loadouts' && <LoadoutsTab loadouts={data.loadouts} onChanged={updateLoadouts} />}
            {tab === 'packages' && <PackagesTab packages={data.packages} onChanged={updatePackages} />}
            {tab === 'inquiries' && <InquiriesTab inquiries={data.inquiries} onChanged={updateInquiries} />}
          </div>
        </div>
        <footer className="admin-footer"><span className="hud-mono"><LayoutDashboard size={13} /> RED PORTFOLIO SYSTEMS</span><span>Changes publish to the portfolio immediately.{session.demoMode ? ' Preview data resets when the API process restarts.' : ''}</span><span className="hud-mono"><Boxes size={13} /> CACHE AUTO-PURGE <Check size={13} /></span></footer>
        {notice && <div className="admin-toast"><Check size={15} />{notice}</div>}
      </main>
    </div>
  );
}

function CrosshairLoader() {
  return <span className="crosshair-loader"><i /><b /></span>;
}

function ArrowUpLeft() {
  return <ArrowLeft size={13} className="arrow-up-left" />;
}
