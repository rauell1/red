import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, Crosshair, Radio } from 'lucide-react';
import type { CreatorProfile } from '../../shared/types';
import TacticalFallback from './TacticalFallback';

const HeroCanvas = lazy(() => import('./HeroCanvas'));

export default function Hero({ profile }: { profile: CreatorProfile }) {
  const heroRef = useRef<HTMLElement>(null);
  const [shouldLoadScene, setShouldLoadScene] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener('change', updateMotion);
    return () => media.removeEventListener('change', updateMotion);
  }, []);

  useEffect(() => {
    const element = heroRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoadScene(true);
        observer.disconnect();
      }
    }, { rootMargin: '100px 0px', threshold: 0.01 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { label: 'FOLLOWERS', value: profile.followersLabel, note: 'COMMUNITY' },
    { label: 'AVG. VIEWS', value: profile.avgViewsLabel, note: 'PER SHORT' },
    { label: 'ENGAGEMENT', value: profile.engagementLabel, note: 'INTERACTIONS' },
    { label: 'PRIMARY MODES', value: profile.primaryModes, note: 'S&D / BR' },
  ];

  return (
    <section className="hero-section" id="top" ref={heroRef}>
      <div className="hero-grid-bg" aria-hidden="true" />
      <div className="hero-art">
        <TacticalFallback />
        {shouldLoadScene && !reducedMotion && <Suspense fallback={null}><HeroCanvas /></Suspense>}
      </div>
      <div className="hero-vignette" aria-hidden="true" />
      <div className="hero-content page-width">
        <div className="hero-copy">
          <div className="live-pill"><span className="live-pulse" /><span>CODM CREATOR</span><i /> <span>TIKTOK LIVE</span><b>{profile.handle}</b></div>
          <p className="hero-kicker hud-mono"><Crosshair size={14} /> <span>PLAYER PROFILE / 001</span><span className="kicker-line" /></p>
          <h1>RED<span className="hero-period">.</span></h1>
          <p className="hero-subtitle">CALL OF DUTY: MOBILE<br /><span>COMPETITOR &amp; LIVE ENTERTAINER</span></p>
          <p className="hero-description">High-pressure rounds. Loud live chat. One creator turning every drop into a story.</p>
          <div className="hero-buttons">
            <a className="button button-primary" href="#highlights">WATCH HIGHLIGHTS <ArrowRight size={16} /></a>
            <a className="button button-outline" href="#booking"><Radio size={15} /> SPONSOR / BOOK RED</a>
          </div>
          <div className="hero-meta hud-mono"><span><span className="meta-tick" /> NAIROBI, KE</span><span>CALLSIGN // RED</span><span>CODM S&D / BR</span></div>
        </div>
        <div className="hero-side-index hud-mono" aria-hidden="true"><span>TACTICAL</span><i /> <span>CREATOR</span><i /> <span>LIVE UNIT</span></div>
      </div>
      <div className="hero-bottom page-width">
        <div className="telemetry-label"><span className="telemetry-mark"><Crosshair size={16} /></span><div><span className="hud-mono">LIVE TELEMETRY</span><small>CREATOR PERFORMANCE</small></div></div>
        <div className="telemetry-stats">
          {stats.map((stat, index) => <div className="telemetry-item" key={stat.label}><span className="telemetry-index hud-mono">0{index + 1}</span><div><small className="hud-mono">{stat.label}</small><strong>{stat.value}</strong><em>{stat.note}</em></div></div>)}
        </div>
        <a className="scroll-cue hud-mono" href="#highlights" aria-label="Scroll to highlights"><span>SCROLL TO ENGAGE</span><ArrowDown size={15} /></a>
      </div>
      <div className="hero-edge-code hud-mono" aria-hidden="true">R // 0x01 — NYEKUNDUUU — CODM</div>
    </section>
  );
}
