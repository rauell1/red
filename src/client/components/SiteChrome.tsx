import { useState } from 'react';
import { ArrowUpRight, LockKeyhole, Menu, X } from 'lucide-react';
import type { CreatorProfile } from '../../shared/types';

const links = [
  { label: 'Highlights', href: '#highlights' },
  { label: 'CODM Setup', href: '#setup' },
  { label: 'Media Kit', href: '#media-kit' },
  { label: 'Book Red', href: '#booking' },
];

export default function SiteChrome({ profile }: { profile: CreatorProfile }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand-lockup" href="#top" aria-label="Red home" onClick={close}>
          <span className="brand-mark"><i />R</span>
          <span className="brand-divider">//</span>
          <span className="brand-name">RED<span className="brand-dot">.</span></span>
        </a>
        <nav className={`primary-nav ${open ? 'nav-open' : ''}`} aria-label="Main navigation">
          {links.map((item) => <a key={item.href} href={item.href} onClick={close}>{item.label}</a>)}
          <a className="mobile-tiktok" href={profile.tiktokUrl} target="_blank" rel="noreferrer" onClick={close}>TikTok {profile.handle}<ArrowUpRight size={14} /></a>
        </nav>
        <div className="header-actions">
          <a className="header-admin" href="/admin" aria-label="Creator admin"><LockKeyhole size={15} /><span>ADMIN</span></a>
          <a className="tiktok-link" href={profile.tiktokUrl} target="_blank" rel="noreferrer"><span className="tiktok-live-dot" />{profile.handle}<ArrowUpRight size={14} /></a>
        </div>
        <button className="mobile-menu" type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </header>
  );
}
