import { useState, useEffect } from 'react';
import { profile } from '../data/profile';

const NAV_LINKS = ['WORK', 'ABOUT', 'EXPLORE', 'LAB'];

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;

    const handleScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 24);
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav
      aria-label="Primary"
      className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between font-mono text-tiny pointer-events-none px-5 sm:px-8 md:px-16 lg:px-24 transition-all duration-500 ease-in-out
        ${scrolled ? 'py-3' : 'py-5 md:py-6'}
        md:bg-[#070707]/85 md:backdrop-blur-xl md:border-b md:border-[#27272a]
        ${scrolled ? 'md:shadow-[0_12px_32px_rgba(0,0,0,0.45)]' : ''}
      `}
    >
      {/* Left: Branding */}
      <a
        href="#hero"
        className={`relative z-10 tracking-widest text-white text-[11px] sm:text-tiny pointer-events-auto transition-opacity duration-500 hover:text-accent ${
          scrolled ? 'opacity-80' : 'opacity-100'
        }`}
      >
        SHOBHIT_GUPTA
      </a>

      {/* Nav links — floating pill on mobile, centred inline links on desktop */}
      <div
        className={`
          flex flex-nowrap items-center whitespace-nowrap transition-all duration-500 pointer-events-auto
          fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 gap-4 text-[10px] px-5 py-3 bg-[#0a0a0a]/90 backdrop-blur-md rounded-full border border-[#27272a] z-[100] text-white shadow-2xl max-w-[calc(100vw-1.5rem)]
          sm:gap-6 sm:text-tiny
          md:absolute md:top-1/2 md:-translate-y-1/2 md:z-auto
          md:gap-6 lg:gap-8 md:px-0 md:py-0 md:bg-transparent md:backdrop-blur-none md:border-0 md:rounded-none md:shadow-none md:max-w-none
          ${scrolled ? 'md:scale-90 md:left-[85%]' : 'md:left-[53%] md:-translate-x-1/2'}
        `}
      >
        {NAV_LINKS.map(item => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="py-1 text-white/80 hover:text-accent transition-colors"
          >
            [{item}]
          </a>
        ))}
        <a
          href={profile.resume}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open resume (Google Docs)"
          className="hidden lg:inline py-1 text-white/80 hover:text-accent transition-colors"
        >
          [RESUME ↗]
        </a>
      </div>

      {/* Right: Status */}
      <div
        className={`relative z-10 flex items-center gap-2 text-[11px] sm:text-tiny pointer-events-auto transition-opacity duration-500 ${
          scrolled ? 'opacity-90' : 'opacity-100'
        }`}
        style={{ color: 'var(--online-color)' }}
      >
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--online-color)' }} />
        [ONLINE]
      </div>
    </nav>
  );
};

export default Navigation;
