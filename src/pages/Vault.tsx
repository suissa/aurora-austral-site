import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, ArrowRight, ExternalLink, Box, Terminal, Shield, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface GithubContent {
  name: string;
  path: string;
  type: string;
  download_url: string | null;
}

interface PackageInfo {
  name: string;
  description: string;
  readme: string;
  path: string;
}

const Vault: React.FC = () => {
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/Aurora-Austral/packages/contents/vault?ref=main');
        const contents: GithubContent[] = await response.json();
        
        const dirs = contents.filter(item => item.type === 'dir');
        
        const packageData = await Promise.all(dirs.map(async (dir) => {
          try {
            const readmeResponse = await fetch(`https://raw.githubusercontent.com/Aurora-Austral/packages/main/vault/${dir.name}/README.md`);
            const readme = await readmeResponse.text();
            
            // Extract a preview (first paragraph or first 200 chars)
            const preview = readme
              .replace(/^#.*$/gm, '') // Remove all headers
              .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Strip links but keep text
              .replace(/[*_`]/g, '') // Strip emphasis and code ticks
              .split('\n')
              .find(p => p.trim().length > 20) || 'Official Austral package.';

            return {
              name: dir.name,
              description: preview.trim().length > 180 ? preview.trim().substring(0, 180) + '...' : preview.trim(),
              readme: readme,
              path: dir.name
            };
          } catch (e) {
            return {
              name: dir.name,
              description: 'Could not load README.',
              readme: '',
              path: dir.name
            };
          }
        }));

        setPackages(packageData);
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const filteredPackages = packages.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-austral-bg pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-16 relative">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-austral-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-austral-secondary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative">
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-br from-austral-primary to-austral-pink bg-clip-text text-transparent">
              Package Vault
            </span>
          </h1>
          <p className="text-xl text-austral-text-muted max-w-2xl font-body leading-relaxed">
            Explore the official Austral ecosystem. High-performance, memory-safe packages for the modern systems programmer.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-10 max-w-xl relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-austral-primary to-austral-secondary rounded-xl blur opacity-25 group-focus-within:opacity-50 transition duration-300" />
          <div className="relative bg-austral-surface-2 border border-austral-border rounded-xl flex items-center px-4 py-3">
            <Search className="text-austral-text-muted mr-3 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search packages..." 
              className="bg-transparent border-none outline-none text-austral-text w-full font-body"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Package Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-austral-surface border border-austral-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => (
              <Link 
                key={pkg.name} 
                to={`/vault/${pkg.path}`}
                className="group relative flex flex-col h-full bg-austral-surface border border-austral-border rounded-2xl p-6 transition-all duration-300 hover:border-austral-primary/50 hover:shadow-[0_0_30px_rgba(60,216,228,0.1)] overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Box className="w-24 h-24 text-austral-primary" />
                </div>
                
                <div className="relative mb-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-heading font-bold text-austral-text group-hover:text-austral-primary transition-colors">
                      {pkg.name}
                    </h2>
                    <ArrowRight className="w-5 h-5 text-austral-text-muted group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div className="relative flex-grow">
                  <p className="text-austral-text-muted font-body text-sm leading-relaxed mb-6 line-clamp-3">
                    {pkg.description}
                  </p>
                </div>

                <div className="relative mt-auto pt-6 border-t border-austral-border flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-austral-surface-2 rounded text-[10px] font-mono text-austral-sidebar-info uppercase tracking-wider">
                      v1.0.0
                    </span>
                    <span className="px-2 py-1 bg-austral-surface-2 rounded text-[10px] font-mono text-austral-sidebar-info uppercase tracking-wider">
                      Austral
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {!loading && filteredPackages.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-austral-text-muted mx-auto mb-4 opacity-20" />
            <p className="text-austral-text-muted font-body">No packages found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vault;
