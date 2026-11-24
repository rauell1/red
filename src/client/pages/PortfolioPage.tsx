import { useEffect, useState } from 'react';
import { demoPortfolio } from '../../shared/demoData';
import type { PortfolioData, SponsorPackage } from '../../shared/types';
import { apiRequest } from '../lib/api';
import SiteChrome from '../components/SiteChrome';
import Hero from '../components/Hero';
import Highlights from '../components/Highlights';
import Setup from '../components/Setup';
import MediaKit from '../components/MediaKit';
import Booking from '../components/Booking';
import Footer from '../components/Footer';

const previewPortfolio: PortfolioData = {
  ...demoPortfolio,
  meta: { storage: 'memory', demoMode: true },
};

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioData>(previewPortfolio);
  const [selectedPackage, setSelectedPackage] = useState<SponsorPackage | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest<PortfolioData>('/api/portfolio')
      .then((data) => {
        if (!active) return;
        setPortfolio(data);
        if (data.meta?.demoMode) {
          console.warn('[RED preview] DATABASE_URL is not configured. Showing sample stats, settings, prices, and contact details; verify them before publishing.');
        }
      })
      .catch((error: unknown) => {
        console.warn('[RED preview] API is unavailable. Showing bundled sample portfolio data.', error);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="site-shell">
      <SiteChrome profile={portfolio.profile} />
      <main>
        <Hero profile={portfolio.profile} />
        <Highlights clips={portfolio.clips} profile={portfolio.profile} />
        <Setup loadouts={portfolio.loadouts} demoMode={portfolio.meta.demoMode} />
        <MediaKit profile={portfolio.profile} clips={portfolio.clips} packages={portfolio.packages} demoMode={portfolio.meta.demoMode} onSelectPackage={(item) => setSelectedPackage(item)} />
        <Booking profile={portfolio.profile} selectedPackage={selectedPackage} onClearPackage={() => setSelectedPackage(null)} />
      </main>
      <Footer profile={portfolio.profile} demoMode={portfolio.meta.demoMode} />
    </div>
  );
}
