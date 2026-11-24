import { useEffect, useState, type FormEvent } from 'react';
import { Check, ExternalLink, Save, UserRound } from 'lucide-react';
import { profileSchema, type ProfileSchema } from '../../../shared/schemas';
import type { CreatorProfile } from '../../../shared/types';
import { apiRequest, jsonBody } from '../../lib/api';

const editableFields: { key: keyof ProfileSchema; label: string; placeholder: string }[] = [
  { key: 'displayName', label: 'DISPLAY NAME', placeholder: 'Red' },
  { key: 'handle', label: 'TIKTOK HANDLE', placeholder: '@nyekunduuu' },
  { key: 'tagline', label: 'CREATOR TAGLINE', placeholder: 'CODM competitor & live entertainer' },
  { key: 'email', label: 'BOOKING EMAIL', placeholder: 'team@example.com' },
  { key: 'tiktokUrl', label: 'TIKTOK PROFILE URL', placeholder: 'https://www.tiktok.com/@nyekunduuu' },
  { key: 'whatsappUrl', label: 'WHATSAPP URL', placeholder: 'https://wa.me/254…' },
  { key: 'followersLabel', label: 'FOLLOWERS LABEL', placeholder: '84.2K' },
  { key: 'avgViewsLabel', label: 'AVERAGE VIEWS LABEL', placeholder: '46K' },
  { key: 'engagementLabel', label: 'ENGAGEMENT LABEL', placeholder: '8.7%' },
  { key: 'livePeakLabel', label: 'LIVE PEAK LABEL', placeholder: '2.4K' },
  { key: 'primaryModes', label: 'PRIMARY MODES', placeholder: 'S&D / BR' },
];

function toDraft(profile: CreatorProfile): ProfileSchema {
  return {
    displayName: profile.displayName,
    handle: profile.handle,
    tagline: profile.tagline,
    bio: profile.bio,
    tiktokUrl: profile.tiktokUrl,
    whatsappUrl: profile.whatsappUrl,
    email: profile.email,
    followersLabel: profile.followersLabel,
    avgViewsLabel: profile.avgViewsLabel,
    engagementLabel: profile.engagementLabel,
    livePeakLabel: profile.livePeakLabel,
    primaryModes: profile.primaryModes,
  };
}

export default function ProfileTab({ profile, onSaved }: { profile: CreatorProfile; onSaved: (profile: CreatorProfile) => void }) {
  const [draft, setDraft] = useState<ProfileSchema>(() => toDraft(profile));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => setDraft(toDraft(profile)), [profile]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const parsed = profileSchema.safeParse(draft);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const [key, messages] of Object.entries(parsed.error.flatten().fieldErrors)) if (messages?.[0]) next[key] = messages[0];
      setFieldErrors(next);
      setError('Please fix the highlighted fields before saving.');
      return;
    }
    setBusy(true);
    setFieldErrors({});
    try {
      const result = await apiRequest<{ profile: CreatorProfile }>('/api/admin/profile', { method: 'PUT', body: jsonBody(parsed.data) });
      onSaved(result.profile);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save profile.');
    } finally { setBusy(false); }
  }

  function change(key: keyof ProfileSchema, value: string) { setDraft((current) => ({ ...current, [key]: value })); }

  return (
    <form className="admin-editor-form" onSubmit={submit}>
      <div className="admin-card admin-profile-card">
        <div className="admin-card-heading"><span className="admin-card-icon"><UserRound size={17} /></span><div><h2>Creator identity</h2><p>Public-facing details and direct contact links.</p></div><span className="admin-autosave-label hud-mono"><span /> LIVE PROFILE</span></div>
        <div className="admin-form-grid">
          {editableFields.map((field) => <label className="admin-field" key={field.key}><span>{field.label}</span><input type={field.key === 'email' ? 'email' : 'text'} value={draft[field.key]} onChange={(event) => change(field.key, event.target.value)} placeholder={field.placeholder} maxLength={field.key === 'tagline' ? 180 : 200} aria-invalid={Boolean(fieldErrors[field.key])} />{fieldErrors[field.key] && <small className="field-error">{fieldErrors[field.key]}</small>}</label>)}
          <label className="admin-field admin-field-wide"><span>CREATOR BIO</span><textarea value={draft.bio} onChange={(event) => change('bio', event.target.value)} rows={4} maxLength={1200} placeholder="Short creator introduction…" aria-invalid={Boolean(fieldErrors.bio)} />{fieldErrors.bio && <small className="field-error">{fieldErrors.bio}</small>}</label>
        </div>
      </div>
      <div className="admin-preview-summary"><div className="admin-preview-avatar">R</div><div><span className="hud-mono">PORTFOLIO IDENTITY PREVIEW</span><strong>{draft.displayName || 'Creator'} <small>{draft.handle}</small></strong><p>{draft.tagline || 'Add a creator tagline.'}</p></div><a href={draft.tiktokUrl || '#'} target="_blank" rel="noreferrer">OPEN PROFILE <ExternalLink size={14} /></a></div>
      {error && <div className="admin-alert admin-alert-error" role="alert">{error}</div>}
      <div className="admin-form-actions"><span className="hud-mono"><Check size={13} /> SAVES INVALIDATE EDGE CACHE</span><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'SAVING…' : <>SAVE PROFILE <Save size={15} /></>}</button></div>
    </form>
  );
}
