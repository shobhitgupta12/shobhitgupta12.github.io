import { useCallback, useEffect, useState } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from './components/Navigation';
import Hero from './components/Hero/Hero';
import QuickFacts from './components/QuickFacts';
import About from './components/About/About';
import CurrentlyBuilding from './components/CurrentlyBuilding/CurrentlyBuilding';
import ExploreWorld from './components/Explore/Explore';
import SelectedWork from './components/Work/SelectedWork';
import SideQuests from './components/SideQuests';
import LeetCode from './components/Algorithms/LeetCode';
import LearningLog from './components/Learning/LearningLog';
import SkillMap from './components/Skills/SkillMap';
import AfterHours from './components/AfterHours/AfterHours';
import Contact from './components/Contact';
import Footer from './components/Footer';
import SectionProgress from './components/SectionProgress';
import { Preloader } from './components/Preloader';
import { EasterEggGuide } from './components/EasterEggGuide';

import { SortingHat } from './components/SortingHat';

// Sections that slide on top of the one before them
const SLIDE_BG = '#0b0b0b';
const SLIDE_STYLE: React.CSSProperties = {
  position: 'relative',
  zIndex: 2,
  background: SLIDE_BG,
  boxShadow: '0 -24px 60px rgba(0,0,0,0.7)',
  borderRadius: '0 0 0 0',
};

function App() {
  const [loading, setLoading] = useState(true);
  const finishLoading = useCallback(() => setLoading(false), []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');

    // Mobile browsers resize the visual viewport when the URL bar collapses.
    // Ignoring those resizes prevents pinned sections from jumping.
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Always open the portfolio at the top instead of a restored offset.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    // Smooth wheel scrolling is desktop-only. Touch devices keep native
    // scrolling (best feel, no jank, no fighting with the address bar).
    const desktopQuery = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)');
    let lenis: Lenis | null = null;
    let rafId = 0;

    const stopLenis = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      lenis?.destroy();
      lenis = null;
    };

    const startLenis = () => {
      stopLenis();
      if (!desktopQuery.matches) return;

      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
      ScrollTrigger.refresh();
    };

    startLenis();
    const onDesktopChange = () => startLenis();
    desktopQuery.addEventListener('change', onDesktopChange);

    // Ambient cursor light — skipped entirely on touch devices.
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let glowFrame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const applyGlow = () => {
      glowFrame = 0;
      document.documentElement.style.setProperty('--mouse-x', `${pointerX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${pointerY}px`);
    };

    const handleMouseMove = (e: MouseEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (!glowFrame) glowFrame = requestAnimationFrame(applyGlow);
    };

    if (finePointer.matches) window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Recalculate pinned sections once fonts and images have settled.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh).catch(() => {});

    // Easter Egg: The Matrix
    console.log("%cWake up, Neo...\n%cThe Matrix has you.\n\n%cLooking for easter eggs? You found the first one.", 
      "color: #10b981; font-size: 16px; font-weight: bold;", 
      "color: #10b981; font-size: 14px;", 
      "color: #52525b; font-size: 10px;"
    );

    return () => {
      stopLenis();
      desktopQuery.removeEventListener('change', onDesktopChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('load', refresh);
      if (glowFrame) cancelAnimationFrame(glowFrame);
    };
  }, []);

  return (
    <>
      {loading && <Preloader onComplete={finishLoading} />}
      <EasterEggGuide />
      
      {/* Global Ambient Cursor Glow - Warm Flashlight effect (desktop only) */}
      <div className="cursor-glow" />
      <div className="grid-overlay"></div>
      <Navigation />
      <SectionProgress />

      <main>
        {/* 01 — HERO: base layer */}
        <Hero />

        {/* 02 — QUICK FACTS: slides on top of hero */}
        <div style={{ ...SLIDE_STYLE, zIndex: 3 }}>
          <QuickFacts />
        </div>

        {/* 03 — ABOUT */}
        <div style={{ ...SLIDE_STYLE, zIndex: 4 }}>
          <About />
        </div>

        {/* 04 — CURRENTLY BUILDING: horizontal scroll, no top shadow to avoid clipping */}
        <div style={{ position: 'relative', zIndex: 5, background: '#0b0b0b' }}>
          <CurrentlyBuilding />
        </div>

        {/* 05 — EXPLORE WORLD: slides on top, high z-index to pop over next section */}
        <div style={{ ...SLIDE_STYLE, zIndex: 20 }}>
          <ExploreWorld />
        </div>

        {/* 06 — SELECTED WORK */}
        <div style={{ ...SLIDE_STYLE, zIndex: 7 }}>
          <SelectedWork />
        </div>

        {/* 07 — SIDE QUESTS */}
        <div style={{ ...SLIDE_STYLE, zIndex: 8 }}>
          <SideQuests />
        </div>

        {/* 08 — ALGORITHMIC PRACTICE */}
        <div style={{ ...SLIDE_STYLE, zIndex: 9 }}>
          <LeetCode />
        </div>

        {/* 09 — LEARNING LOG */}
        <div style={{ ...SLIDE_STYLE, zIndex: 10 }}>
          <LearningLog />
        </div>

        {/* 10 — SKILLS */}
        <div style={{ ...SLIDE_STYLE, zIndex: 11 }}>
          <SkillMap />
        </div>

        {/* 11 — AFTER HOURS */}
        <div style={{ ...SLIDE_STYLE, zIndex: 12 }}>
          <AfterHours />
        </div>

        {/* 12 — CONTACT */}
        <div style={{ ...SLIDE_STYLE, zIndex: 13 }}>
          <Contact />
        </div>

        {/* 13 — SORTING HAT */}
        <div style={{ ...SLIDE_STYLE, zIndex: 14 }}>
          <SortingHat />
        </div>
      </main>

      <Footer />
    </>
  );
}

export default App;
