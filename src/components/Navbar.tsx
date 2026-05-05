import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { tocData } from '../data/toc';
import { Menu, X, ChevronRight, BookOpen, Code2, Rocket } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
}

export default function Navbar({ activeSection }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionClick = (id: string) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      history.pushState(null, '', `#${id}`);
    }
  };

  const topItems = tocData.filter(i => ['intro', 'goals', 'rationale', 'syntax', 'modules', 'types', 'linear-types'].includes(i.id));

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileOpen
            ? 'bg-austral-bg/90 backdrop-blur-xl border-b border-austral-border shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 group">
              <img src="/logo.png" alt="Austral Icon" className="h-12 w-auto" />
              <span className="font-heading font-bold text-lg tracking-tight text-white group-hover:text-austral-accent transition-colors">
                Austral
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {topItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  className={`nav-link px-3 py-2 text-sm font-medium transition-colors ${
                    activeSection === item.id && location.pathname === '/'
                      ? 'text-austral-accent active'
                      : 'text-austral-text-muted hover:text-white'
                  }`}
                >
                  {item.title}
                </button>
              ))}
              
              <div className="w-px h-4 bg-austral-border mx-2" />
              
              <Link
                to="/examples"
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  location.pathname === '/examples'
                    ? 'bg-austral-accent text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                    : 'bg-austral-surface border border-austral-border text-austral-text-muted hover:border-austral-accent hover:text-white'
                }`}
              >
                <Code2 size={14} />
                Examples
              </Link>

              <Link
                to="/projects"
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  location.pathname === '/projects'
                    ? 'bg-austral-accent text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                    : 'bg-austral-surface border border-austral-border text-austral-text-muted hover:border-austral-accent hover:text-white'
                }`}
              >
                <Rocket size={14} />
                Projects
              </Link>
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-austral-text-muted hover:text-white transition">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${mobileOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)} />
        <div className={`absolute right-0 top-0 bottom-0 w-80 bg-austral-surface border-l border-austral-border p-6 pt-20 overflow-y-auto transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <Link to="/examples" onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-3 mb-3 bg-austral-accent/10 border border-austral-accent/20 rounded-xl text-austral-accent font-bold">
            <Code2 size={18} />
            View Examples
          </Link>

          <Link to="/projects" onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-3 mb-6 bg-austral-accent rounded-xl text-white font-bold shadow-lg shadow-austral-accent/20">
            <Rocket size={18} />
            Explore Projects
          </Link>

          <p className="text-[10px] uppercase tracking-widest text-austral-text-muted mb-4 font-bold">Specification</p>
          {tocData.map(item => (
            <div key={item.id} className="mb-2">
              <button onClick={() => handleSectionClick(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                  activeSection === item.id && location.pathname === '/' ? 'bg-austral-accent/10 text-austral-accent' : 'text-austral-text-muted hover:text-white hover:bg-white/5'
                }`}>
                <ChevronRight size={12} className="inline mr-2 opacity-50" />{item.title}
              </button>
              {item.children?.map(child => (
                <button key={child.id} onClick={() => handleSectionClick(child.id)}
                  className="w-full text-left pl-8 pr-3 py-1.5 text-xs text-austral-text-muted hover:text-austral-accent transition">
                  {child.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
