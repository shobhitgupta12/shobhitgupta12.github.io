import { useState, useEffect } from 'react';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between font-mono text-tiny transition-all duration-700 ease-in-out pointer-events-none
      ${scrolled ? 'py-4 px-5 sm:px-8 md:px-16 lg:px-24' : 'py-6 px-5 sm:px-8 md:py-8 md:px-16 lg:px-24'}
    `}>
      {/* Left: Branding */}
      <div className={`tracking-widest z-10 transition-all duration-700 pointer-events-auto mix-blend-difference text-[11px] sm:text-tiny ${scrolled ? 'opacity-80 scale-90 origin-left' : 'opacity-100 scale-100'}`}>
        SHOBHIT_GUPTA
      </div>

      {/* Middle/Right: Nav Links (Animates on scroll) */}
      <div 
        className="
          flex flex-nowrap whitespace-nowrap transition-all duration-700 ease-in-out pointer-events-auto
          fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 gap-4 text-[10px] px-5 py-3 bg-[#0a0a0a]/90 backdrop-blur-md rounded-full border border-[#27272a] z-[100] text-white shadow-2xl max-w-[calc(100vw-1.5rem)]
          sm:gap-6 sm:text-tiny md:bg-transparent md:backdrop-blur-none md:border-none md:px-0 md:py-0 md:shadow-none md:text-inherit md:bottom-auto md:max-w-none
          md:absolute md:top-1/2 md:gap-5 lg:gap-8 md:origin-right md:mix-blend-difference md:[left:var(--desktop-left)] md:[transform:var(--desktop-transform)]
        "
        style={{
          '--desktop-left': scrolled ? '100%' : '50%',
          '--desktop-transform': scrolled 
            ? 'translate(calc(-100% - max(8rem, 15vw)), -50%) scale(0.85)' 
            : 'translate(-50%, -50%) scale(1)'
        } as React.CSSProperties}
      >
        {['WORK', 'ABOUT', 'EXPLORE', 'LAB'].map(item => (
          <a 
            key={item} 
            href={`#${item.toLowerCase()}`} 
            className="hover:text-accent transition-colors py-1"
          >
            [{item}]
          </a>
        ))}
      </div>

      {/* Right: Status */}
      <div className={`flex items-center gap-2 z-10 transition-all duration-700 pointer-events-auto mix-blend-difference text-[11px] sm:text-tiny ${scrolled ? 'scale-90 origin-right' : 'scale-100'}`} style={{ color: 'var(--online-color)' }}>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--online-color)' }}></div>
        [ONLINE]
      </div>
    </nav>
  );
};

export default Navigation;
