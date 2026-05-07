import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SpecContent from './components/SpecContent';
import Blog from './pages/Blog';
import Dashboard from './pages/Dashboard';
import Author from './pages/Author';
import Vault from './pages/Vault';
import PackageDetails from './pages/PackageDetails';
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
  const location = useLocation();

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
  }, [loaded, location.pathname]);

  return (
    <>
      <div className={`loading-screen ${loaded ? 'loaded' : ''}`}>
        <div className="text-center">
          <div className="loader-ring mx-auto mb-4" />
          <p className="text-austral-text-muted text-sm font-mono animate-pulse">Loading Austral...</p>
        </div>
      </div>

      <Navbar activeSection={activeSection} />
      {location.pathname === '/' && <WelcomeModal />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Site Home - Austral Language Documentation */}
          <Route path="/" element={
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 flex gap-8">
              <Sidebar activeSection="intro" onNavigate={(id) => {
                 const el = document.getElementById(id);
                 if (el) el.scrollIntoView({ behavior: 'smooth' });
              }} />
              <SpecContent />
            </main>
          } />
          
          {/* Blog */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/blog/author" element={<Author />} />
          
          {/* Vault */}
          <Route path="/vault" element={<Vault />} />
          <Route path="/vault/:packageName" element={<PackageDetails />} />
          
          {/* Management */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
