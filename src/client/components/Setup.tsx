import { useEffect, useMemo, useState } from 'react';
import { Activity, Check, Copy, Crosshair, Gamepad2, Smartphone, Target, Wifi } from 'lucide-react';
import type { CodmLoadout, LoadoutTab } from '../../shared/types';

type SetupTab = { id: LoadoutTab; label: string; eyebrow: string; icon: typeof Crosshair };
const tabs: SetupTab[] = [
  { id: 'hud', label: 'HUD LAYOUT', eyebrow: '01 / CONTROL', icon: Crosshair },
  { id: 'sensitivity', label: 'SENSITIVITY', eyebrow: '02 / AIM', icon: Target },
  { id: 'gunsmith', label: 'GUNSMITH', eyebrow: '03 / BUILD', icon: Gamepad2 },
  { id: 'device', label: 'DEVICE', eyebrow: '04 / RIG', icon: Smartphone },
];

async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
  const field = document.createElement('textarea');
  field.value = value;
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  document.execCommand('copy');
  field.remove();
}

function CodeCopy({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return <button className={`copy-code ${copied ? 'is-copied' : ''}`} type="button" onClick={async () => {
    try { await copyToClipboard(value); setCopied(true); } catch { setCopied(false); }
  }} aria-label={`Copy ${label}`}>
    <span className="copy-code-label hud-mono">{label}</span><code>{value}</code><span className="copy-action">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'COPIED' : 'COPY'}</span>
  </button>;
}

