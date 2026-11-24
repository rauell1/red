import { useMemo, useState } from 'react';
import { ArrowUpRight, Check, Mail, MessageSquareText, Search, SlidersHorizontal } from 'lucide-react';
import type { InquiryStatus, SponsorInquiry } from '../../../shared/types';
import { apiRequest, jsonBody } from '../../lib/api';

const statuses: InquiryStatus[] = ['new', 'contacted', 'booked', 'archived'];

export default function InquiriesTab({ inquiries, onChanged }: { inquiries: SponsorInquiry[]; onChanged: (inquiries: SponsorInquiry[]) => void }) {
  const [filter, setFilter] = useState<'all' | InquiryStatus>('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const visible = useMemo(() => [...inquiries]
    .filter((item) => filter === 'all' || item.status === filter)
    .filter((item) => `${item.brandName} ${item.contactName} ${item.campaignType}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [filter, inquiries, search]);

  async function updateStatus(inquiry: SponsorInquiry, status: InquiryStatus) {
    setBusyId(inquiry.id);
    setError('');
    try {
      const result = await apiRequest<{ inquiry: SponsorInquiry }>(`/api/admin/inquiries/${inquiry.id}`, { method: 'PATCH', body: jsonBody({ status }) });
      onChanged(inquiries.map((item) => item.id === inquiry.id ? result.inquiry : item));
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not update inquiry.'); }
    finally { setBusyId(null); }
  }

  return (
    <div className="admin-resource-tab">
      <div className="admin-inbox-toolbar"><div className="admin-resource-summary"><span className="admin-resource-icon"><MessageSquareText size={17} /></span><div><strong>{inquiries.length} sponsor inquiries</strong><small>{inquiries.filter((item) => item.status === 'new').length} need a first response</small></div></div><label className="admin-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search brand or campaign" /></label></div>
      <div className="inbox-filters"><SlidersHorizontal size={14} /><span className="hud-mono">FILTER</span>{(['all', ...statuses] as const).map((status) => <button type="button" key={status} className={filter === status ? 'active' : ''} onClick={() => setFilter(status)}>{status === 'all' ? 'All' : `${status.charAt(0).toUpperCase()}${status.slice(1)}`}{status === 'new' && <i>{inquiries.filter((item) => item.status === 'new').length}</i>}</button>)}</div>
      {error && <div className="admin-alert admin-alert-error" role="alert">{error}</div>}
      <div className="inquiry-list">
        {visible.length === 0 ? <div className="admin-empty-state">{inquiries.length ? 'No inquiries match this filter.' : 'The inbox is clear. New sponsor briefs will show here.'}</div> : visible.map((item) => <article className={`inquiry-card status-${item.status}`} key={item.id}>
          <div className="inquiry-card-head"><div className="inquiry-brand-mark">{item.brandName.charAt(0).toUpperCase()}</div><div className="inquiry-brand-copy"><strong>{item.brandName}</strong><small>{item.contactName} <i /> {formatDate(item.createdAt)}</small></div><span className={`inquiry-status status-pill-${item.status}`}><i />{item.status}</span></div>
          <div className="inquiry-details-grid"><div><span className="hud-mono">CAMPAIGN</span><strong>{item.campaignType}</strong></div><div><span className="hud-mono">BUDGET RANGE</span><strong>{item.budgetRange}</strong></div><div><span className="hud-mono">CONTACT</span><strong>{item.contactInfo}</strong></div></div>
          <div className="inquiry-message"><span className="hud-mono">BRIEF</span><p>{item.message}</p></div>
          <div className="inquiry-card-actions"><a href={item.contactInfo.includes('@') ? `mailto:${item.contactInfo}` : `https://wa.me/${item.contactInfo.replace(/\D/g, '')}`} target={item.contactInfo.includes('@') ? undefined : '_blank'} rel="noreferrer"><Mail size={14} /> REPLY DIRECT <ArrowUpRight size={13} /></a><div className="inquiry-status-actions"><span className="hud-mono">UPDATE STATUS</span><select aria-label={`Update status for ${item.brandName}`} value={item.status} disabled={busyId === item.id} onChange={(event) => updateStatus(item, event.target.value as InquiryStatus)}>{statuses.map((status) => <option value={status} key={status}>{status}</option>)}</select>{busyId === item.id && <span className="inquiry-saving"><Check size={13} /></span>}</div></div>
        </article>)}
      </div>
    </div>
  );
}

function formatDate(value: string | Date): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}
