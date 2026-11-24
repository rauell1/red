import { useState, type FormEvent } from 'react';
import { Edit3, PackageCheck, Plus, Save, Trash2, X } from 'lucide-react';
import { packageSchema, type PackageSchema } from '../../../shared/schemas';
import type { SponsorPackage } from '../../../shared/types';
import { apiRequest, jsonBody } from '../../lib/api';

const blank = (order: number): PackageSchema => ({ name: '', tagline: '', priceLabel: '', deliverables: [''], highlightBadge: '', sortOrder: order });

export default function PackagesTab({ packages, onChanged }: { packages: SponsorPackage[]; onChanged: (packages: SponsorPackage[]) => void }) {
  const [draft, setDraft] = useState<PackageSchema | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deliverablesText, setDeliverablesText] = useState('[]');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function edit(item?: SponsorPackage) {
    setError('');
    setEditingId(item?.id ?? null);
    const next = item ? { name: item.name, tagline: item.tagline, priceLabel: item.priceLabel, deliverables: item.deliverables, highlightBadge: item.highlightBadge, sortOrder: item.sortOrder } : blank(packages.length + 1);
    setDraft(next);
    setDeliverablesText(JSON.stringify(next.deliverables, null, 2));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    let deliverables: unknown;
    try { deliverables = JSON.parse(deliverablesText); } catch { setError('Deliverables must be a JSON string array.'); return; }
    const parsed = packageSchema.safeParse({ ...draft, deliverables });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Check package details.'); return; }
    setError('');
    setBusy(true);
    try {
      const result = await apiRequest<{ package: SponsorPackage }>(editingId ? `/api/admin/packages/${editingId}` : '/api/admin/packages', { method: editingId ? 'PUT' : 'POST', body: jsonBody(parsed.data) });
      const next = editingId ? packages.map((item) => item.id === editingId ? result.package : item) : [...packages, result.package];
      onChanged(next.sort((a, b) => a.sortOrder - b.sortOrder));
      setDraft(null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not save package.'); }
    finally { setBusy(false); }
  }

  async function remove(id: number) {
    if (!window.confirm('Delete this sponsor package?')) return;
    try { await apiRequest(`/api/admin/packages/${id}`, { method: 'DELETE' }); onChanged(packages.filter((item) => item.id !== id)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not delete package.'); }
  }

  return (
    <div className="admin-resource-tab">
      <div className="admin-resource-toolbar"><div className="admin-resource-summary"><span className="admin-resource-icon"><PackageCheck size={17} /></span><div><strong>{packages.length} partnership packages</strong><small>Public media kit offers and deliverables.</small></div></div><button className="button button-primary button-small" type="button" onClick={() => edit()}><Plus size={15} /> ADD PACKAGE</button></div>
      {error && <div className="admin-alert admin-alert-error" role="alert">{error}</div>}
      {draft && <form className="admin-card admin-resource-editor" onSubmit={save}>
        <div className="admin-card-heading"><span className="admin-card-icon"><Edit3 size={16} /></span><div><h2>{editingId ? 'Edit partnership package' : 'New partnership package'}</h2><p>Published prices are visible to brands. Keep preview rates clearly verified.</p></div><button className="admin-close-editor" type="button" onClick={() => setDraft(null)} aria-label="Close editor"><X size={18} /></button></div>
        <div className="admin-form-grid">
          <label className="admin-field"><span>PACKAGE NAME</span><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} maxLength={120} /></label>
          <label className="admin-field"><span>PRICE LABEL</span><input value={draft.priceLabel} onChange={(event) => setDraft({ ...draft, priceLabel: event.target.value })} maxLength={80} /></label>
          <label className="admin-field"><span>TAGLINE</span><input value={draft.tagline} onChange={(event) => setDraft({ ...draft, tagline: event.target.value })} maxLength={180} /></label>
          <label className="admin-field"><span>BADGE (OPTIONAL)</span><input value={draft.highlightBadge} onChange={(event) => setDraft({ ...draft, highlightBadge: event.target.value })} maxLength={80} /></label>
          <label className="admin-field"><span>SORT ORDER</span><input type="number" value={draft.sortOrder} onChange={(event) => setDraft({ ...draft, sortOrder: Number(event.target.value) })} /></label>
          <label className="admin-field admin-field-wide"><span>DELIVERABLES (JSON STRING ARRAY)</span><textarea className="admin-code-textarea" rows={6} value={deliverablesText} onChange={(event) => setDeliverablesText(event.target.value)} spellCheck={false} /></label>
        </div>
        <div className="admin-editor-actions"><button type="button" className="admin-quiet-button" onClick={() => setDraft(null)}>CANCEL</button><button className="button button-primary button-small" type="submit" disabled={busy}>{busy ? 'SAVING…' : <>SAVE PACKAGE <Save size={14} /></>}</button></div>
      </form>}
      <div className="admin-package-list">{packages.length === 0 && <div className="admin-empty-state">No sponsor offers yet.</div>}{packages.map((item, index) => <article className="admin-package-row" key={item.id}><span className="admin-package-index hud-mono">0{index + 1}</span><div className="admin-package-copy"><strong>{item.name}</strong><p>{item.tagline}</p><small>{item.deliverables.length} deliverables · {item.highlightBadge || 'NO BADGE'}</small></div><span className="admin-package-price hud-mono">{item.priceLabel}</span><div className="admin-row-actions"><button type="button" aria-label={`Edit ${item.name}`} onClick={() => edit(item)}><Edit3 size={15} /></button><button type="button" aria-label={`Delete ${item.name}`} onClick={() => remove(item.id)}><Trash2 size={15} /></button></div></article>)}</div>
    </div>
  );
}
