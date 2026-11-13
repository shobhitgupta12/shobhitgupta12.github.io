import { useRef, useEffect, useState, lazy, Suspense } from 'react';
import { gsap } from 'gsap';
import HeroNetwork from './HeroNetwork';
import { useMediaQuery } from '../../hooks/useMediaQuery';

// Three.js is heavy — load it only on desktop, where the particle panel is shown.
const ParticleCharacter = lazy(() => import('./ParticleCharacter'));

const QUOTE = '"I believe in building systems that work in the real world — not just in notebooks."';

const SKILLS = [
  '[ FULL-STACK DEVELOPMENT ]',
  '[ DATA SCIENCE ]',
  '[ AI & GEMINI API ]',
  '[ DSA & ALGORITHMS ]',
  '[ QUANTITATIVE FINANCE ]',
];

// Typewriter hook
const useTypewriter = (text: string, speed = 28, startDelay = 2600) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    let i = 0;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          if (interval) clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay]);
  return { displayed, done };
};

const Hero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const [introComplete, setIntroComplete] = useState(false);
  const [activeSkill, setActiveSkill] = useState(0);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { displayed, done } = useTypewriter(QUOTE);

  // Hand cursor cycles through skills
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSkill(prev => (prev + 1) % SKILLS.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tl = gsap.timeline({ onComplete: () => setIntroComplete(true) });
    gsap.set('.hero-content, .hero-nav, .hero-scroll, .particle-container, .hero-network', { opacity: 0 });
    gsap.set('.sys-coord', { opacity: 0 });

    tl.to('.sys-coord', { opacity: 1, duration: 0.2, stagger: 0.1, ease: 'power2.inOut' })
      .to('.sys-coord', { opacity: 0.3, duration: 0.3, delay: 0.2 })
      .to('.particle-container', { opacity: 1, duration: 0.5 }, '-=0.2')
      .to('.hero-network', { opacity: 1, duration: 0.5 }, '-=0.2')
      .to('.hero-content', { opacity: 1, duration: 0.5 }, '-=0.1')
      .to('.hero-nav', { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')
      .to('.hero-scroll', { opacity: 1, duration: 0.5 });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section ref={containerRef} id="hero" className="relative w-full min-h-[100svh] md:h-screen md:min-h-0 overflow-hidden bg-[#080808] text-white">

      {/* Intro system coordinates */}
      {!introComplete && (
        <div className="absolute inset-0 pointer-events-none z-50 hidden md:flex items-center justify-center font-code text-[10px] opacity-50" style={{ color: 'var(--accent-color)' }}>
          <div className="absolute top-1/4 left-1/4 sys-coord">[SYS_INIT: 0x4A]</div>
          <div className="absolute top-3/4 right-1/4 sys-coord">[MEM_ALLOC: OK]</div>
          <div className="absolute bottom-1/4 left-1/3 sys-coord">[PARTICLE_ENG: RDY]</div>
        </div>
      )}

      {/* Network Background */}
      <div className="hero-network absolute inset-0 z-0">
        <HeroNetwork />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '5vw 5vw' }}>
      </div>

      {/* Mobile artwork — lightweight CSS orb instead of a WebGL canvas */}
      <div aria-hidden="true" className="md:hidden absolute -bottom-28 -right-20 z-0 h-80 w-80 opacity-60 pointer-events-none">
        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(96,165,250,0.16), rgba(94,234,212,0.06) 45%, transparent 70%)' }} />
        <div className="absolute inset-8 rounded-full border border-[#5eead4]/20 animate-spin" style={{ animationDuration: '26s' }}>
          <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#5eead4]/70" />
          <span className="absolute top-1/2 -right-1 h-1 w-1 rounded-full bg-[#60a5fa]/70" />
        </div>
        <div className="absolute inset-20 rounded-full border border-[#60a5fa]/20 animate-spin" style={{ animationDuration: '18s', animationDirection: 'reverse' }}>
          <span className="absolute top-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white/70" />
        </div>
        <div className="absolute inset-32 rounded-full border border-[#27272a]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-[#5eead4] shadow-[0_0_24px_6px_rgba(94,234,212,0.25)] animate-pulse" />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 w-full min-h-[100svh] md:h-full flex flex-col md:flex-row">

        {/* Left Side: Typography & Identity */}
        <div className="hero-content flex-1 flex flex-col justify-center px-6 pt-24 pb-20 md:px-16 lg:px-24 md:py-0">
          <h1 className="font-sans text-[clamp(2.6rem,12vw,6rem)] md:text-[clamp(3rem,8vw,6rem)] font-bold leading-[0.9] tracking-tighter mb-6 md:mb-8">
            SHOBHIT<br />GUPTA
          </h1>

          {/* Skill list with hand cursor cycling */}
          <div className="font-code text-tiny mb-8 md:mb-10 flex flex-col gap-1.5 md:gap-2">
            {SKILLS.map((skill, i) => (
              <div key={skill} className="flex items-center gap-3 transition-all duration-500"
                   style={{ opacity: i === activeSkill ? 1 : 0.6 }}>
                {/* Hand cursor — only shows on active */}
                <span
                  className="text-base select-none inline-block transition-all duration-300"
                  style={{
                    opacity: i === activeSkill ? 1 : 0,
                    transform: i === activeSkill ? 'translateX(0px)' : 'translateX(-8px)',
                    width: '18px',
                  }}
                >
                  ☞
                </span>
                <span
                  className="transition-all duration-400"
                  style={{
                    color: i === activeSkill ? 'var(--tag-color)' : 'var(--text-muted)',
                    borderBottom: i === activeSkill ? '1px solid rgba(13,148,136,0.55)' : '1px solid transparent',
                    paddingBottom: '1px',
                    letterSpacing: '0.06em',
                  }}
                >
                  {skill}
                </span>
              </div>
            ))}
          </div>

          {/* Typewriter quote */}
          <div className="font-serif text-small md:text-body max-w-md italic" style={{ color: 'var(--text-muted)', minHeight: '4.5rem' }}>
            <span>{displayed}</span>
            {!done && <span className="typing-cursor" />}
          </div>
        </div>

        {/* Right Side: Particle Anime Artwork (desktop only) */}
        {isDesktop && (
          <div className="particle-container flex-1 h-full relative border-l border-[#ffffff0a]">
            <Suspense fallback={null}>
              <ParticleCharacter />
            </Suspense>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-20 font-code text-[10px] flex-col items-center gap-2" style={{ color: 'var(--text-muted)' }}>
        <span>SCROLL TO ENTER</span>
        <div className="w-[1px] h-8" style={{ background: 'linear-gradient(to bottom, var(--text-muted), transparent)' }}></div>
      </div>

    </section>
  );
};

export default Hero;
