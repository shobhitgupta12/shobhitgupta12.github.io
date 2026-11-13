import { projects, archiveProjects } from '../data/projects';
import ScribbleBoard from './ScribbleBoard';

const SideQuests = () => {
  const allExtra = [
    ...archiveProjects,
    ...projects.filter(p => p.type === 'experiment'),
  ];

  return (
    <section id="lab" className="section container border-t">
      <h2 className="font-mono text-tiny text-muted mb-10 md:mb-16">LAB / SIDE QUESTS / PLAYGROUND</h2>

      {/* INTERNSHIP WORK — SOARAWAY */}
      <div className="mb-16 md:mb-32 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-5">
          <div className="font-mono text-tiny text-accent mb-4 border border-accent inline-block px-2 py-1">◌ SHIPPED</div>
          <h3 className="text-heading mb-4 font-sans">Soaraway Admin Panel</h3>
          <p className="font-serif text-muted mb-8 italic">"Real clients. Real deadlines. Real feedback."</p>
          <div className="font-sans text-small mb-8" style={{ color: 'var(--text-dim)' }}>
            Built during my 6-month web development internship at Ervon Technology. An administrative dashboard with authentication, frontend UI, and backend integration — my first professional production project.
          </div>
          <div className="inline-block border border-[#27272a] px-4 py-2 font-mono text-tiny" style={{ color: 'var(--text-dim)' }}>
            [ PRIVATE REPOSITORY — INTERNSHIP PROJECT ]
          </div>
        </div>
        <div className="md:col-span-7 md:col-start-6">
          <div className="border border-[#27272a] bg-[#0a0a0a] p-5 md:p-8 font-mono text-tiny flex flex-col gap-4">
            <div className="flex justify-between gap-4 flex-wrap border-b border-[#27272a] pb-3">
              <span style={{ color: 'var(--text-dim)' }}>Stack</span>
              <span className="text-right break-words">React.js · Node.js · Express · MongoDB · JWT</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#27272a] pb-3">
              <span style={{ color: 'var(--text-dim)' }}>Type</span>
              <span>Admin Dashboard</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#27272a] pb-3">
              <span style={{ color: 'var(--text-dim)' }}>Organization</span>
              <span>Ervon Technology</span>
            </div>
            <div className="flex justify-between gap-4">
              <span style={{ color: 'var(--text-dim)' }}>Duration</span>
              <span style={{ color: 'var(--online-color)' }}>6 months</span>
            </div>
          </div>
        </div>
      </div>

      {/* ARCHIVE / EXPERIMENTS GRID */}
      <div className="mb-16 md:mb-32">
        <h3 className="font-mono text-small mb-8">MORE PROJECTS</h3>
        <div className="flex flex-col gap-2 border-t border-[#27272a] pt-4">
          {allExtra.map(p => p && (
            <div key={p.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 p-4 hover:bg-[#111] border-b border-[#27272a] transition-colors items-center">
              <div className="font-sans text-small">{p.title}</div>
              <div className="font-serif text-small text-dim md:col-span-2 line-clamp-2 md:truncate">{p.description}</div>
              <div className="flex justify-between items-center">
                <div className="font-mono text-tiny text-accent opacity-80">{p.maturity}</div>
                {p.githubUrl && p.githubUrl !== 'https://github.com/shobhitgupta12' ? (
                  <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-dim hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                  </a>
                ) : (
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-dim)', opacity: 0.5 }}>PRIVATE</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SCRIBBLE BOARD */}
      <div className="mb-16 md:mb-32">
        <ScribbleBoard />
      </div>

    </section>
  );
};

export default SideQuests;
