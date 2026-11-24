import { ArrowDownRight, ArrowUpRight, BadgeCheck, ChartNoAxesCombined, Check, Radio, Users, Video } from 'lucide-react';
import type { CreatorProfile, HighlightClip, SponsorPackage } from '../../shared/types';

export default function MediaKit({ profile, clips, packages, demoMode, onSelectPackage }: { profile: CreatorProfile; clips: HighlightClip[]; packages: SponsorPackage[]; demoMode: boolean; onSelectPackage: (item: SponsorPackage) => void }) {
  const metrics = [
    { label: 'FOLLOWERS', value: profile.followersLabel, caption: 'COMMUNITY SIZE', icon: Users },
    { label: 'AVG. VIEWS', value: profile.avgViewsLabel, caption: 'PER SHORT', icon: Video },
    { label: 'ENGAGEMENT', value: profile.engagementLabel, caption: 'AUDIENCE SIGNAL', icon: ChartNoAxesCombined },
    { label: 'LIVE PEAK', value: profile.livePeakLabel, caption: 'CONCURRENT VIEWERS', icon: Radio },
  ];
  const proofClip = clips.find((clip) => clip.sponsorTag.trim());
  const sponsorName = proofClip?.sponsorTag.replace(/^SPONSOR PROOF\s*\/\/\s*/i, '') || (demoMode ? 'KARIFAST' : 'PARTNER');

  return (
    <section className="section-block media-section" id="media-kit">
      <div className="page-width">
        <div className="section-heading media-heading">
          <div><p className="section-kicker hud-mono"><span className="kicker-signal" /> PARTNERSHIP INTEL / 04</p><h2>Make the moment<br /><em>mean more.</em></h2></div>
          <div className="section-heading-side"><p>Creator-first integrations for mobile gaming, top-up platforms, devices, telecom, and the brands moving the culture.</p><div className="brand-fit-list hud-mono"><span>CP / TOP-UP</span><i /> <span>GAMING GEAR</span><i /> <span>5G / LIVE</span></div></div>
        </div>
        <div className="metrics-grid">
          {metrics.map(({ label, value, caption, icon: Icon }, index) => <div className="metric-card" key={label}><div className="metric-card-top"><span className="hud-mono">0{index + 1} // {label}</span><Icon size={17} /></div><strong>{value}</strong><span className="metric-caption hud-mono">{caption}</span><div className="metric-meter"><i style={{ width: `${[82, 66, 72, 48][index]}%` }} /></div></div>)}
        </div>
        <div className="proof-and-packages">
          <article className="proof-card">
            <div className="proof-card-visual"><div className="proof-graphic"><span className="proof-ring proof-ring-one" /><span className="proof-ring proof-ring-two" /><span className="proof-core">R<span>★</span></span><span className="proof-spark proof-spark-a" /><span className="proof-spark proof-spark-b" /></div><span className="proof-watermark hud-mono">SPOTLIGHT / 001</span></div>
            <div className="proof-card-copy"><div className="proof-topline hud-mono"><BadgeCheck size={15} /> SPONSOR PROOF SPOTLIGHT <span className="gold-tag">GOLD MOMENT</span></div><h3>Bring the chat<br />into the drop.</h3><p>{proofClip?.subtitle || 'A creator-led brand moment, matched to the right game, live format, and audience energy.'}</p><div className="proof-caption"><span className="proof-avatar">{sponsorName.charAt(0)}</span><div><strong>{sponsorName}</strong><small>{demoMode ? 'SPONSOR INTEGRATION EXAMPLE · VERIFY BEFORE PUBLISHING' : 'FEATURED PARTNER MOMENT'}</small></div><ArrowUpRight size={15} /></div></div>
          </article>
          <div className="package-column">
            <div className="package-column-heading"><div><span className="section-kicker hud-mono">DEPLOYMENT OPTIONS</span><h3>Pick your play.</h3></div><span className="package-count hud-mono">{String(packages.length).padStart(2, '0')} PACKAGES</span></div>
            <div className="package-list">
              {packages.map((item, index) => <article className={`package-card ${index === 0 ? 'package-featured' : ''}`} key={item.id}>
                <div className="package-index hud-mono">0{index + 1}</div>
                <div className="package-content"><div className="package-title-line"><h4>{item.name}</h4>{item.highlightBadge && <span className="package-badge">{item.highlightBadge}</span>}</div><p>{item.tagline}</p><ul>{item.deliverables.slice(0, 3).map((deliverable) => <li key={deliverable}><Check size={12} />{deliverable}</li>)}</ul></div>
                <div className="package-action"><span className="package-price hud-mono">{item.priceLabel}</span><button type="button" onClick={() => onSelectPackage(item)}>SELECT PACKAGE <ArrowDownRight size={14} /></button></div>
              </article>)}
              {packages.length === 0 && <div className="empty-packages">Partnership packages will be posted here soon.</div>}
            </div>
          </div>
        </div>
        <div className="media-footnote"><span className="hud-mono"><span className="footnote-dot" /> KPI SNAPSHOT / {demoMode ? 'PREVIEW' : 'LIVE'}</span><p>{demoMode ? 'Metrics and package rates are demo values. Confirm all performance figures, deliverables, and pricing before brand outreach.' : 'Confirm current performance figures, deliverables, and pricing with the creator team before campaign launch.'}</p><a href="#booking">DISCUSS A CUSTOM PLAY <ArrowUpRight size={14} /></a></div>
      </div>
    </section>
  );
}
