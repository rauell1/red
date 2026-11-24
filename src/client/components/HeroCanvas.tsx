import { PerformanceMonitor, Sparkles } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Component, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from 'react';
import TacticalFallback from './TacticalFallback';
import TacticalScene from './TacticalScene';

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, _info: ErrorInfo) { console.warn('[RED] Tactical scene unavailable; showing the lightweight SVG fallback.', error); }
  render() { return this.state.failed ? <TacticalFallback /> : this.props.children; }
}

export default function HeroCanvas() {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(element);
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const active = visible && pageVisible;
  return (
    <div className="hero-canvas-wrap" ref={container} aria-hidden="true">
      <SceneBoundary>
        <Canvas
          dpr={dpr}
          frameloop={active ? 'always' : 'never'}
          camera={{ position: [0, 0, 8.8], fov: 39 }}
          gl={{ alpha: true, antialias: false, powerPreference: 'low-power', stencil: false, depth: true }}
          fallback={<TacticalFallback />}
        >
          <PerformanceMonitor onDecline={() => setDpr([1, 1])} onIncline={() => setDpr([1, 1.5])} flipflops={3}>
            <TacticalScene />
            <Sparkles count={14} scale={[10, 4, 3]} position={[0, 1.8, -1]} size={1.2} speed={0.08} color="#f59e0b" opacity={0.45} />
          </PerformanceMonitor>
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
