import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  Package, 
  FileText, 
  Tag, 
  User, 
  Code,
  Box,
  Copy,
  Check,
  Info,
  Code2,
  Terminal,
  Shield
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import CodeBlock from '../components/CodeBlock';

interface PackageMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  repository: string;
  homepage: string;
  lastUpdated: string;
}

const PackageDetails: React.FC = () => {
  const { packageName } = useParams<{ packageName: string }>();
  const [readme, setReadme] = useState('');
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackageData = async () => {
      if (!packageName) return;
      
      try {
        setLoading(true);
        const readmeResponse = await fetch(`https://raw.githubusercontent.com/Aurora-Austral/packages/main/vault/${packageName}/README.md`);
        
        if (!readmeResponse.ok) {
          throw new Error('Package not found');
        }
        
        const text = await readmeResponse.text();
        
        // Extract title from H1
        const titleMatch = text.match(/^# (.*)$/m);
        if (titleMatch) {
          setTitle(titleMatch[1]);
          // Remove the H1 from the body as we'll show it in the header
          setReadme(text.replace(/^# .*$/m, '').trim());
        } else {
          setTitle(packageName);
          setReadme(text);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load package');
      } finally {
        setLoading(false);
      }
    };

    fetchPackageData();
  }, [packageName]);

  const sidebarInfo = {
    install: `austral install ${packageName}`,
    version: '1.0.0',
    license: 'MIT',
    repository: 'Aurora-Austral/packages',
    homepage: `https://github.com/Aurora-Austral/packages/tree/main/vault/${packageName}`,
    author: 'Austral Team',
    lastUpdated: new Date().toLocaleDateString()
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-austral-bg pt-32 flex justify-center">
        <div className="loader-ring" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-austral-bg pt-32 px-4 text-center">
        <h1 className="text-4xl font-heading font-bold text-austral-text mb-4">404</h1>
        <p className="text-austral-text-muted mb-8">{error}</p>
        <Link to="/vault" className="text-austral-primary hover:underline flex items-center justify-center gap-2">
          <ArrowLeft size={16} /> Back to Vault
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-austral-bg pt-20">
      {/* Header / Banner */}
      <div className="border-b border-austral-border bg-austral-surface/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/vault" className="inline-flex items-center gap-2 text-austral-text-muted hover:text-austral-primary transition-colors mb-8 text-sm font-body">
            <ArrowLeft size={16} /> Back to Package Vault
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Box className="text-austral-primary w-8 h-8" />
                <span className="text-austral-sidebar-info font-mono text-sm tracking-widest uppercase">Package</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-heading font-extrabold tracking-tight">
                <span className="bg-gradient-to-br from-austral-primary to-austral-pink bg-clip-text text-transparent">
                  {title}
                </span>
              </h1>
            </div>
            
            <div className="flex gap-4">
              <a 
                href={sidebarInfo.homepage} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-austral-surface border border-austral-border rounded-lg text-sm font-body text-austral-text hover:border-austral-primary transition-all"
              >
                <Code2 size={16} /> GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Documentation Content */}
          <div className="lg:col-span-8">
            <div className="prose prose-invert prose-austral max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <CodeBlock
                        code={String(children).replace(/\n$/, '')}
                        language={match[1]}
                      />
                    ) : (
                      <code className="bg-austral-surface-2 px-1.5 py-0.5 rounded text-austral-primary font-mono text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  h1: ({ children }) => <h1 className="text-3xl font-heading font-bold mb-6 mt-12 text-austral-text border-b border-austral-border pb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-heading font-bold mb-4 mt-10 text-austral-text">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-heading font-bold mb-4 mt-8 text-austral-text">{children}</h3>,
                  p: ({ children }) => <p className="text-austral-text-muted leading-relaxed mb-6 font-body">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-6 space-y-2 text-austral-text-muted font-body">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-6 space-y-2 text-austral-text-muted font-body">{children}</ol>,
                  li: ({ children }) => <li className="ml-4">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-austral-secondary bg-austral-surface-2/50 p-4 my-6 italic text-austral-text-muted rounded-r-lg font-body">
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, href }) => <a href={href} className="text-austral-primary hover:underline transition-all" target="_blank" rel="noreferrer">{children}</a>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-8 border border-austral-border rounded-xl">
                      <table className="w-full text-left border-collapse">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-austral-surface-2">{children}</thead>,
                  th: ({ children }) => <th className="p-4 font-heading font-bold border-b border-austral-border text-austral-text">{children}</th>,
                  td: ({ children }) => <td className="p-4 border-b border-austral-border text-austral-text-muted font-body">{children}</td>,
                }}
              >
                {readme}
              </ReactMarkdown>
            </div>
          </div>

          {/* Sidebar Information */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              
              {/* Install Command */}
              <div className="bg-austral-surface border border-austral-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-heading font-bold text-austral-text mb-4 uppercase tracking-wider flex items-center gap-2">
                  <Terminal size={16} className="text-austral-primary" /> Install
                </h3>
                <div className="bg-austral-code-bg border border-austral-border rounded-lg p-3 flex items-center justify-between group">
                  <code className="text-austral-primary font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                    {sidebarInfo.install}
                  </code>
                  <button 
                    onClick={() => navigator.clipboard.writeText(sidebarInfo.install)}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors text-austral-text-muted"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              {/* Package Info */}
              <div className="bg-austral-surface border border-austral-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-heading font-bold text-austral-text mb-6 uppercase tracking-wider flex items-center gap-2">
                  <Info size={16} className="text-austral-primary" /> Metadata
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-austral-text-muted text-sm font-body flex items-center gap-2">
                      <Tag size={14} /> Version
                    </span>
                    <span className="text-austral-sidebar-info font-mono text-sm">
                      {sidebarInfo.version}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <span className="text-austral-text-muted text-sm font-body flex items-center gap-2">
                      <Shield size={14} /> License
                    </span>
                    <span className="text-austral-sidebar-info font-mono text-sm">
                      {sidebarInfo.license}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-austral-text-muted text-sm font-body flex items-center gap-2">
                      <User size={14} /> Author
                    </span>
                    <span className="text-austral-sidebar-info font-mono text-sm">
                      {sidebarInfo.author}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-austral-text-muted text-sm font-body flex items-center gap-2">
                      <Clock size={14} /> Last Updated
                    </span>
                    <span className="text-austral-sidebar-info font-mono text-sm">
                      {sidebarInfo.lastUpdated}
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-austral-border">
                  <a 
                    href={`https://github.com/${sidebarInfo.repository}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-austral-text-muted hover:text-austral-primary transition-colors text-sm font-body"
                  >
                    <Code2 size={16} /> {sidebarInfo.repository}
                  </a>
                </div>
              </div>

              {/* Ecosystem Links */}
              <div className="bg-gradient-to-br from-austral-primary/10 to-austral-pink/10 border border-austral-primary/20 rounded-2xl p-6">
                <h3 className="text-sm font-heading font-bold text-austral-text mb-4 uppercase tracking-wider">
                  Austral Ecosystem
                </h3>
                <p className="text-austral-text-muted text-xs leading-relaxed font-body mb-4">
                  Part of the official Austral package collection. Built for safety and performance.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-austral-bg/50 rounded text-[10px] font-mono text-austral-primary uppercase tracking-wider">linear-types</span>
                  <span className="px-2 py-1 bg-austral-bg/50 rounded text-[10px] font-mono text-austral-primary uppercase tracking-wider">memory-safe</span>
                  <span className="px-2 py-1 bg-austral-bg/50 rounded text-[10px] font-mono text-austral-primary uppercase tracking-wider">capabilities</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PackageDetails;
