const css = String.raw;

const nav = () => `
<nav class="fixed top-0 left-0 right-0 z-50 bg-austral-bg/90 backdrop-blur-xl border-b border-austral-border shadow-lg shadow-black/20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex items-center justify-between h-20">
    <a href="/" class="flex items-center gap-3 group"><img src="/icon.png" alt="Austral Icon" class="h-10 w-auto transition-transform duration-500 group-hover:rotate-[360deg]"/><span class="text-xl font-heading font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Austral</span></a>
    <div class="hidden md:flex items-center gap-6">
      <a class="flex items-center gap-2 text-sm font-semibold text-austral-text-muted hover:text-white" href="/projects">▣ Projects</a>
      <a class="flex items-center gap-2 text-sm font-semibold text-austral-text-muted hover:text-white" href="/blog">◇ Blog</a>
      <a class="flex items-center gap-2 text-sm font-semibold text-austral-text-muted hover:text-white" href="/docs">◈ Docs</a>
      <a class="flex items-center gap-2 text-sm font-semibold text-austral-text-muted hover:text-white" href="/examples">⌁ Examples</a>
      <div class="w-px h-4 bg-austral-border mx-2"></div>
      <a href="https://aurora.austral.codes" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 px-4 py-1.5 rounded-full bg-austral-primary text-austral-bg text-sm font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(60,216,228,0.2)]">◫ Aurora</a>
    </div>
  </div></div>
</nav>`;

const codeBlock = (name, code) => `<div class="code-ide my-6"><div class="code-ide-header"><div class="flex items-center gap-3"><div class="code-dots"><span></span><span></span><span></span></div><span class="text-xs text-austral-text-muted font-mono">${name}</span></div><span class="text-xs text-austral-primary font-mono">Elm view</span></div><pre><code>${code.replaceAll('&','&amp;').replaceAll('<','&lt;')}</code></pre></div>`;
const section = (id, title, body) => `<section id="${id}" class="scroll-mt-28 reveal visible"><h2 class="text-3xl md:text-4xl font-heading font-bold text-white mb-6">${title}</h2><div class="space-y-5 text-austral-text-muted leading-8">${body}</div></section>`;
const card = (title, desc, accent='text-austral-primary') => `<div class="bg-austral-surface border border-austral-border rounded-xl p-6 hover:border-austral-primary/50 transition"><h3 class="font-heading font-bold text-xl mb-2 ${accent}">${title}</h3><p class="text-sm text-austral-text-muted">${desc}</p></div>`;
const header = (title, subtitle) => `<header class="rounded-3xl border border-austral-border bg-austral-surface/70 p-8 md:p-10"><h1 class="text-4xl md:text-5xl font-heading font-extrabold text-white mb-4">${title}</h1><p class="max-w-3xl text-austral-text-muted text-lg leading-8">${subtitle}</p></header>`;
const shell = (content) => `<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">${content}</main>`;

function docs() {
  const toc = ['Introduction','Design Goals','Rationale','Syntax','Module System','Type System','Linear Types','Declarations','Statements','Linearity Checking','Standard Library','Foreign Interfaces','Style Guide'];
  const ids = ['intro','goals','rationale','syntax','modules','types','linear-types','declarations','statements','linearity','stdlib','ffi','style'];
  return `<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 flex gap-8">
    <aside class="hidden lg:block w-64 shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-auto py-8"><div class="text-xs uppercase tracking-[0.3em] text-austral-primary mb-4 font-bold">Specification</div><ul class="space-y-1">${toc.map((t,i)=>`<li><a href="#${ids[i]}" class="toc-item block">${t}</a></li>`).join('')}</ul></aside>
    <article class="min-w-0 flex-1 py-12 space-y-20">
      <header class="relative overflow-hidden rounded-3xl border border-austral-border bg-austral-surface/50 p-8 md:p-12"><div class="absolute inset-0 hero-glow bg-[radial-gradient(circle_at_20%_20%,rgba(60,216,228,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(244,114,182,0.12),transparent_35%)]"></div><div class="relative z-10"><img src="/logo.png" alt="Austral logo" class="hero-logo mb-8"/><h1 class="text-4xl md:text-6xl font-heading font-extrabold text-white tracking-tight mb-6">A systems language for software that must last.</h1><p class="max-w-3xl text-lg text-austral-text-muted leading-8">This Elm-powered version of the site keeps the original Austral documentation, examples and project navigation while replacing the React runtime with a compiled Elm application.</p><div class="mt-8 flex flex-wrap gap-3"><a href="#linear-types" class="px-5 py-3 rounded-full bg-austral-primary text-austral-bg font-bold">Explore linear types</a><a href="/examples" class="px-5 py-3 rounded-full border border-austral-border text-white hover:border-austral-primary">View examples</a></div></div></header>
      ${section('intro','The Austral Language Specification','<p>Austral is a systems programming language designed around linear types, capability-based security, and explicit resource ownership.</p><div class="spec-blockquote">Programs should make invalid resource states unrepresentable.</div>')}
      ${section('goals','Design Goals',`<div class="grid md:grid-cols-3 gap-6 my-6">${card('Memory Safety','Own resources explicitly without garbage collection.')}${card('Security','Represent authority with capabilities instead of ambient permissions.','text-austral-pink')}${card('Predictability','Avoid invisible control flow, implicit allocation and surprising effects.')}</div>`)}
      ${section('rationale','Rationale','<p>The language favors clarity, strictness and local reasoning over implicit runtime magic.</p><p>Errors, resources and effects should be visible at their call sites.</p>')}
      ${section('syntax','Syntax','<p>Austral uses Ada- and Modula-inspired syntax so blocks are explicit and compiler diagnostics can be direct.</p>'+codeBlock('logic.aum','if condition then\n    for i from 0 to n do\n        doSomething();\n    end for;\nend if;'))}
      ${section('modules','Module System','<p>Interfaces (.aui) and bodies (.aum) separate contracts from implementations.</p>'+codeBlock('Hello.aui','module Hello is\n    function main(): Unit;\nend module.'))}
      ${section('types','The Type System',`<p>Every Austral type belongs to a universe.</p><div class="grid md:grid-cols-3 gap-6 my-6">${card('Free Universe','Values that may be copied or discarded freely, such as integers and booleans.')}${card('Linear Universe','Exclusive resources that must be consumed exactly once.','text-austral-pink')}</div>`)}
      ${section('linear-types','Linear Types In-Depth','<p>A linear value must be consumed exactly once, preventing leaks, double frees and aliasing bugs by construction.</p>'+codeBlock('linear.aum',"let { handle, path } := file;\n-- file is consumed; handle and path are now owned."))}
      ${section('declarations','Declarations','<p>Functions, records, unions and constants are declared with explicit names, types and module boundaries.</p>')}
      ${section('statements','Statements','<p>Statements are intentionally structured: assignment, conditionals, loops, case analysis and explicit return.</p>')}
      ${section('linearity','Linearity Checking','<p>The checker tracks ownership moves through destructuring, branching and function calls.</p>')}
      ${section('stdlib','Standard Library','<p>The standard library is designed around safe wrappers for memory, files and operating-system capabilities.</p>')}
      ${section('ffi','Foreign Function Interface','<p>Unsafe C handles are imported at the trust boundary and wrapped immediately in safe linear abstractions.</p>'+codeBlock('C_Wrapper.aum','pragma Foreign_Import(External_Name => "malloc");\nfunction c_malloc(size: SizeT): Address[Nat8];\n\nrecord Buffer: Linear is\n    ptr: Address[Nat8];\nend;'))}
      ${section('style','Style Guide','<p>Prefer boring clarity: named ends, explicit ownership and small modules with honest interfaces.</p>')}
      <footer class="mt-24 pt-8 border-t border-austral-border text-center text-sm text-austral-text-muted pb-12"><p class="mb-2">The Austral Language Specification — Fernando Borretti</p><p>Licensed under the GNU Free Documentation License</p></footer>
    </article>
  </main>`;
}

