import { useEffect, useState } from 'react';
import { X, Shield, Cpu, Zap } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 animate__animated animate__fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#000412]/90 backdrop-blur-xl" onClick={closeModal} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-austral-surface border border-austral-border/30 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate__animated animate__zoomIn animate__faster">
        {/* Header Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-austral-primary via-austral-secondary to-austral-pink" />
        
        <button onClick={closeModal} className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/5 text-austral-text-muted hover:text-white hover:bg-white/10 transition-all">
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 h-full max-h-[90vh]">
          {/* Left Side: Visual/Hero */}
          <div className="lg:col-span-5 relative bg-gradient-to-br from-austral-primary/20 via-austral-secondary/10 to-austral-pink/20 p-12 flex flex-col justify-between border-r border-austral-border/20 overflow-hidden min-h-[500px]">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-austral-primary/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-austral-pink/20 rounded-full blur-[100px]" />
            
            <div className="relative">
              <img src="/icon.png" alt="Austral Logo" className="w-48 h-auto mx-auto my-8" />
              
              <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-white mb-6 leading-[1.1] text-center lg:text-left">
                Why <span className="bg-gradient-to-r from-austral-primary to-austral-pink bg-clip-text text-transparent">Austral</span> is a game changer?
              </h2>
              <p className="text-austral-text-muted text-sm leading-relaxed text-center lg:text-left">
                A new era for systems programming where safety and performance are not a trade-off, but a fundamental contract.
              </p>
            </div>
          </div>

          {/* Right Side: Features & Action */}
          <div className="lg:col-span-7 p-8 lg:p-14 overflow-y-auto">
            <div className="space-y-8 mb-12">
              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-austral-primary/10 flex items-center justify-center text-austral-primary border border-austral-primary/20 group-hover:scale-110 transition-transform">
                  <Zap size={22} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-base mb-2">Unprecedented Linearity</h4>
                  <p className="text-austral-text-muted text-sm leading-relaxed">The first practical implementation of linear types that makes memory leaks and use-after-free errors impossible at compile time.</p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-austral-secondary/10 flex items-center justify-center text-austral-secondary border border-austral-secondary/20 group-hover:scale-110 transition-transform">
                  <Shield size={22} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-base mb-2">Capability-Based Security</h4>
                  <p className="text-austral-text-muted text-sm leading-relaxed">Granular control over resources. Security is no longer an afterthought; it's part of the API contract.</p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-austral-pink/10 flex items-center justify-center text-austral-pink border border-austral-pink/20 group-hover:scale-110 transition-transform">
                  <Cpu size={22} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-base mb-2">Pure Modular Discipline</h4>
                  <p className="text-austral-text-muted text-sm leading-relaxed">No circular dependencies, no implicit global state. Clear modules for clear thinking.</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 mb-10 text-[12px] leading-relaxed text-austral-text-muted italic relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-austral-primary/5 to-austral-pink/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              "I am developing a Framework with Linear Events and Tokens in a way that hasn't been done before—I'll share it soon. I'm also building the first packages for my new package manager, <span className="text-austral-primary font-bold">Aurora Austral</span>, and the first IDE extension."
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-8 border-t border-austral-border/20">
              <div className="text-center sm:text-left">
                <p className="text-[10px] uppercase tracking-widest text-austral-text-muted font-bold mb-1 opacity-50">Signed</p>
                <p className="text-white font-mono font-bold tracking-tight text-lg">The Developer</p>
              </div>
              <button 
                onClick={closeModal}
                className="w-full pointer sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-austral-primary to-austral-pink text-white font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(60,216,228,0.2)]"
              >
                Start Exploring
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
