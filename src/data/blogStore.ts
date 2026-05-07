export type PostType = 'text' | 'image' | 'audio' | 'video' | 'slides';

export interface BlogMedia {
  type: PostType;
  url: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  dateCreated: number;
  dateUpdated: number;
  views: number;
  medias: BlogMedia[];
  author: string;
  translations: Record<string, string>;
  language: 'pt' | 'en';
}

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const STORAGE_KEY = 'austral_blog_posts';

// Helper to parse frontmatter manually since we don't have gray-matter
function parseMD(content: string, filename: string): BlogPost {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const metadata: Record<string, string> = {};
  let body = content;

  if (fmMatch) {
    const fm = fmMatch[1];
    body = fmMatch[2];
    fm.split('\n').forEach(line => {
      const [key, ...val] = line.split(':');
      if (key && val) metadata[key.trim()] = val.join(':').trim();
    });
  }

  const id = filename.split('/').pop()?.replace('.md', '') || filename;
  const cleanTitle = id.replace(/_/g, ' ').replace(/-/g, ' ');
  
  return {
    id: id,
    title: metadata.title && metadata.title !== 'Untitled' ? metadata.title : cleanTitle,
    content: body.trim(),
    translations: {},
    dateCreated: metadata.date ? new Date(metadata.date).getTime() : Date.now(),
    dateUpdated: Date.now(),
    views: 0,
    medias: [{ type: (metadata.type as PostType) || 'text', url: metadata.mediaUrl || '' }],
    author: metadata.author || 'Suissa',
    language: (metadata.language as 'pt' | 'en') || 'en'
  };
}

export const blogStore = {
  getPosts(): BlogPost[] {
    const staticPosts: BlogPost[] = [];
    
    // 1. Get posts from static .json files
    try {
      const jsonModules = import.meta.glob('../../blog/articles/*.json', { eager: true });
      for (const path in jsonModules) {
        const data = (jsonModules[path] as any).default;
        const filename = path.split('/').pop()?.replace('.json', '') || '';
        const id = toSlug(filename);
        staticPosts.push({ 
          id, 
          ...data, 
          translations: data.translations || {}, 
          author: data.author || 'Suissa',
          language: data.language || 'en'
        });
      }
    } catch (e) {}

    // 2. Get posts from static .md files
    try {
      const mdModules = import.meta.glob('../../blog/articles/*.md', { query: '?raw', eager: true });
      for (const path in mdModules) {
        const content = (mdModules[path] as any).default;
        staticPosts.push(parseMD(content, path));
      }
    } catch (e) {}

    // 3. Get posts from blog/medias (auto-generation)
    try {
      const mediaModules = import.meta.glob('../../blog/medias/**/*', { eager: true });
      for (const path in mediaModules) {
        if (path.includes('.gitkeep') || path.endsWith('/')) continue;
        
        const filename = path.split('/').pop() || '';
        const nameWithoutExt = filename.split('.')[0];
        const id = toSlug(nameWithoutExt);
        
        // Skip if a post with this ID already exists (priority to MD/JSON)
        if (staticPosts.some(p => p.id === id)) continue;

        let type: PostType = 'text';
        if (path.includes('/images/')) type = 'image';
        else if (path.includes('/videos/')) type = 'video';
        else if (path.includes('/audios/')) type = 'audio';
        else if (path.includes('/slides/')) type = 'slides';

        // Get actual URL from Vite
        const url = (mediaModules[path] as any).default || path;

        staticPosts.push({
          id,
          title: nameWithoutExt.replace(/_/g, ' ').replace(/-/g, ' '),
          content: '', 
          dateCreated: Date.now(), 
          dateUpdated: Date.now(),
          views: 0,
          medias: [{ type, url }],
          author: 'Suissa',
          translations: {},
          language: 'en'
        });
      }
    } catch (e) {}

    // 4. Get posts from localStorage
    const data = localStorage.getItem(STORAGE_KEY);
    const localPosts: BlogPost[] = data ? JSON.parse(data) : [];

    // 5. Merge and sort
    const allPosts = [...staticPosts, ...localPosts];
    return allPosts.sort((a, b) => b.dateCreated - a.dateCreated);
  },

  savePost(post: BlogPost) {
    const posts = this.getLocalPosts();
    const index = posts.findIndex(p => p.id === post.id);
    if (index >= 0) {
      posts[index] = post;
    } else {
      posts.unshift(post);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  },

  getLocalPosts(): BlogPost[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  deletePost(id: string) {
    const posts = this.getLocalPosts().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }
};
