import { useState, useRef, useEffect } from 'react';
import { useIsTouchDevice } from '../../hooks/useMediaQuery';

const concepts = [
  { id: 'fs', label: 'FULL-STACK DEVELOPMENT', desc: 'Building end-to-end applications — from UI to database.' },
  { id: 'ds', label: 'DATA SCIENCE', desc: 'Extracting insight and building models from real data.' },
  { id: 'ai', label: 'AI INTEGRATION', desc: 'Connecting Gemini API and AI tools into real products.' },
  { id: 'cs', label: 'COMPUTER SCIENCE', desc: 'DSA, OOP, OS, DBMS, and Networks — the foundations.' },
  { id: 'fin', label: 'QUANTITATIVE FINANCE', desc: 'Using Python and data to understand and model markets.' }
];

const About = () => {
  const [hoveredConcept, setHoveredConcept] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardGlowRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouchDevice();

  useEffect(() => {
    const card = cardRef.current;
    const glow = cardGlowRef.current;
    if (!card || !glow) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      glow.style.background = `radial-gradient(350px circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, rgba(96,165,250,0.08), transparent 70%)`;
      glow.style.opacity = '1';
    };
    const onLeave = () => { glow.style.opacity = '0'; };
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    return () => { card.removeEventListener('mousemove', onMove); card.removeEventListener('mouseleave', onLeave); };
  }, []);

  return (
    <section id="about" className="section container border-t">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start">
        
        {/* Left Side: System Narrative */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <h2 className="font-mono text-tiny text-muted mb-8 md:mb-12">SYSTEMS & PHILOSOPHY</h2>
          
          <p className="font-serif text-heading italic mb-10 md:mb-16" style={{ color: 'var(--text-muted)' }}>
            "I started in <span className="text-white">Civil Engineering</span>.<br/><br/>
            That curiosity pushed me toward <span className="text-white">programming</span>.<br/>
            Programming led me to <span className="text-white">full-stack development</span>.<br/>
            Full-stack opened the door to <span className="text-white">data science and AI</span>.<br/><br/>
            Now I build wherever software, data, and real-world impact meet."
          </p>

          <div className="font-mono text-tiny">
            {concepts.map((concept, idx) => (
              <div 
                key={concept.id}
                className="flex items-start mb-6 group cursor-pointer md:cursor-default"
                onMouseEnter={isTouch ? undefined : () => setHoveredConcept(concept.id)}
                onMouseLeave={isTouch ? undefined : () => setHoveredConcept(null)}
                onClick={() => setHoveredConcept(prev => prev === concept.id ? null : concept.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setHoveredConcept(prev => prev === concept.id ? null : concept.id);
                  }
                }}
                aria-expanded={hoveredConcept === concept.id}
              >
                <div className="flex flex-col items-center mr-6 mt-1">
                  <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${hoveredConcept === concept.id ? 'bg-accent' : 'bg-[#27272a]'}`}></div>
                  {idx !== concepts.length - 1 && (
                    <div className="w-[1px] h-12 bg-[#27272a] mt-2 group-hover:bg-accent/30 transition-colors"></div>
                  )}
                </div>
                <div>
                  <div className={`transition-colors duration-300 ${hoveredConcept === concept.id ? 'text-white' : 'text-dim'}`}>
                    {concept.label}
                  </div>
                  <div className={`text-muted transition-opacity duration-300 ${hoveredConcept === concept.id ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                    {concept.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Education & Foundation — proximity gradient card */}
        <div ref={cardRef} className="lg:col-span-5 bg-[#0a0a0a] border border-[#27272a] p-6 md:p-8 relative overflow-hidden group">
          <div ref={cardGlowRef} className="proximity-glow" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-[0.03] blur-[80px] rounded-full group-hover:opacity-[0.12] transition-opacity duration-700"></div>
          
          <h2 className="font-mono text-tiny text-muted mb-8 border-b border-[#27272a] pb-4">FOUNDATION</h2>
          
          <div className="mb-12">
            <h3 className="font-sans text-small text-white mb-2">Punjab Engineering College</h3>
            <div className="font-code text-tiny mb-1" style={{ color: 'var(--text-dim)' }}>B.Tech Civil Engineering • 2024–2028</div>
            <div className="font-code text-tiny" style={{ color: 'var(--tag-color)' }}>Minor: Computer Science (AI)</div>
          </div>

          <div>
            <h3 className="font-sans text-small text-white mb-4">CS Minor Curriculum</h3>
            <ul className="font-code text-tiny flex flex-col gap-3" style={{ color: 'var(--text-muted)' }}>
              <li className="flex justify-between border-b border-[#27272a] pb-2">
                <span>Data Structures & Algorithms</span>
              </li>
              <li className="flex justify-between border-b border-[#27272a] pb-2">
                <span>Object-Oriented Programming</span>
              </li>
              <li className="flex justify-between border-b border-[#27272a] pb-2">
                <span>Database Management Systems</span>
              </li>
              <li className="flex justify-between border-b border-[#27272a] pb-2">
                <span>Operating Systems</span>
              </li>
              <li className="flex justify-between border-b border-[#27272a] pb-2">
                <span>Artificial Intelligence</span>
              </li>
            </ul>
          </div>

          <div className="mt-12 pt-8 border-t border-[#27272a]">
            <h3 className="font-sans text-small text-white mb-4">Certifications</h3>
            <div className="font-code text-tiny mb-2" style={{ color: 'var(--text-dim)' }}>NPTEL/SWAYAM — Software Engineering (12 weeks)</div>
            <div className="font-code text-tiny mb-4" style={{ color: 'var(--text-dim)' }}>Sabudh Foundation — Data Science Internship, Batch 17</div>
            <div className="inline-block border px-2 py-1 font-code text-[10px]" style={{ borderColor: 'var(--online-color)', color: 'var(--online-color)' }}>
              SELECTED — BATCH 17
            </div>
          </div>
        </div>

        <div 
          className="col-span-1 md:col-span-4 mt-8 flex justify-end cursor-help relative group/marauder h-8"
          onMouseEnter={() => {
            if (!window.sessionStorage.getItem('egg_marauder')) {
              window.dispatchEvent(new CustomEvent('easter-egg-found', { detail: { name: "Marauder's Map Egg" } }));
              window.sessionStorage.setItem('egg_marauder', 'true');
            }
          }}
        >
          <span className="font-serif text-[10px] italic opacity-0 group-hover/marauder:opacity-20 transition-opacity duration-1000 select-none pointer-events-none">
            "I solemnly swear that I am up to no good."
          </span>
        </div>

      </div>
    </section>
  );
};

export default About;
