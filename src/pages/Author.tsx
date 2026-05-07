
import React from 'react';
import { 
  Briefcase, Play, Globe, 
  MapPin, Calendar, Mail, ExternalLink,
  ChevronLeft, Award, Zap, Code2, SquareCode
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Author() {
  const navigate = useNavigate();

  const socialLinks = [
    { name: 'LinkedIn', icon: <Briefcase size={20} />, url: 'https://linkedin.com/in/suissa', color: 'bg-[#0077b5]' },
    { name: 'Dev.to', icon: <SquareCode size={20} />, url: 'https://dev.to/fullagenticstack', color: 'bg-[#000000]' },
    { name: 'YouTube', icon: <Play size={20} />, url: 'https://youtube.com/@fullagenticstack', color: 'bg-[#ff0000]' },
    { name: 'GitHub', icon: <Code2 size={20} />, url: 'https://github.com/suissa', color: 'bg-[#24292e]' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-austral-bg">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-austral-text-muted hover:text-white transition-colors mb-12 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </button>

        <div className="relative">
          {/* Header Card */}
          <div className="bg-austral-surface border border-austral-border rounded-[2.5rem] p-8 sm:p-12 overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-austral-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            
            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
              <div className="shrink-0">
                <div className="w-32 h-32 sm:w-40 h-40 rounded-3xl bg-gradient-to-br from-austral-primary to-austral-pink p-1 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-xl shadow-austral-primary/20">
                  <div className="w-full h-full rounded-[1.3rem] bg-austral-surface flex items-center justify-center overflow-hidden">
                    <img 
                      src="/author.jpg" 
                      alt="Suissa" 
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white tracking-tight">
                    Jean Carlo <span className="bg-gradient-to-br from-austral-primary to-austral-pink bg-clip-text text-transparent">Suissa</span>
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-austral-primary/10 border border-austral-primary/20 text-austral-primary text-[10px] font-bold uppercase tracking-widest">
                    <Award size={12} /> Ambassador
                  </span>
                </div>

                <p className="text-xl text-austral-text-muted mb-8 leading-relaxed max-w-2xl">
                  Full-stack Alchemist, Everything as a Code Evangelist, and the first official <span className="text-white font-semibold">Austral Ambassador</span> in Brazil.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {socialLinks.map(link => (
                    <a 
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-austral-primary hover:bg-austral-primary/5 transition-all group"
                    >
                      <span className="text-austral-text-muted group-hover:text-white transition-colors">{link.icon}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-austral-surface/50 border border-austral-border rounded-3xl p-8">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Zap size={18} className="text-austral-pink" />
                  Mission Profile
                </h3>
                <p className="text-austral-text-muted leading-relaxed">
                  Dedicated to democratizing systems programming through the power of Austral. Currently developing the first high-performance package manager for the ecosystem, <span className="text-white">Aurora Austral</span>, and building a network of capability-driven distributed agents.
                </p>
              </div>

              <div className="bg-austral-surface/50 border border-austral-border rounded-3xl p-8">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Code2 size={18} className="text-austral-primary" />
                  Technical Focus
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Linear Types', 'Capability Security', 'WASM Orchestration', 'Linear Autentication', 'UbiQ Digital', 'Adaptative Observability Negotiation Protocol', 'Extreme Developer Experience', 'Behavior E2E', 'PQRS (Polyglot Query Responsibility Segregation)', 'AllasCode BE2E Framework', 'Multi-Plane Agents Choreography Architecture', 'Austral', 'Koka', 'Go', 'Rust', 'Zig', 'Gleam', 'Mojo', 'Haskell', 'PROLOG', 'Postgres', 'DuckDb', 'BadgerDb', 'Cassandra', 'Redis', 'Qdrant', 'MongoDb', 'Neo4J', 'ClickHouse', 'Tempo', 'Meilisearch', 'Infiscal', 'QuestDB'].map(tech => (
                    <span key={tech} className="px-4 py-2 rounded-xl bg-austral-bg border border-austral-border text-xs text-austral-text-muted">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-austral-surface/50 border border-austral-border rounded-3xl p-8">
                <h3 className="text-sm font-bold text-austral-text-muted uppercase tracking-widest mb-6">Contact</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm text-white">
                    <MapPin size={16} className="text-austral-primary" /> Itararé, Brazil
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white">
                    <Mail size={16} className="text-austral-primary" /> suissAI@gmail.com
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white">
                    <Globe size={16} className="text-austral-primary" /> suissAI.dev
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-austral-primary to-austral-pink rounded-3xl p-[1px]">
                <div className="bg-austral-bg rounded-[calc(1.5rem-1px)] p-6 text-center">
                  <p className="text-xs text-austral-text-muted mb-4 italic">"Simplicity is the ultimate sophistication."</p>
                  <button className="text-white text-xs font-bold flex items-center gap-2 mx-auto hover:gap-3 transition-all">
                    Download Resume <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
