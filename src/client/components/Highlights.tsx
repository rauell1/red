import { useState } from 'react';
import { ArrowUpRight, Crosshair, Play, Radio, ScanLine } from 'lucide-react';
import type { CreatorProfile, HighlightClip } from '../../shared/types';
import TheaterModal from './TheaterModal';

function ClipCard({ clip, featured, onOpen }: { clip: HighlightClip; featured: boolean; onOpen: () => void }) {
  return (
    <button className={`clip-card ${featured ? 'clip-card-featured' : ''}`} type="button" onClick={onOpen} aria-label={`Open ${clip.title} clip dossier`}>
      <div className="clip-poster-wrap">
        <img className="clip-poster" src={clip.posterUrl || '/posters/clip-01.svg'} alt="" loading="lazy" decoding="async" />
        <div className="poster-scan" />
        <div className="clip-top-tags"><span className="clip-code hud-mono">{clip.codeLabel} <i /> {clip.category}</span>{clip.sponsorTag && <span className="clip-sponsor">{clip.sponsorTag}</span>}</div>
        <div className="clip-bottom-meta"><span className="hud-mono">{clip.mapOrMode}</span><span className="clip-open-icon"><Play size={14} fill="currentColor" /></span></div>
        <span className="crosshair-corner corner-tl"><i /></span><span className="crosshair-corner corner-br"><i /></span>
      </div>
      <div className="clip-card-info"><span className="clip-title-row"><strong>{clip.title}</strong><ArrowUpRight size={15} /></span><span>{clip.subtitle}</span></div>
    </button>
  );
}

export default function Highlights({ clips, profile }: { clips: HighlightClip[]; profile: CreatorProfile }) {
  const [activeClip, setActiveClip] = useState<HighlightClip | null>(null);
  const sorted = [...clips].sort((a, b) => a.sortOrder - b.sortOrder);
  const featured = sorted.find((clip) => clip.isFeatured) ?? sorted[0];
  const supporting = sorted.filter((clip) => clip.id !== featured?.id).slice(0, 2);

  return (
    <section className="section-block highlights-section" id="highlights">
      <div className="page-width">
        <div className="section-heading">
          <div><p className="section-kicker hud-mono"><span className="kicker-signal" /> CLIP VAULT / 01—03</p><h2>Moments that<br /><em>hit different.</em></h2></div>
          <div className="section-heading-side"><p>16:9 field files from Search &amp; Destroy, Battle Royale, and the live drops that pull everyone in.</p><div className="vault-status hud-mono"><span /><Radio size={13} /> VAULT OPEN <i />{String(sorted.length).padStart(2, '0')} FILES</div></div>
        </div>
        {featured ? <div className="clips-bento">
          <ClipCard clip={featured} featured onOpen={() => setActiveClip(featured)} />
          <div className="clip-supporting">{supporting.map((clip) => <ClipCard key={clip.id} clip={clip} featured={false} onOpen={() => setActiveClip(clip)} />)}</div>
        </div> : <div className="empty-vault"><ScanLine size={24} /><p>No clips have been published yet.</p></div>}
        <div className="vault-footer"><span className="hud-mono"><Crosshair size={14} /> TAP A FILE TO OPEN THEATER MODE</span><a href={profile.tiktokUrl} target="_blank" rel="noreferrer">MORE ON TIKTOK <ArrowUpRight size={15} /></a></div>
      </div>
      {activeClip && <TheaterModal clip={activeClip} onClose={() => setActiveClip(null)} />}
    </section>
  );
}
