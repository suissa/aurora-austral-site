import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Save, Trash2, Image as ImageIcon, 
  Mic, Video, FileText, Globe, Loader2,
  ChevronLeft, LayoutDashboard, Lock, LogIn, X
} from 'lucide-react';
import { blogStore } from '../data/blogStore';
import type { BlogPost, PostType } from '../data/blogStore';
import { translatePost } from '../services/ai';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(sessionStorage.getItem('dashboard_auth') === 'true');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState(blogStore.getPosts());
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'text' as PostType,
    mediaUrl: '',
    author: 'Suissa'
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [newPostId, setNewPostId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const folder = formData.type === 'image' ? 'images' : 
                     formData.type === 'video' ? 'videos' : 
                     formData.type === 'audio' ? 'audios' : 'slides';
      setFormData({
        ...formData,
        mediaUrl: `/blog/medias/${folder}/${file.name}`
      });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.username === 'suissa' && loginData.password === 'teste') {
      setIsLoggedIn(true);
      sessionStorage.setItem('dashboard_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload file if selected
      if (selectedFile) {
        const folder = formData.type === 'image' ? 'images' : 
                       formData.type === 'video' ? 'videos' : 
                       formData.type === 'audio' ? 'audios' : 'slides';
        
        const uploadRes = await fetch(`/api/upload-media?filename=${encodeURIComponent(selectedFile.name)}&folder=${folder}`, {
          method: 'POST',
          body: selectedFile
        });
        
        if (!uploadRes.ok) throw new Error('Failed to upload media file');
      }

      // 2. Translate only if content exists
      let translated = '';
      if (formData.content.trim()) {
        translated = await translatePost(formData.content, 'English');
      }

      // 3. Save JSON via API
      const now = Date.now();
      const newPost: BlogPost = {
        id: editingPost?.id || formData.title.toLowerCase().replace(/\s+/g, '_'),
        title: formData.title,
        content: formData.content,
        dateCreated: editingPost?.dateCreated || now,
        dateUpdated: now,
        views: editingPost?.views || 0,
        medias: [{ 
          type: formData.type, 
          url: selectedFile ? `/blog/medias/${formData.type === 'image' ? 'images' : formData.type === 'video' ? 'videos' : formData.type === 'audio' ? 'audios' : 'slides'}/${selectedFile.name}` : formData.mediaUrl 
        }],
        author: 'Suissa',
        translations: translated ? { en: translated } : (editingPost?.translations || {}),
        language: 'en'
      };

      const saveRes = await fetch('/api/save-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });

      if (!saveRes.ok) throw new Error('Failed to save post JSON');

      alert('Post published successfully!');
      
      // Clear form and reload posts from server
      setFormData({ title: '', content: '', type: 'text', mediaUrl: '', author: 'Suissa' });
      setSelectedFile(null);
      setEditingPost(null);
      
      // Force a reload of the blogStore data from the server files
      const updatedPosts = blogStore.getPosts();
      const createdId = newPost.id;
      setNewPostId(createdId);
      setPosts(updatedPosts);
      setTimeout(() => setNewPostId(null), 600);
    } catch (err) {
      console.error(err);
      alert('Error saving post.');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = (id: string) => {
    if (confirm('Are you sure?')) {
      setDeletingId(id);
      setTimeout(() => {
        blogStore.deletePost(id);
        setPosts(prev => prev.filter(p => p.id !== id));
        setDeletingId(null);
      }, 400);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-austral-bg/80 backdrop-blur-xl animate__animated animate__fadeIn">
        <div className="w-full max-w-md bg-austral-surface border border-austral-border rounded-[2rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-br from-austral-primary to-austral-pink" />
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-austral-primary/10 flex items-center justify-center text-austral-primary mx-auto mb-6">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-heading font-bold text-white mb-2">Restricted Area</h2>
            <p className="text-austral-text-muted text-sm">Please authenticate to manage the Nexus.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="text" 
                placeholder="Username"
                value={loginData.username}
                onChange={e => setLoginData({...loginData, username: e.target.value})}
                className="w-full bg-austral-bg border border-austral-border rounded-xl px-4 py-3 text-white focus:border-austral-primary outline-none"
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Password"
                value={loginData.password}
                onChange={e => setLoginData({...loginData, password: e.target.value})}
                className="w-full bg-austral-bg border border-austral-border rounded-xl px-4 py-3 text-white focus:border-austral-primary outline-none"
              />
            </div>
            {loginError && <p className="text-red-400 text-xs text-center">{loginError}</p>}
            <button className="w-full py-4 rounded-xl bg-gradient-to-br from-austral-primary to-austral-pink text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
              <LogIn size={18} /> Authenticate
            </button>
          </form>

          <button 
            onClick={() => navigate('/')}
            className="w-full mt-4 text-austral-text-muted text-xs hover:text-white transition-colors"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-austral-bg">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-heading font-bold text-white mb-2 flex items-center gap-3">
              <LayoutDashboard className="text-austral-pink" />
              Content <span className="bg-gradient-to-br from-austral-primary to-austral-pink bg-clip-text text-transparent">Studio</span>
            </h1>
            <p className="text-austral-text-muted">Manage your multimodal ecosystem</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => { sessionStorage.removeItem('dashboard_auth'); setIsLoggedIn(false); }}
              className="px-5 py-2.5 rounded-xl border border-austral-border text-austral-text-muted hover:text-white hover:border-red-500/50 transition-all"
            >
              Logout
            </button>
            <button 
              onClick={() => navigate('/blog')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-austral-surface border border-austral-border text-white hover:border-austral-pink transition-all"
            >
              <ChevronLeft size={18} /> View Blog
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create/Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSave} className="bg-austral-surface/50 border border-austral-border rounded-3xl p-8 backdrop-blur-xl animate__animated animate__fadeInLeft">
              <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-austral-text-muted mb-2">Title</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter post title..."
                    className="w-full bg-austral-bg border border-austral-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-austral-primary transition-colors"
                  />
                </div>

                {formData.type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-austral-text-muted mb-2">Content (AI will translate this)</label>
                    <textarea 
                      required
                      value={formData.content}
                      onChange={e => setFormData({...formData, content: e.target.value})}
                      rows={5}
                      placeholder="Write your story..."
                      className="w-full bg-austral-bg border border-austral-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-austral-primary transition-colors resize-none"
                    />
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-austral-text-muted mb-2">Post Type</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { type: 'text', icon: <FileText size={18} /> },
                        { type: 'image', icon: <ImageIcon size={18} /> },
                        { type: 'audio', icon: <Mic size={18} /> },
                        { type: 'video', icon: <Video size={18} /> },
                        { type: 'slides', icon: <Globe size={18} /> }
                      ].map(m => (
                        <button
                          key={m.type}
                          type="button"
                          onClick={() => setFormData({...formData, type: m.type as PostType})}
                          className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                            formData.type === m.type 
                              ? 'bg-austral-primary text-white shadow-lg shadow-austral-primary/20' 
                              : 'bg-austral-bg border border-austral-border text-austral-text-muted hover:border-austral-primary'
                          }`}
                          title={m.type}
                        >
                          {m.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-austral-text-muted mb-2">Media File / URL</label>
                    <div className="flex gap-2">
                      <input 
                        value={formData.mediaUrl}
                        onChange={e => setFormData({...formData, mediaUrl: e.target.value})}
                        placeholder="/blog/medias/..."
                        className="flex-1 bg-austral-bg border border-austral-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-austral-primary transition-colors"
                      />
                      <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept={
                          formData.type === 'image' ? 'image/*' :
                          formData.type === 'video' ? 'video/*' :
                          formData.type === 'audio' ? 'audio/*' :
                          formData.type === 'slides' ? '.pdf' : '*'
                        }
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 bg-austral-surface border border-austral-border rounded-xl text-austral-primary hover:border-austral-primary transition-all"
                        title="Select file"
                      >
                        <ImageIcon size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-br from-austral-primary to-austral-pink text-white font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {editingPost ? 'Update Post' : 'Publish Post'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* List */}
          <div className="space-y-4 animate__animated animate__fadeInRight">
            <h2 className="text-sm font-bold text-austral-text-muted uppercase tracking-widest px-2">Your Posts</h2>
            <div className="space-y-3">
              {posts.length === 0 && (
                <div className="text-center py-12 bg-austral-surface/30 rounded-3xl border border-dashed border-austral-border">
                  <Plus className="mx-auto text-austral-text-muted mb-2 opacity-20" size={48} />
                  <p className="text-austral-text-muted text-sm">No posts yet</p>
                </div>
              )}
              {posts.map(post => (
                <div 
                  key={post.id} 
                  onClick={() => {
                    setEditingPost(post);
                    setFormData({
                      title: post.title,
                      content: post.content,
                      type: post.medias[0]?.type || 'text',
                      mediaUrl: post.medias[0]?.url || '',
                      author: post.author
                    });
                  }}
                  className={`group bg-austral-surface border border-austral-border rounded-2xl p-4 hover:border-austral-primary transition-all cursor-pointer ${
                    deletingId === post.id ? 'animate-slide-out-right' : 
                    newPostId === post.id ? 'animate-slide-in-left' : ''
                  }`}
                  style={deletingId === post.id ? { pointerEvents: 'none' } : undefined}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-austral-primary/10 flex items-center justify-center text-austral-primary">
                        {post.medias[0]?.type === 'image' && <ImageIcon size={18} />}
                        {post.medias[0]?.type === 'text' && <FileText size={18} />}
                        {post.medias[0]?.type === 'audio' && <Mic size={18} />}
                        {post.medias[0]?.type === 'video' && <Video size={18} />}
                        {post.medias[0]?.type === 'slides' && <Globe size={18} />}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm truncate max-w-[150px]">
                          {post.title}
                        </h3>
                        <p className="text-[10px] text-austral-text-muted">{new Date(post.dateCreated).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePost(post.id);
                        }}
                        className="p-2 text-austral-text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
