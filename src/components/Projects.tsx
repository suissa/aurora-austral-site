import { Activity, Key, Calendar, FileText, ArrowUpRight } from 'lucide-react';

const ProjectCard = ({ title, description, icon: Icon, tag }: { title: string; description: string; icon: any; tag?: string }) => (
  <div className="group relative">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-austral-primary to-austral-pink rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-500" />
    <div className="relative bg-austral-surface border border-austral-border rounded-2xl p-8 flex flex-col h-full hover:border-austral-primary/50 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-xl bg-austral-primary/10 flex items-center justify-center text-austral-primary group-hover:scale-110 transition-transform duration-500">
          <Icon size={24} />
        </div>
        {tag && (
          <span className="px-3 py-1 rounded-full bg-austral-primary/10 border border-austral-primary/20 text-[10px] font-bold text-austral-primary uppercase tracking-wider">
            {tag}
          </span>
        )}
      </div>
      
      <h3 className="text-xl font-heading font-bold text-white mb-3 flex items-center gap-2 group-hover:text-austral-primary transition-colors">
        {title}
        <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 -translate-y-1 translate-x-1 transition-all" />
      </h3>
      
      <p className="text-austral-text-muted text-sm leading-relaxed mb-6 flex-grow">
        {description}
      </p>

      <button className="w-full py-2.5 rounded-xl border border-austral-border bg-austral-bg/50 text-xs font-bold text-white hover:bg-austral-primary hover:border-austral-primary transition-all duration-300">
        Explore Project
      </button>
    </div>
  </div>
);

export default function Projects() {
  const projects = [
    {
      title: "Linear Sessions",
      description: "A framework for building stateful, multi-step protocols with formal safety guarantees. Linear sessions ensure that every step of a transaction or communication protocol is completed correctly and exactly once.",
      icon: Activity,
      tag: "Framework"
    },
    {
      title: "Linear Tokens",
      description: "Implementing digital assets and capabilities as linear values. This project explores how to build secure financial systems and access control mechanisms where 'doubling' or 'losing' a value is impossible by design.",
      icon: Key,
      tag: "Security"
    },
    {
      title: "Linear Events",
      description: "An event-driven architecture where event consumption is enforced by the compiler. Perfect for high-reliability systems where every event must be processed, logged, or transitioned without loss.",
      icon: Calendar,
      tag: "Architecture"
    },
    {
      title: "Papers",
      description: "The theoretical foundation of Austral. A collection of academic research, whitepapers, and formal proofs regarding linearity, capability-based security, and type universes.",
      icon: FileText,
      tag: "Research"
    }
  ];

  return (
    <div className="flex-1 min-w-0 pb-24 pt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-16 text-center animate__animated animate__fadeIn">
        <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6 tracking-tight">
          Ecosystem <span className="bg-gradient-to-r from-austral-primary to-austral-pink bg-clip-text text-transparent">Projects</span>
        </h1>
        <p className="text-xl text-austral-text-muted max-w-2xl mx-auto">
          Advancing the frontier of safe systems programming through innovative research and practical tooling.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
        {projects.map((p, i) => (
          <ProjectCard key={i} {...p} />
        ))}
      </div>

      <div className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-austral-surface to-austral-bg border border-austral-border text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
        <h2 className="text-2xl font-heading font-bold text-white mb-4">Want to contribute?</h2>
        <p className="text-austral-text-muted mb-8 max-w-xl mx-auto">
          The Austral ecosystem is growing. Join us in building the next generation of safe, reliable software.
        </p>
        <button className="px-8 py-3 rounded-xl bg-gradient-to-br from-austral-primary to-austral-pink text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-austral-primary/25">
          Join the Community
        </button>
      </div>
    </div>
  );
}
