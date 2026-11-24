import { useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, Clapperboard, Edit3, Plus, Save, Star, Trash2, X } from 'lucide-react';
import { clipSchema, type ClipSchema } from '../../../shared/schemas';
import type { HighlightClip } from '../../../shared/types';
import { apiRequest, jsonBody } from '../../lib/api';

const blankClip = (order: number): ClipSchema => ({ codeLabel: String(order).padStart(2, '0'), title: '', subtitle: '', category: 'SEARCH & DESTROY', mapOrMode: '', videoUrl: '', posterUrl: '', tiktokUrl: '', sponsorTag: '', isFeatured: false, sortOrder: order });

export default function ClipsTab({ clips, onChanged }: { clips: HighlightClip[]; onChanged: (clips: HighlightClip[]) => void }) {
  const [draft, setDraft] = useState<ClipSchema | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function edit(clip?: HighlightClip) {
    setError('');
    setEditingId(clip?.id ?? null);
    setDraft(clip ? {
      codeLabel: clip.codeLabel, title: clip.title, subtitle: clip.subtitle, category: clip.category,
      mapOrMode: clip.mapOrMode, videoUrl: clip.videoUrl, posterUrl: clip.posterUrl, tiktokUrl: clip.tiktokUrl,
      sponsorTag: clip.sponsorTag, isFeatured: clip.isFeatured, sortOrder: clip.sortOrder,
    } : blankClip(clips.length + 1));
  }

  function change(key: keyof ClipSchema, value: string | boolean | number) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    setError('');
    const parsed = clipSchema.safeParse(draft);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Check the clip details.'); return; }
    setBusy(true);
    try {
      const result = await apiRequest<{ clip: HighlightClip }>(editingId ? `/api/admin/clips/${editingId}` : '/api/admin/clips', { method: editingId ? 'PUT' : 'POST', body: jsonBody(parsed.data) });
      const next = editingId ? clips.map((clip) => clip.id === editingId ? result.clip : clip) : [...clips, result.clip];
      onChanged(next.sort((a, b) => a.sortOrder - b.sortOrder));
      setDraft(null);
      setEditingId(null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not save this clip.'); }
    finally { setBusy(false); }
  }

  async function remove(id: number) {
    if (!window.confirm('Delete this highlight clip?')) return;
    setError('');
    try {
      await apiRequest(`/api/admin/clips/${id}`, { method: 'DELETE' });
      onChanged(clips.filter((clip) => clip.id !== id));
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not delete clip.'); }
  }

  return (
    <div className="admin-resource-tab">
      <div className="admin-resource-toolbar"><div className="admin-resource-summary"><span className="admin-resource-icon"><Clapperboard size={17} /></span><div><strong>{clips.length} highlight files</strong><small>Widescreen 16:9 · MP4 / R2 supported</small></div></div><button className="button button-primary button-small" type="button" onClick={() => edit()}><Plus size={15} /> ADD CLIP</button></div>
      {error && <div className="admin-alert admin-alert-error" role="alert">{error}</div>}
      {draft && <form className="admin-card admin-resource-editor" onSubmit={save}>
        <div className="admin-card-heading"><span className="admin-card-icon"><Edit3 size={16} /></span><div><h2>{editingId ? 'Edit highlight' : 'New highlight'}</h2><p>Keep poster art in a landscape 16:9 format.</p></div><button className="admin-close-editor" type="button" onClick={() => setDraft(null)} aria-label="Close editor"><X size={18} /></button></div>
        <div className="admin-form-grid">
          <AdminInput label="CLIP NUMBER" value={draft.codeLabel} onChange={(value) => change('codeLabel', value)} />
          <AdminInput label="TITLE" value={draft.title} onChange={(value) => change('title', value)} />
          <AdminInput label="CATEGORY" value={draft.category} onChange={(value) => change('category', value)} />
          <AdminInput label="MAP / MODE" value={draft.mapOrMode} onChange={(value) => change('mapOrMode', value)} />
          <AdminInput label="POSTER IMAGE URL" value={draft.posterUrl} onChange={(value) => change('posterUrl', value)} />
          <AdminInput label="MP4 / R2 VIDEO URL" value={draft.videoUrl} onChange={(value) => change('videoUrl', value)} />
          <AdminInput label="TIKTOK CLIP URL" value={draft.tiktokUrl} onChange={(value) => change('tiktokUrl', value)} />
          <AdminInput label="SPONSOR TAG (OPTIONAL)" value={draft.sponsorTag} onChange={(value) => change('sponsorTag', value)} />
          <AdminInput label="SORT ORDER" type="number" value={String(draft.sortOrder)} onChange={(value) => change('sortOrder', Number(value))} />
          <label className="admin-field"><span>FEATURED FILE</span><span className="admin-toggle-row"><input type="checkbox" checked={draft.isFeatured} onChange={(event) => change('isFeatured', event.target.checked)} /><b>{draft.isFeatured ? 'Featured in vault' : 'Standard clip'}</b></span></label>
          <label className="admin-field admin-field-wide"><span>HIGHLIGHT BREAKDOWN</span><textarea rows={3} value={draft.subtitle} onChange={(event) => change('subtitle', event.target.value)} maxLength={240} placeholder="What happened in this clip?" /></label>
        </div>
        {error && <div className="admin-alert admin-alert-error" role="alert">{error}</div>}
        <div className="admin-editor-actions"><button type="button" className="admin-quiet-button" onClick={() => setDraft(null)}>CANCEL</button><button className="button button-primary button-small" type="submit" disabled={busy}>{busy ? 'SAVING…' : <>SAVE CLIP <Save size={14} /></>}</button></div>
      </form>}
      <div className="admin-clip-list">
        {clips.length === 0 && <div className="admin-empty-state">No clips yet. Add a clip to publish the first field file.</div>}
        {[...clips].sort((a, b) => a.sortOrder - b.sortOrder).map((clip, index) => <article className="admin-clip-row" key={clip.id}>
          <div className="admin-clip-thumb"><img src={clip.posterUrl || '/posters/clip-01.svg'} alt="" loading="lazy" />{clip.isFeatured && <span><Star size={10} fill="currentColor" /> FEATURED</span>}</div>
          <div className="admin-clip-number hud-mono">{clip.codeLabel}</div><div className="admin-clip-copy"><strong>{clip.title}</strong><p>{clip.category} <i /> {clip.mapOrMode}</p><small>{clip.videoUrl ? 'MP4 READY' : 'POSTER / TIKTOK DOSSIER'}</small></div>
          <div className="admin-order-controls"><button type="button" aria-label="Move clip up" disabled={index === 0} onClick={() => updateOrder(clips, index, -1, onChanged)}><ArrowUp size={14} /></button><button type="button" aria-label="Move clip down" disabled={index === clips.length - 1} onClick={() => updateOrder(clips, index, 1, onChanged)}><ArrowDown size={14} /></button></div>
          <div className="admin-row-actions"><button type="button" aria-label={`Edit ${clip.title}`} onClick={() => edit(clip)}><Edit3 size={15} /></button><button type="button" aria-label={`Delete ${clip.title}`} onClick={() => remove(clip.id)}><Trash2 size={15} /></button></div>
        </article>)}
      </div>
      <p className="admin-help-note">Videos stay unloaded until a viewer opens a clip. Poster thumbnails remain the default until an approved MP4/R2 URL is added.</p>
    </div>
  );
}

function AdminInput({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="admin-field"><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function updateOrder(clips: HighlightClip[], index: number, offset: number, onChanged: (clips: HighlightClip[]) => void) {
  const next = [...clips].sort((a, b) => a.sortOrder - b.sortOrder);
  const swapIndex = index + offset;
  if (swapIndex < 0 || swapIndex >= next.length) return;
  const first = next[index];
  const second = next[swapIndex];
  const temp = first.sortOrder;
  first.sortOrder = second.sortOrder;
  second.sortOrder = temp;
  onChanged([...next].sort((a, b) => a.sortOrder - b.sortOrder));
  // Persist ordering through the same validated update path without blocking the UI.
  for (const clip of [first, second]) {
    const payload = { codeLabel: clip.codeLabel, title: clip.title, subtitle: clip.subtitle, category: clip.category, mapOrMode: clip.mapOrMode, videoUrl: clip.videoUrl, posterUrl: clip.posterUrl, tiktokUrl: clip.tiktokUrl, sponsorTag: clip.sponsorTag, isFeatured: clip.isFeatured, sortOrder: clip.sortOrder };
    void apiRequest(`/api/admin/clips/${clip.id}`, { method: 'PUT', body: jsonBody(payload) }).catch(() => undefined);
  }
}
