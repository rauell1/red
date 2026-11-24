import { useState, type FormEvent } from 'react';
import { Copy, Edit3, Plus, Save, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { loadoutSchema, type LoadoutSchema } from '../../../shared/schemas';
import type { CodmLoadout, LoadoutTab } from '../../../shared/types';
import { apiRequest, jsonBody } from '../../lib/api';

const tabLabels: Record<LoadoutTab, string> = { hud: 'HUD Layout', sensitivity: 'Sensitivity', gunsmith: 'Gunsmith', device: 'Device & Graphics' };
const blank = (order: number): LoadoutSchema => ({ tabType: 'hud', title: '', subtitle: '', shareCode: '', specs: [{ label: '', value: '' }], sortOrder: order });

export default function LoadoutsTab({ loadouts, onChanged }: { loadouts: CodmLoadout[]; onChanged: (loadouts: CodmLoadout[]) => void }) {
  const [draft, setDraft] = useState<LoadoutSchema | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [specsText, setSpecsText] = useState('[]');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function edit(item?: CodmLoadout) {
    setError('');
    setEditingId(item?.id ?? null);
    const next = item ? { tabType: item.tabType, title: item.title, subtitle: item.subtitle, shareCode: item.shareCode, specs: item.specs, sortOrder: item.sortOrder } : blank(loadouts.length + 1);
    setDraft(next);
    setSpecsText(JSON.stringify(next.specs, null, 2));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    setError('');
    let specs: unknown;
    try { specs = JSON.parse(specsText); } catch { setError('Specs must be valid JSON, for example [{"label":"Aim","value":"Hold"}].'); return; }
    const parsed = loadoutSchema.safeParse({ ...draft, specs });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Check the loadout details.'); return; }
    setBusy(true);
    try {
      const result = await apiRequest<{ loadout: CodmLoadout }>(editingId ? `/api/admin/loadouts/${editingId}` : '/api/admin/loadouts', { method: editingId ? 'PUT' : 'POST', body: jsonBody(parsed.data) });
      const next = editingId ? loadouts.map((item) => item.id === editingId ? result.loadout : item) : [...loadouts, result.loadout];
      onChanged(next.sort((a, b) => a.sortOrder - b.sortOrder));
      setDraft(null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not save this loadout.'); }
    finally { setBusy(false); }
  }

  async function remove(id: number) {
    if (!window.confirm('Delete this CODM loadout?')) return;
    try { await apiRequest(`/api/admin/loadouts/${id}`, { method: 'DELETE' }); onChanged(loadouts.filter((item) => item.id !== id)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not delete loadout.'); }
  }

  return (
    <div className="admin-resource-tab">
      <div className="admin-resource-toolbar"><div className="admin-resource-summary"><span className="admin-resource-icon"><SlidersHorizontal size={17} /></span><div><strong>{loadouts.length} setup cards</strong><small>Settings, weapon builds, share codes, and gear.</small></div></div><button className="button button-primary button-small" type="button" onClick={() => edit()}><Plus size={15} /> ADD LOADOUT</button></div>
      {error && <div className="admin-alert admin-alert-error" role="alert">{error}</div>}
      {draft && <form className="admin-card admin-resource-editor" onSubmit={save}>
        <div className="admin-card-heading"><span className="admin-card-icon"><Edit3 size={16} /></span><div><h2>{editingId ? 'Edit setup card' : 'New setup card'}</h2><p>Use valid JSON for labels and values rendered in the setup hub.</p></div><button className="admin-close-editor" type="button" onClick={() => setDraft(null)} aria-label="Close editor"><X size={18} /></button></div>
        <div className="admin-form-grid">
          <label className="admin-field"><span>SETUP TAB</span><select value={draft.tabType} onChange={(event) => setDraft({ ...draft, tabType: event.target.value as LoadoutTab })}>{Object.entries(tabLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="admin-field"><span>TITLE</span><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} maxLength={100} /></label>
          <label className="admin-field"><span>SUBTITLE</span><input value={draft.subtitle} onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })} maxLength={180} /></label>
          <label className="admin-field"><span>SHARE CODE (OPTIONAL)</span><input value={draft.shareCode} onChange={(event) => setDraft({ ...draft, shareCode: event.target.value })} maxLength={160} /></label>
          <label className="admin-field"><span>SORT ORDER</span><input type="number" value={draft.sortOrder} onChange={(event) => setDraft({ ...draft, sortOrder: Number(event.target.value) })} /></label>
          <label className="admin-field admin-field-wide"><span>DETAIL SPECS (JSON ARRAY)</span><textarea className="admin-code-textarea" rows={8} value={specsText} onChange={(event) => setSpecsText(event.target.value)} spellCheck={false} /></label>
        </div>
        <div className="admin-editor-actions"><button type="button" className="admin-quiet-button" onClick={() => setDraft(null)}>CANCEL</button><button className="button button-primary button-small" type="submit" disabled={busy}>{busy ? 'SAVING…' : <>SAVE LOADOUT <Save size={14} /></>}</button></div>
      </form>}
      <div className="admin-loadout-grid">
        {loadouts.length === 0 && <div className="admin-empty-state">No setup cards yet. Add a HUD, sensitivity profile, gunsmith build, or device note.</div>}
        {[...loadouts].sort((a, b) => a.sortOrder - b.sortOrder).map((item) => <article className="admin-loadout-row" key={item.id}><span className="loadout-type-tag hud-mono">{tabLabels[item.tabType].toUpperCase()}</span><div className="admin-loadout-copy"><strong>{item.title}</strong><small>{item.subtitle}</small>{item.shareCode && <code><Copy size={12} /> {item.shareCode}</code>}</div><span className="admin-spec-count hud-mono">{item.specs.length} SPECS</span><div className="admin-row-actions"><button type="button" aria-label={`Edit ${item.title}`} onClick={() => edit(item)}><Edit3 size={15} /></button><button type="button" aria-label={`Delete ${item.title}`} onClick={() => remove(item.id)}><Trash2 size={15} /></button></div></article>)}
      </div>
    </div>
  );
}
