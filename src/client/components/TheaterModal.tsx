import { useEffect } from 'react';
import { ArrowUpRight, AudioLines, Crosshair, Play, Radio, X } from 'lucide-react';
import type { HighlightClip } from '../../shared/types';

export default function TheaterModal({ clip, onClose }: { clip: HighlightClip; onClose: () => void }) {
  const hasVideo = Boolean(clip.videoUrl?.trim());
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="theater-modal" role="dialog" aria-modal="true" aria-labelledby="theater-title">
        <div className="modal-topline"><span className="hud-mono"><Crosshair size={13} /> CLIP DOSSIER // {clip.codeLabel}</span><button className="icon-button" type="button" aria-label="Close clip" onClick={onClose}><X size={20} /></button></div>
        <div className="theater-frame">
          {hasVideo ? <video controls playsInline preload="none" poster={clip.posterUrl || undefined} src={clip.videoUrl}>Your browser does not support HTML video.</video> : <img src={clip.posterUrl || '/posters/clip-01.svg'} alt={`${clip.title} tactical poster`} />}
          {!hasVideo && <div className="dossier-overlay"><div className="dossier-play"><Play size={18} fill="currentColor" /></div><span className="hud-mono">PREVIEW DOSSIER / VIDEO PENDING</span></div>}
          <div className="theater-frame-code hud-mono">RED // FIELD FILE</div>
        </div>
        <div className="theater-details">
          <div className="theater-main">
            <div className="clip-label-row"><span className="eyebrow hud-mono">{clip.category}</span>{clip.sponsorTag && <span className="sponsor-proof"><i />{clip.sponsorTag}</span>}</div>
            <h2 id="theater-title">{clip.title}</h2>
            <p>{clip.subtitle}</p>
            <div className="theater-tags"><span><Crosshair size={13} /> {clip.mapOrMode}</span><span><AudioLines size={13} /> CODM / MOBILE</span></div>
          </div>
          <div className="theater-aside">
            <span className="hud-mono">{hasVideo ? 'LOCAL / R2 PLAYBACK' : 'TIKTOK FEATURE'}</span>
            <a className="button button-primary button-small" href={clip.tiktokUrl || 'https://www.tiktok.com/@nyekunduuu'} target="_blank" rel="noreferrer">WATCH ON TIKTOK <ArrowUpRight size={15} /></a>
            <p><Radio size={12} /> Follow {clip.tiktokUrl?.includes('@') ? clip.tiktokUrl.split('@').at(-1) : '@nyekunduuu'} for the full drop.</p>
          </div>
        </div>
        {!hasVideo && <div className="modal-preview-note"><span /> Demo preview · add an approved MP4 or R2 URL in <a href="/admin">Creator Admin</a> to enable playback.</div>}
      </section>
    </div>
  );
}
