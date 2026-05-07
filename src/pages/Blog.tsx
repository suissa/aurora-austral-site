import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ImageIcon, Mic, Video, FileText, Globe, 
  Search, ChevronLeft, ChevronRight, ArrowRight, Calendar,
  Eye, Menu, X as CloseIcon, Play, Volume2, Maximize2, Maximize, Minimize, Loader2
} from 'lucide-react';
import { blogStore } from '../data/blogStore';
import type { BlogPost, PostType } from '../data/blogStore';


function PDFSlider({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPdfJs = async () => {
      if (!(window as any).pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      
      try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdfDoc = await loadingTask.promise;
        setPdf(pdfDoc);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
      }
    };

    loadPdfJs();
  }, [url]);

  useEffect(() => {
    if (pdf && canvasRef.current) {
      const renderPage = async () => {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: isFullscreen ? 2 : 1.5 });
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        await page.render(renderContext).promise;
      };
      renderPage();
    }
  }, [pdf, pageNum, isFullscreen]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    if (!pdf) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setPageNum(p => Math.max(1, p - 1));
      if (e.key === 'ArrowRight') setPageNum(p => Math.min(pdf.numPages, p + 1));
      if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pdf, isFullscreen]);

  if (loading) {
    return (
      <div className="aspect-video bg-austral-surface-2 flex items-center justify-center border border-austral-border rounded-2xl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-austral-primary" size={32} />
          <p className="text-austral-text-muted text-sm font-mono">Loading assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative group ${isFullscreen ? 'bg-black flex items-center justify-center h-screen' : 'bg-austral-surface-2 border border-austral-border rounded-2xl overflow-hidden'}`}>
      <canvas ref={canvasRef} className="max-w-full max-h-full mx-auto shadow-2xl" />
      
      {/* Controls Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            disabled={pageNum <= 1}
            onClick={() => setPageNum(p => Math.max(1, p - 1))}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-white font-mono text-sm">
            {pageNum} / {pdf?.numPages || 0}
          </span>
          <button 
            disabled={pageNum >= (pdf?.numPages || 0)}
            onClick={() => setPageNum(p => Math.min(pdf.numPages, p + 1))}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <button 
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>

      {/* Side Hit Areas for navigation */}
      <div className="absolute inset-y-0 left-0 w-20 cursor-pointer" onClick={() => setPageNum(p => Math.max(1, p - 1))} />
      <div className="absolute inset-y-0 right-0 w-20 cursor-pointer" onClick={() => setPageNum(p => Math.min(pdf.numPages, p + 1))} />
    </div>
  );
}

export default function Blog() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lang, setLang] = useState<'pt' | 'en'>('en');
  const [showToc, setShowToc] = useState(true);

  useEffect(() => {
    setPosts(blogStore.getPosts());
  }, []);

  const selectedPost = posts.find(p => p.id === id) || null;

  useEffect(() => {
    if (selectedPost) {
      setLang(selectedPost.language);
    }
  }, [selectedPost]);

  const filteredPosts = posts.filter(post => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    const words = query.split(/\s+/);
    const contentToSearch = `${post.title} ${post.content}`.toLowerCase();
    return words.every(word => contentToSearch.includes(word));
  });

  const getMediaIcon = (type: PostType) => {
    switch (type) {
      case 'image': return <ImageIcon size={20} />;
      case 'audio': return <Mic size={20} />;
      case 'video': return <Video size={20} />;
      case 'slides': return <Globe size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const stripMarkdown = (text: string) => {
    return text
      .replace(/[#*`_~]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\n/g, ' ')
      .trim();
  };

  const getToc = (content: string) => {
    const lines = content.split('\n');
    return lines
      .filter(line => line.startsWith('#'))
      .map(line => {
        const level = line.match(/^#+/)?.[0].length || 0;
        const text = line.replace(/^#+\s*/, '');
        return { level, text, id: text.toLowerCase().replace(/[^\w]+/g, '-') };
      });
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} id={line.replace(/^###\s*/, '').toLowerCase().replace(/[^\w]+/g, '-')} className="text-xl font-bold text-white mt-8 mb-4">{line.replace(/^###\s*/, '')}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} id={line.replace(/^##\s*/, '').toLowerCase().replace(/[^\w]+/g, '-')} className="text-2xl font-bold text-white mt-10 mb-6">{line.replace(/^##\s*/, '')}</h2>;
      if (line.startsWith('# ')) return <h1 key={i} id={line.replace(/^#\s*/, '').toLowerCase().replace(/[^\w]+/g, '-')} className="text-4xl font-bold text-white mt-12 mb-8 bg-gradient-to-br from-austral-primary to-austral-pink bg-clip-text text-transparent">{line.replace(/^#\s*/, '')}</h1>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="mb-4 text-austral-text-muted leading-relaxed">{line}</p>;
    });
  };

  if (selectedPost) {
    const toc = getToc(lang === 'en' ? selectedPost.translations['en'] || selectedPost.content : selectedPost.content);
    const hasToc = toc.length > 0;

    return (
      <div className="min-h-screen pt-24 pb-20 bg-austral-bg flex">
        {hasToc && (
          <aside 
            className={`fixed inset-y-0 left-0 z-50 w-72 bg-austral-surface border-r border-austral-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${showToc ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="p-8 pt-24 h-full overflow-y-auto font-mono text-austral-sidebar-info">
              <div className="flex items-center gap-2 mb-8">
                <Menu className="text-austral-primary" size={18} />
                <h4 className="text-[10px] uppercase tracking-widest font-bold">Structure</h4>
              </div>
              <nav className="space-y-1">
                {toc.map((item, i) => (
                  <a 
                    key={i}
                    href={`#${item.id}`}
                    className={`block py-2 text-sm transition-colors hover:text-austral-primary ${item.level === 1 ? 'font-bold text-white' : item.level === 2 ? 'pl-4' : 'pl-8 opacity-60'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        <main className={`flex-1 px-4 sm:px-10 lg:px-20 max-w-5xl mx-auto ${!hasToc ? 'w-full' : ''}`}>
          <header className="mb-12">
            <button 
              onClick={() => navigate('/blog')}
              className="flex items-center gap-2 text-austral-text-muted hover:text-white transition-colors mb-8 group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </button>
            
            <div className="flex items-center justify-between mb-8">
               <div className="flex gap-4">
                  <button 
                    onClick={() => setLang('pt')}
                    className={`transition-all ${lang === 'pt' ? 'scale-110 opacity-100' : 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}
                  >
                    <img src="/flag-pt.png" alt="PT" className="w-6 h-auto" />
                  </button>
                  <button 
                    onClick={() => setLang('en')}
                    className={`transition-all ${lang === 'en' ? 'scale-110 opacity-100' : 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}
                  >
                    <img src="/flag-en.png" alt="EN" className="w-6 h-auto" />
                  </button>
                </div>
              {hasToc && !showToc && (
                <button 
                  onClick={() => setShowToc(true)}
                  className="p-2 rounded-lg bg-austral-surface border border-austral-border text-austral-primary"
                >
                  <Menu size={20} />
                </button>
              )}
            </div>

            <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-6 leading-tight">
              {selectedPost.title}
            </h1>
            
            <div className="flex items-center gap-6 text-xs font-mono text-austral-sidebar-info">
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(selectedPost.dateCreated).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                <span className="flex items-center gap-1.5"><Eye size={14} /> {selectedPost.views} views</span>
            </div>
          </header>

          <div className="space-y-12 mb-16">
            {selectedPost.medias.map((media, idx) => (
              <div key={idx} className="relative overflow-hidden">
                {media.type === 'image' && (
                  <img src={media.url} alt={selectedPost.title} className="w-full h-auto block" />
                )}
                
                {media.type === 'video' && (
                  <div className="aspect-video bg-black">
                    <iframe 
                      className="w-full h-full"
                      src={media.url.includes('youtube.com') ? `https://www.youtube.com/embed/${media.url.split('v=')[1]}` : media.url}
                      title="Video player"
                      allowFullScreen
                    />
                  </div>
                )}

                {media.type === 'audio' && (
                  <div className="p-12 bg-austral-surface-2 flex flex-col items-center gap-8">
                    <div className="w-20 h-20 rounded-full bg-austral-primary flex items-center justify-center text-austral-bg shadow-xl animate-pulse">
                      <Volume2 size={32} />
                    </div>
                    <audio src={media.url} controls className="w-full max-w-md h-12" />
                  </div>
                )}

                {media.type === 'slides' && (
                  <PDFSlider url={media.url} />
                )}
              </div>
            ))}
          </div>

          <article className="prose prose-invert max-w-none font-body">
            {renderContent(lang === 'en' ? selectedPost.translations['en'] || selectedPost.content : selectedPost.content)}
          </article>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-austral-bg">
      <div className="max-w-4xl mx-auto">
        {/* Header & Search */}
        <div className="mb-20 text-center">
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-br from-austral-primary to-austral-pink bg-clip-text text-transparent">
              Austral Blog
            </span>
          </h1>
          <p className="text-austral-text-muted font-body mb-12 max-w-2xl mx-auto">
            Deep dives into memory safety, linear types, and the future of systems programming.
          </p>

          <div className="relative group max-w-xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-austral-primary to-austral-pink rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-300" />
            <div className="relative bg-austral-surface border border-austral-border rounded-2xl flex items-center px-6 py-4">
              <Search className="text-austral-text-muted mr-4 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search articles, topics, tutorials..." 
                className="bg-transparent border-none outline-none text-austral-text w-full font-body text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* List of Posts */}
        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
              <div 
                key={post.id} 
                className="group relative border-b border-austral-border/10 animate__animated animate__fadeInUp"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Animated Bottom Border */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-austral-primary to-austral-pink scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10" />
                
                <Link 
                  to={`/blog/${post.id}`}
                  className="block py-6 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-austral-sidebar-info uppercase tracking-widest">
                            {new Date(post.dateCreated).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                          <img 
                            src={post.language === 'en' ? '/flag-en.png' : '/flag-pt.png'} 
                            alt={post.language} 
                            className="w-4 h-auto opacity-70 group-hover:opacity-100 transition-opacity" 
                          />
                        </div>
                        <div className="flex gap-2">
                          {post.medias.map((m, i) => (
                            <span key={i} className="text-austral-primary/40 group-hover:text-austral-primary transition-colors">
                              {getMediaIcon(m.type)}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <h2 className="text-2xl font-heading font-bold text-white transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-austral-primary group-hover:to-austral-pink group-hover:bg-clip-text group-hover:text-transparent">
                        {post.title}
                      </h2>
                      
                      <p className="text-austral-text-muted text-sm line-clamp-1 opacity-50 font-body group-hover:opacity-80 transition-opacity mt-1">
                        {stripMarkdown(lang === 'en' ? post.translations['en'] || post.content : post.content) || 'Multimodal content exploring the official Austral ecosystem.'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <ArrowRight className="w-5 h-5 text-austral-text-muted group-hover:text-white group-hover:translate-x-2 transition-all" />
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-austral-text-muted mx-auto mb-4 opacity-20" />
              <p className="text-austral-text-muted font-body">No articles found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
