import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, PackageOpen, Rocket, BookOpen, Newspaper, Briefcase, Code2 } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/icon.png" alt="Austral Icon" className="h-10 w-auto transition-transform duration-500 group-hover:rotate-[360deg]" />
              <span className="text-xl font-heading font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Austral
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              

              <Link
                to="/projects"
                className={`flex items-center gap-2 text-sm font-semibold transition-all ${
                  location.pathname.startsWith('/projects')
                    ? 'text-austral-primary'
                    : 'text-austral-text-muted hover:text-white'
                }`}
              >
                <Briefcase size={16} />
                Projects
              </Link>

              <Link
                to="/blog"
                className={`flex items-center gap-2 text-sm font-semibold transition-all ${
                  location.pathname.startsWith('/blog')
                    ? 'text-austral-pink'
                    : 'text-austral-text-muted hover:text-white'
                }`}
              >
                <Newspaper size={16} />
                Blog
              </Link>

              <Link
                to="/docs"
                className={`flex items-center gap-2 text-sm font-semibold transition-all ${
                  location.pathname.startsWith('/docs')
                    ? 'text-austral-primary'
                    : 'text-austral-text-muted hover:text-white'
                }`}
              >
                <BookOpen size={16} />
                Docs
              </Link>

              <Link
                to="/examples"
                className={`flex items-center gap-2 text-sm font-semibold transition-all ${
                  location.pathname.startsWith('/examples')
                    ? 'text-austral-primary'
                    : 'text-austral-text-muted hover:text-white'
                }`}
              >
                <Code2 size={16} />
                Examples
              </Link>

              <div className="w-px h-4 bg-austral-border mx-2" />

              <a
                href="https://aurora.austral.codes"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-austral-primary text-austral-bg text-sm font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(60,216,228,0.2)]"
              >
                <PackageOpen size={16} />
                Aurora
              </a>
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-austral-text-muted hover:text-white transition">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${mobileOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)} />
        <div className={`absolute right-0 top-0 bottom-0 w-80 bg-austral-surface border-l border-austral-border p-6 pt-24 space-y-4 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <Link to="/vault" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 w-full p-4 rounded-2xl bg-white/5 text-white font-bold">
            <PackageOpen size={20} className="text-austral-primary" />
            Vault
          </Link>
          <Link to="/projects" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 w-full p-4 rounded-2xl bg-white/5 text-white font-bold">
            <Briefcase size={20} className="text-austral-primary" />
            Projects
          </Link>
          <Link to="/blog" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 w-full p-4 rounded-2xl bg-white/5 text-white font-bold">
            <Newspaper size={20} className="text-austral-pink" />
            Blog
          </Link>
          <Link to="/docs" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 w-full p-4 rounded-2xl bg-white/5 text-white font-bold">
            <BookOpen size={20} className="text-austral-primary" />
            Documentation
          </Link>
          <Link to="/examples" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 w-full p-4 rounded-2xl bg-white/5 text-white font-bold">
            <Code2 size={20} className="text-austral-primary" />
            Examples
          </Link>

          <div className="pt-4 border-t border-austral-border">
            <a href="https://aurora.austral.codes" target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-4 bg-austral-primary text-austral-bg rounded-2xl font-bold shadow-lg">
              <Rocket size={20} />
              Open Aurora
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
