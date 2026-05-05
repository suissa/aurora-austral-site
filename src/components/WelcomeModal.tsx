import { useEffect, useState } from 'react';
import { X, Sparkles, Shield, Cpu, Zap, Heart } from 'lucide-react';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('austral_portal_visited');
    if (!hasVisited) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    localStorage.setItem('austral_portal_visited', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate__animated animate__fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={closeModal} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-austral-surface border border-austral-border rounded-3xl shadow-2xl shadow-black overflow-hidden animate__animated animate__zoomIn animate__faster">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-austral-accent via-austral-accent-2 to-austral-accent-3" />
        
        <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-austral-text-muted hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="p-8 sm:p-10">
          <div className="w-16 h-16 rounded-2xl bg-austral-accent/10 flex items-center justify-center text-austral-accent mb-8 mx-auto sm:mx-0">
            <Heart size={32} className="fill-current" />
          </div>

          <h2 className="text-3xl font-heading font-bold text-white mb-6 leading-tight text-center sm:text-left">
            Why did I become a fan of <span className="text-austral-accent">Austral</span> as soon as I met it?
          </h2>

          <div className="space-y-6 mb-10">
            <div className="flex gap-4">
              <div className="mt-1 text-austral-accent"><Zap size={18} /></div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Unprecedented Linearity</h4>
                <p className="text-austral-text-muted text-xs leading-relaxed">It was the first time I encountered this concept, and within a single day I applied it to WhatsApp Sessions, DPoP tokens, and NATS events. Something never done before.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1 text-austral-accent"><Shield size={18} /></div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Capability-Based Security</h4>
                <p className="text-austral-text-muted text-xs leading-relaxed">No more implicit ambient authority. Security is woven into the very fabric of the type system.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1 text-austral-accent"><Cpu size={18} /></div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Pure Modular Discipline</h4>
                <p className="text-austral-text-muted text-xs leading-relaxed">Explicit interfaces, no circular dependencies, and a focus on clarity over cleverness.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-10 text-[11px] leading-relaxed text-austral-text-muted italic">
            "I am developing a Framework with Linear Events and Tokens in a way that hasn't been done before—I'll share it soon. I'm also building the first packages for my new package manager, <span className="text-austral-accent font-bold">Aurora Austral</span>, and the first IDE extension. I intend to contribute to everything on the GitHub Roadmap and serve as the ambassador for Austral in Brazil."
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-austral-border">
            <div className="text-center sm:text-left">
              <p className="text-[10px] uppercase tracking-widest text-austral-text-muted font-bold mb-1">Signed</p>
              <p className="text-white font-mono font-bold tracking-tighter">The Developer</p>
            </div>
            <button 
              onClick={closeModal}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-austral-accent text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-austral-accent/25"
            >
              Start Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
