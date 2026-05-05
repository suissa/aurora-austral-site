import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SpecContent from './components/SpecContent';
import Examples from './components/Examples';
import Projects from './components/Projects';
import WelcomeModal from './components/WelcomeModal';
import { tocData } from './data/toc';

function flattenIds(items: typeof tocData): string[] {
  const ids: string[] = [];
  items.forEach(i => { ids.push(i.id); i.children?.forEach(c => ids.push(c.id)); });
  return ids;
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState('intro');

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const ids = flattenIds(tocData);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0.1 }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loaded]);

  const handleNavigate = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      history.pushState(null, '', `#${id}`);
    }
  }, []);

  return (
    <>
      <div className={`loading-screen ${loaded ? 'loaded' : ''}`}>
        <div className="text-center">
          <div className="loader-ring mx-auto mb-4" />
          <p className="text-austral-text-muted text-sm font-mono animate-pulse">Loading portal...</p>
        </div>
      </div>

      <Navbar activeSection={activeSection} />
      <WelcomeModal />
      {children}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 flex gap-8">
              <Sidebar activeSection="intro" onNavigate={(id) => {
                 const el = document.getElementById(id);
                 if (el) el.scrollIntoView({ behavior: 'smooth' });
              }} />
              <SpecContent />
            </main>
          } />
          <Route path="/examples" element={<Examples />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
