import { ArrowUpRight, Crosshair, LockKeyhole } from 'lucide-react';
import type { CreatorProfile } from '../../shared/types';

export default function Footer({ profile, demoMode }: { profile: CreatorProfile; demoMode: boolean }) {
  return (
    <footer className="site-footer">
      <div className="footer-main page-width">
        <div className="footer-brand"><a className="brand-lockup" href="#top"><span className="brand-mark"><i />R</span><span className="brand-divider">//</span><span className="brand-name">RED<span className="brand-dot">.</span></span></a><p>Mobile FPS. Main-character energy.<br />Built from Nairobi, KE.</p></div>
        <div className="footer-links"><span className="hud-mono">NAVIGATE</span><a href="#highlights">Highlights <ArrowUpRight size={13} /></a><a href="#setup">CODM Setup <ArrowUpRight size={13} /></a><a href="#media-kit">Media Kit <ArrowUpRight size={13} /></a><a href="#booking">Book Red <ArrowUpRight size={13} /></a></div>
        <div className="footer-social"><span className="hud-mono">FOLLOW THE DROP</span><a href={profile.tiktokUrl} target="_blank" rel="noreferrer">TIKTOK {profile.handle} <ArrowUpRight size={14} /></a><a href={`mailto:${profile.email}`}>EMAIL THE TEAM <ArrowUpRight size={14} /></a></div>
        <a className="footer-admin" href="/admin"><LockKeyhole size={14} /><span>CREATOR ADMIN</span></a>
      </div>
      <div className="footer-bottom page-width"><span className="footer-copy hud-mono"><Crosshair size={13} /> © {new Date().getFullYear()} RED // NYEKUNDUUU</span><p>{demoMode ? 'Preview mode: sample stats, package rates, settings, sponsor proof, share codes, and contacts are illustrative. Verify before publishing.' : 'CODM is a trademark of Activision. This creator portfolio is independently operated.'}</p><a href="#top" className="back-to-top hud-mono">BACK TO TOP ↑</a></div>
    </footer>
  );
}