function SpecList({ specs }: { specs: CodmLoadout['specs'] }) {
  return <dl className="spec-list">{specs.map((spec) => <div key={`${spec.label}-${spec.value}`}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>;
}

function LoadoutCard({ item, gold = false }: { item: CodmLoadout; gold?: boolean }) {
  return (
    <article className={`loadout-card ${gold ? 'loadout-card-gold' : ''}`}>
      <div className="loadout-card-head"><div><span className={`weapon-tag hud-mono ${gold ? 'weapon-tag-gold' : ''}`}>{gold ? 'LEGENDARY / KRM-262' : item.tabType === 'gunsmith' ? 'S&D / PRECISION' : 'LOADOUT / ACTIVE'}</span><h3>{item.title}</h3><p>{item.subtitle}</p></div><span className="loadout-card-mark"><Target size={19} /></span></div>
      <SpecList specs={item.specs} />
      {item.shareCode && <CodeCopy value={item.shareCode} label="SHARE CODE" />}
    </article>
  );
}

export default function Setup({ loadouts, demoMode }: { loadouts: CodmLoadout[]; demoMode: boolean }) {
  const [tab, setTab] = useState<LoadoutTab>('hud');
  const [copied, setCopied] = useState(false);
  const current = useMemo(() => loadouts.filter((item) => item.tabType === tab).sort((a, b) => a.sortOrder - b.sortOrder), [loadouts, tab]);

  return (
    <section className="section-block setup-section" id="setup">
      <div className="page-width">
        <div className="section-heading setup-heading">
          <div><p className="section-kicker hud-mono"><span className="kicker-signal" /> FIELD NOTES / CODM</p><h2>Every edge.<br /><em>Dialed in.</em></h2></div>
          <div className="section-heading-side"><p>For the “what settings do you use?” crew. Share codes and loadout notes, straight from the field file.</p><div className="setup-coord hud-mono"><span>HUD / SENS / BUILDS</span><b>01—04</b></div></div>
        </div>
        <div className="setup-console">
          <div className="setup-console-top"><div className="console-label hud-mono"><span className="console-live" /> PLAYER CONFIGURATION</div><span className="console-device hud-mono">CODM // GLOBAL <i /> UPDATED ON STREAM</span></div>
          <div className="setup-tabs" role="tablist" aria-label="CODM setup categories">
            {tabs.map(({ id, label, eyebrow, icon: Icon }) => <button type="button" key={id} role="tab" aria-selected={tab === id} className={`setup-tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}><Icon size={17} /><span><small className="hud-mono">{eyebrow}</small><strong>{label}</strong></span><span className="tab-arrow">↗</span></button>)}
          </div>
          <div className="setup-content" role="tabpanel">
            {tab === 'hud' && <div className="hud-layout-grid"><div className="layout-art"><div className="phone-outline"><div className="phone-screen"><span className="hud-button hud-joystick" /><span className="hud-button hud-fire" /><span className="hud-button hud-scope" /><span className="hud-button hud-jump" /><span className="hud-screen-lines" /><span className="phone-notch" /></div></div><span className="layout-art-caption hud-mono">4-FINGER CLAW / TOUCH MAP</span></div><div className="layout-detail">{current[0] ? <><span className="detail-eyebrow hud-mono">TACTICAL HUD // 4-FINGER</span><h3>{current[0].title}</h3><p>{current[0].subtitle}. Built for quick peeks, fast scope resets, and clean movement through tight lanes.</p><SpecList specs={current[0].specs} /><CodeCopy value={current[0].shareCode} label="HUD SHARE CODE" /></> : <p>No HUD loadout configured.</p>}</div></div>}
            {tab === 'sensitivity' && <div className="sensitivity-grid">{current[0] ? <><div className="sensitivity-intro"><span className="detail-eyebrow hud-mono"><Activity size={14} /> AIM PROFILE / STANDARD</span><h3>{current[0].title}</h3><p>{current[0].subtitle}. A responsive baseline for tracking in close range and holding a steady sniper line.</p><div className="sensitivity-meter"><span>HIP FIRE</span><i><b style={{ width: '76%' }} /></i><strong>76</strong></div><div className="sensitivity-meter"><span>ADS</span><i><b style={{ width: '62%' }} /></i><strong>62</strong></div><div className="sensitivity-meter"><span>SNIPER</span><i><b style={{ width: '48%' }} /></i><strong>48</strong></div></div><div className="sensitivity-spec"><SpecList specs={current[0].specs} /><div className="gyro-state"><Wifi size={17} /><div><span className="hud-mono">GYROSCOPE</span><strong>{current[0].specs.find((spec) => spec.label.toLowerCase().includes('gyro'))?.value ?? 'As configured'}</strong></div><span className="state-dot" /></div><CodeCopy value={current[0].shareCode} label="SENSITIVITY CODE" /></div></> : <p>No sensitivity profile configured.</p>}</div>}
            {tab === 'gunsmith' && <div className="gunsmith-grid">{current.map((item, index) => <LoadoutCard key={item.id} item={item} gold={item.title.toLowerCase().includes('krm')} />)}{current.length === 0 && <p>No gunsmith builds configured.</p>}</div>}
            {tab === 'device' && <div className="device-grid">{current.map((item) => <article className="device-card" key={item.id}><div className="device-hero"><div className="device-glow" /><Smartphone size={44} strokeWidth={1.15} /><span className="device-live-dot" /></div><div className="device-copy"><span className="detail-eyebrow hud-mono">STREAM / DEVICE</span><h3>{item.title}</h3><p>{item.subtitle}</p><SpecList specs={item.specs} /></div></article>)}{current.length === 0 && <p>No device details configured.</p>}<div className="network-note"><span className="network-icon"><Wifi size={18} /></span><div><strong>Low-latency mindset</strong><p>Settings are examples for preview. Match frame rate and graphics to your device, network, and CODM build.</p></div></div></div>}
          </div>
          <div className="setup-console-bottom"><span className="hud-mono"><span className="bottom-square" /> EXPORT CONFIG / SHARE CODE</span><button type="button" className="console-copy" onClick={async () => {
            const code = current.find((item) => item.shareCode)?.shareCode;
            if (!code) return;
            try { await copyToClipboard(code); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { setCopied(false); }
          }} disabled={!current.some((item) => item.shareCode)}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'COPIED TO CLIPBOARD' : 'COPY ACTIVE CODE'}</button></div>
        </div>
        <p className="setup-disclaimer hud-mono">{demoMode ? 'DEMO DATA // SHARE CODES AND DEVICE DETAILS ARE PLACEHOLDERS UNTIL VERIFIED.' : 'PLAYER CONFIGURATION // CONFIRM GAME VERSION AND DEVICE COMPATIBILITY BEFORE USE.'}</p>
      </div>
    </section>
  );
}