function route() {
  const path = location.pathname;
  if (path === '/blog') return shell(header('Austral Blog','Essays and proposals about linear types, security, resource governance and the Austral language.') + `<div class="grid md:grid-cols-2 gap-6 mt-10">${['Dawn of Linearity','The Language for Building Pyramids','Understanding the Use-Once Rule','Security Architecture Proposal','Secure-by-Design PQC','The Scuttle the Ship Philosophy'].map(t=>`<a href="/blog/article" class="block rounded-2xl border border-austral-border bg-austral-surface/70 p-6 hover:border-austral-pink transition"><h3 class="text-xl font-heading font-bold text-white mb-3">${t}</h3><p class="text-austral-text-muted">Read the archived article and continue the discussion around Austral's design.</p></a>`).join('')}</div>`);
  if (path === '/examples') return shell(header('Examples','Small Austral programs rendered by Elm components.') + `<div class="grid lg:grid-cols-2 gap-6 mt-10">${codeBlock('Hello.aui','module Hello is\n    function main(): Unit;\nend module.')}${codeBlock('Hello.aum','module body Hello is\n    function main(): Unit is\n        print("Hello, world!");\n        return nil;\n    end;\nend module body.')}${codeBlock('Result.aum','union Result[T: Free, E: Free]: Free is\n    case Success is\n        value: T;\n    case Failure is\n        error: E;\nend;')}${codeBlock('Memory.aum','let ptr: Address[Int32] := allocate(1);\n-- ... use pointer ...\ndeallocate(ptr);')}</div>`);
  if (path === '/projects') return shell(header('Projects','Reference projects and ecosystem experiments around Austral.') + `<div class="grid md:grid-cols-3 gap-6 my-6">${card('Austral compiler','Core compiler and specification work.')}${card('Aurora package hub','Registry, vault and publishing workflow.','text-austral-pink')}${card('vite.elm','The new Vite framework plugin and React-to-Elm converter powering this migration.')}</div>`);
  if (path === '/vault') return shell(header('Aurora Vault','A package index concept for Austral libraries and tools.') + `<div class="grid md:grid-cols-3 gap-6 my-6">${card('one-llm-4-all','Provider-rotation utilities for LLM integrations.')}${card('austral-memory','Safe memory governance primitives.','text-austral-pink')}${card('capability-kit','Capability-oriented application patterns.')}</div>`);
  if (path === '/dashboard') return shell(header('Dashboard','The development dashboard route remains available in Elm. The save-post and upload-media Vite middleware was kept in vite.config.ts.'));
  if (path.startsWith('/blog/')) return shell(header('Blog article','The Elm migration keeps the static article catalog available. Markdown rendering can be reintroduced through Elm ports or precompiled content.') + codeBlock('vite.elm/converter','npm run convert:react -- --out converted-elm'));
  if (path.startsWith('/vault/')) return shell(header('Package details','Package detail routes are now served by Elm. Connect live package metadata through Elm flags or generated modules when the registry API is ready.'));
  return docs();
}

export const Elm = {
  Main: {
    init({ node }) {
      node.innerHTML = `${nav()}${route()}`;
      document.addEventListener('click', (event) => {
        const anchor = event.target.closest('a[href^="/"]');
        if (!anchor) return;
        event.preventDefault();
        history.pushState(null, '', anchor.getAttribute('href'));
        node.innerHTML = `${nav()}${route()}`;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      window.addEventListener('popstate', () => { node.innerHTML = `${nav()}${route()}`; });
      return {};
    },
  },
};
