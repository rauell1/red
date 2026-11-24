import { useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, ChevronDown, Mail, MessageCircle, Send, ShieldCheck } from 'lucide-react';
import { inquirySchema } from '../../shared/schemas';
import type { CreatorProfile, SponsorPackage } from '../../shared/types';
import { ApiError, apiRequest, jsonBody } from '../lib/api';

type InquiryState = 'idle' | 'sending' | 'success';
type FieldErrors = Record<string, string>;

export default function Booking({ profile, selectedPackage, onClearPackage }: { profile: CreatorProfile; selectedPackage: SponsorPackage | null; onClearPackage: () => void }) {
  const [status, setStatus] = useState<InquiryState>('idle');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [campaignType, setCampaignType] = useState('');

  useEffect(() => {
    if (selectedPackage) setCampaignType(selectedPackage.name);
  }, [selectedPackage]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setErrors({});
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const parsed = inquirySchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const [key, messages] of Object.entries(parsed.error.flatten().fieldErrors)) if (messages?.[0]) fieldErrors[key] = messages[0];
      setErrors(fieldErrors);
      setError('A couple of fields need a second look.');
      return;
    }
    setStatus('sending');
    try {
      await apiRequest('/api/inquiries', { method: 'POST', body: jsonBody(parsed.data) });
      setStatus('success');
      form.reset();
      setCampaignType('');
      onClearPackage();
    } catch (caught) {
      setStatus('idle');
      setError(caught instanceof ApiError ? caught.message : 'Could not send your inquiry. Try the direct contact buttons instead.');
    }
  }

  return (
    <section className="section-block booking-section" id="booking">
      <div className="booking-grid-bg" aria-hidden="true" />
      <div className="page-width booking-layout">
        <div className="booking-intro">
          <p className="section-kicker hud-mono"><span className="kicker-signal" /> SECURE CHANNEL / 05</p>
          <h2>Let's make<br /><em>noise.</em></h2>
          <p className="booking-lede">Tell us what you're building. We’ll find the right moment, format, and fit for your campaign.</p>
          <div className="booking-response"><span className="response-icon"><ShieldCheck size={17} /></span><div><span className="hud-mono">DIRECT TO RED'S TEAM</span><small>Briefs reviewed within 2 business days.</small></div></div>
          <div className="direct-contact"><span className="hud-mono">PREFER A DIRECT LINE?</span><a href={profile.whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={15} /> WHATSAPP <ArrowUpRight size={13} /></a><a href={`mailto:${profile.email}`}><Mail size={15} /> EMAIL <ArrowUpRight size={13} /></a></div>
        </div>
        <div className="booking-form-wrap">
          <div className="form-topline"><span className="hud-mono"><span className="form-live" /> NEW CAMPAIGN BRIEF</span><span className="hud-mono">FORM / 01</span></div>
          {status === 'success' ? <div className="success-panel"><div className="success-check"><Check size={23} /></div><span className="section-kicker hud-mono">TRANSMISSION RECEIVED</span><h3>We’ve got<br />your signal.</h3><p>Thanks for reaching out. Red's team will review the brief and follow up using the contact details you shared.</p><button className="button button-outline" type="button" onClick={() => setStatus('idle')}>SEND ANOTHER BRIEF <Send size={14} /></button></div> : <form className="booking-form" onSubmit={submit} noValidate>
            {selectedPackage && <div className="selected-package"><div><span className="hud-mono">PACKAGE SELECTED</span><strong>{selectedPackage.name}</strong></div><button type="button" aria-label="Clear selected package" onClick={() => { onClearPackage(); setCampaignType(''); }}>×</button></div>}
            <div className="form-row">
              <label className="form-field"><span>BRAND / COMPANY <i>*</i></span><input type="text" name="brandName" autoComplete="organization" placeholder="Your brand name" maxLength={120} required aria-invalid={Boolean(errors.brandName)} />{errors.brandName && <small className="field-error">{errors.brandName}</small>}</label>
              <label className="form-field"><span>CONTACT PERSON <i>*</i></span><input type="text" name="contactName" autoComplete="name" placeholder="Your name" maxLength={120} required aria-invalid={Boolean(errors.contactName)} />{errors.contactName && <small className="field-error">{errors.contactName}</small>}</label>
            </div>
            <label className="form-field"><span>EMAIL OR WHATSAPP <i>*</i></span><input type="text" name="contactInfo" autoComplete="email" placeholder="name@company.com or +254…" maxLength={180} required aria-invalid={Boolean(errors.contactInfo)} />{errors.contactInfo && <small className="field-error">{errors.contactInfo}</small>}</label>
            <div className="form-row">
              <label className="form-field select-field"><span>CAMPAIGN TYPE <i>*</i></span><select name="campaignType" value={campaignType} onChange={(event) => setCampaignType(event.target.value)} required aria-invalid={Boolean(errors.campaignType)}><option value="">Select an activation</option><option>Sponsored Lucky Draw LIVE</option><option>Dedicated Gameplay Reel</option><option>Pinned Stream Overlay Campaign</option><option>Product / Device Review</option><option>Custom Partnership</option></select><ChevronDown size={14} />{errors.campaignType && <small className="field-error">{errors.campaignType}</small>}</label>
              <label className="form-field select-field"><span>BUDGET RANGE <i>*</i></span><select name="budgetRange" defaultValue="" required aria-invalid={Boolean(errors.budgetRange)}><option value="">Select range</option><option>KES 15,000 – 35,000</option><option>KES 35,000 – 75,000</option><option>KES 75,000+</option><option>USD 100 – 250</option><option>USD 250 – 500</option><option>USD 500+</option><option>Open to discussion</option></select><ChevronDown size={14} />{errors.budgetRange && <small className="field-error">{errors.budgetRange}</small>}</label>
            </div>
            <label className="form-field"><span>CAMPAIGN BRIEF <i>*</i></span><textarea name="message" rows={4} placeholder="Campaign goals, timing, must-haves, and anything else we should know…" maxLength={2000} required aria-invalid={Boolean(errors.message)} />{errors.message && <small className="field-error">{errors.message}</small>}</label>
            <div className="form-honeypot" aria-hidden="true"><label>Leave this field empty<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>
            {error && <div className="form-error" role="alert">{error}</div>}
            <div className="form-submit-row"><button className="button button-primary submit-button" type="submit" disabled={status === 'sending'}>{status === 'sending' ? <><span className="button-spinner" /> SENDING BRIEF…</> : <>SEND CAMPAIGN BRIEF <Send size={15} /></>}</button><span className="form-privacy hud-mono"><ShieldCheck size={13} /> PRIVATE / ENCRYPTED IN TRANSIT</span></div>
          </form>}
        </div>
      </div>
    </section>
  );
}
