import { lazy, Suspense } from 'react';
import PortfolioPage from './pages/PortfolioPage';

const AdminPage = lazy(() => import('./pages/AdminPage'));

function RouteLoading() {
  return <div className="admin-loading"><span className="crosshair-loader"><i /></span><span className="hud-mono">LOADING CONSOLE…</span></div>;
}

export default function App() {
  const isAdmin = window.location.pathname.replace(/\/$/, '') === '/admin';
  return isAdmin
    ? <Suspense fallback={<RouteLoading />}><AdminPage /></Suspense>
    : <PortfolioPage />;
}
