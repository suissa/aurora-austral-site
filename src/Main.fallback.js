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

const commandEndpoint = 'http://195.35.19.148:13032/agents/coordinator';
const websocketUrl = window.localStorage.getItem('agents_ws_url') || 'ws://195.35.19.148:13032/agents/events';
const agentsState = { agents: new Map(), modalAgent: null, prompt: '', connected: false, socketStarted: false };
const sh = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const metric = (label, value) => `<div class="rounded-2xl border border-austral-border bg-austral-bg/70 p-3"><p class="text-[11px] uppercase tracking-[0.18em] text-austral-text-muted">${label}</p><p class="text-lg font-bold text-white mt-1">${value ?? '—'}</p></div>`;
const statusClass = (status) => ({ running:'bg-austral-primary/15 text-austral-primary', success:'bg-emerald-400/15 text-emerald-300', failed:'bg-red-400/15 text-red-300', blocked:'bg-amber-400/15 text-amber-300', offline:'bg-slate-400/15 text-slate-300' }[status] || 'bg-white/10 text-austral-text-muted');

function normalizeAgentEvent(payload) {
  const agent = payload.agent || {};
  const event = payload.event || {};
  const metrics = payload.metrics || {};
  const progress = payload.progress || {};
  const io = payload.io || {};
  const previous = agentsState.agents.get(agent.id) || { samples: [] };
  const duration = Number(metrics.duration_ms || 0);
  return {
    id: agent.id || 'agent.unknown', name: agent.name || 'Unnamed agent', role: agent.role || 'custom', runtime: agent.runtime || 'custom', host: agent.host || 'unknown',
    status: event.status || 'ready', severity: event.severity || 'info', type: event.type || 'agent.message', msg: event.msg || 'Evento recebido',
    trace: payload.trace_id || 'trc_*', task: payload.task_id || 'tsk_*', step: payload.step_id || 'stp_*',
    progress: progress.percent, duration: metrics.duration_ms, memory: metrics.memory_mb,
    tokens: Number(metrics.tokens_in || 0) + Number(metrics.tokens_out || 0), cost: metrics.cost,
    files: Array.isArray(io.files) ? io.files : [], message: agent.message || previous.message || null,
    samples: duration > 0 ? [duration, ...(previous.samples || [])].slice(0, 24) : (previous.samples || []),
  };
}

function upsertAgentEvent(payload) {
  const agent = normalizeAgentEvent(payload);
  agentsState.agents.set(agent.id, agent);
  if (location.pathname === '/dashboard') rerender();
}

function componentContractHtml() {
  return `<section class="rounded-2xl border border-austral-border bg-austral-surface/60 p-5"><h2 class="text-xl font-heading font-bold text-white mb-2">Componentes declarados</h2><p class="text-sm text-austral-text-muted mb-4">Nome do componente e propriedade que entrega valor ao componente.</p><ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">${[['AgentGrid','agents'],['AgentSection','agent'],['RealtimeChart','samples'],['MetricTile','metric'],['CommandModal','agent_id'],['MessageOverlay','agent.message']].map(([c,p])=>`<li class="rounded-xl border border-austral-border bg-black/20 p-3"><span class="text-white font-semibold">${c}</span><span class="text-austral-text-muted"> ← ${p}</span></li>`).join('')}</ul></section>`;
}

function realtimeChartHtml() {
  const samples = [...agentsState.agents.values()].flatMap((agent) => agent.samples || []).slice(0, 24).reverse();
  const max = Math.max(1, ...samples);
  const bars = samples.length ? samples.map((sample) => `<div class="flex-1 rounded-t-lg bg-gradient-to-t from-austral-primary to-austral-pink min-w-2" style="height:${Math.max(8, (sample / max) * 100)}%" title="${sample}ms"></div>`).join('') : '<div class="w-full text-center text-austral-text-muted text-sm self-center">Sem métricas ainda</div>';
  return `<section class="rounded-3xl border border-austral-border bg-austral-surface/70 p-5"><div class="flex items-center justify-between gap-3 mb-4"><div><h2 class="text-xl font-heading font-bold text-white">Chart em tempo real</h2><p class="text-sm text-austral-text-muted">Atualiza a cada evento WebSocket usando metrics.duration_ms.</p></div><span class="text-xs text-austral-primary font-mono">${samples.length} samples</span></div><div class="h-40 flex items-end gap-1 rounded-2xl bg-black/30 border border-austral-border p-3">${bars}</div></section>`;
}

function agentSectionHtml(agent) {
  const miniMax = Math.max(1, ...(agent.samples || [1]));
  const mini = (agent.samples || []).slice(0, 10).reverse().map((sample) => `<div class="flex-1 rounded-full bg-austral-primary/70" style="height:${Math.max(6, (sample / miniMax) * 48)}px"></div>`).join('');
  const overlay = agent.message ? `<div data-agent-message="${sh(agent.id)}" class="absolute inset-0 z-10 flex items-center justify-center rounded-2xl p-4 text-center" style="background-color:#000;color:#fff;font-size:16px;font-weight:700">${sh(agent.message)}</div>` : '';
  return `<section class="relative overflow-hidden rounded-3xl border border-austral-border bg-austral-surface/80 p-4 sm:p-5 shadow-xl"><div class="flex items-start justify-between gap-3 mb-4"><div class="min-w-0"><p class="text-xs text-austral-primary font-mono truncate">${sh(agent.id)}</p><h3 class="text-xl font-heading font-bold text-white truncate">${sh(agent.name)}</h3><p class="text-sm text-austral-text-muted">${sh(agent.role)} · ${sh(agent.runtime)} · ${sh(agent.host)}</p></div><button data-command-agent="${sh(agent.id)}" class="min-h-12 px-5 rounded-2xl bg-austral-primary text-austral-bg font-extrabold active:scale-95">Comandar</button></div><div class="flex flex-wrap gap-2 mb-4"><span class="px-3 py-1 rounded-full text-xs font-bold ${statusClass(agent.status)}">${sh(agent.status)}</span><span class="px-3 py-1 rounded-full text-xs font-bold bg-austral-pink/15 text-austral-pink">${sh(agent.severity)}</span><span class="px-3 py-1 rounded-full bg-white/5 text-xs text-austral-text-muted">${sh(agent.type)}</span></div><div class="rounded-2xl border border-austral-border bg-black/20 p-4 mb-4"><p class="text-xs uppercase tracking-[0.2em] text-austral-primary mb-2">Último evento</p><p class="text-white font-semibold">${sh(agent.msg)}</p><p class="text-xs text-austral-text-muted mt-2">trace ${sh(agent.trace)} · task ${sh(agent.task)} · step ${sh(agent.step)}</p></div><div class="relative"><div class="grid grid-cols-2 gap-3">${metric('Progresso', agent.progress == null ? '—' : `${Math.round(agent.progress)}%`)}${metric('Duração', agent.duration == null ? '—' : `${Math.round(agent.duration)}ms`)}${metric('Memória', agent.memory == null ? '—' : `${Math.round(agent.memory)}MB`)}${metric('Tokens', agent.tokens)}${metric('Custo', agent.cost == null ? '—' : `$${agent.cost}`)}${metric('Arquivos', agent.files.length)}</div>${overlay}</div><div class="mt-4 h-14 flex items-end gap-1">${mini}</div></section>`;
}

function commandModalHtml() {
  if (!agentsState.modalAgent) return '';
  return `<div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6"><div class="w-full max-w-xl rounded-3xl border border-austral-border bg-austral-surface p-5 shadow-2xl"><div class="flex items-start justify-between gap-4 mb-4"><div><h2 class="text-2xl font-heading font-bold text-white">Comandar agent</h2><p class="text-sm text-austral-text-muted font-mono">${sh(agentsState.modalAgent)}</p></div><button data-close-command class="text-austral-text-muted hover:text-white text-2xl px-2">×</button></div><label class="text-sm font-semibold text-austral-primary">Prompt</label><textarea data-command-prompt rows="7" placeholder="Digite o comando para o agent..." class="mt-2 w-full rounded-2xl border border-austral-border bg-black/40 p-4 text-white outline-none focus:border-austral-primary">${sh(agentsState.prompt)}</textarea><div class="mt-4 grid grid-cols-2 gap-3"><button data-clear-command class="min-h-12 rounded-2xl border border-austral-border text-white font-bold">Limpar</button><button data-send-command class="min-h-12 rounded-2xl bg-austral-primary text-austral-bg font-extrabold">Enviar</button></div></div></div>`;
}

function agentsDashboardHtml() {
  const agents = [...agentsState.agents.values()];
  const grid = agents.length ? `<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">${agents.map(agentSectionHtml).join('')}</div>` : '<div class="rounded-3xl border border-dashed border-austral-border bg-austral-surface/40 p-8 text-center"><h3 class="text-2xl font-heading font-bold text-white mb-3">Aguardando eventos</h3><p class="text-austral-text-muted">Quando um JSON com agent.id chegar via WebSocket, uma nova section será criada automaticamente.</p></div>';
  return `<div class="space-y-8">${header('Multi-agent Observability','Dashboard em tempo real: cada novo agent.id recebido pelo WebSocket cria uma seção dinâmica; eventos posteriores atualizam apenas o card daquele agente.')}${componentContractHtml()}${realtimeChartHtml()}<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-austral-border bg-austral-surface/70 p-4"><div><p class="text-xs uppercase tracking-[0.25em] text-austral-primary font-bold">WebSocket</p><p class="text-white font-semibold">${agentsState.connected ? 'Tempo real ativo' : 'Conectando websocket'}</p></div><span class="text-austral-text-muted text-sm">${agents.length} agents observados</span></div>${grid}${commandModalHtml()}</div>`;
}

function connectAgentsWebSocketFallback() {
  if (agentsState.socketStarted || !('WebSocket' in window)) return;
  agentsState.socketStarted = true;
  let retryMs = 1000;
  const open = () => {
    const ws = new WebSocket(websocketUrl);
    ws.addEventListener('open', () => { agentsState.connected = true; retryMs = 1000; if (location.pathname === '/dashboard') rerender(); });
    ws.addEventListener('message', (event) => { try { upsertAgentEvent(JSON.parse(event.data)); } catch {} });
    ws.addEventListener('close', () => { agentsState.connected = false; if (location.pathname === '/dashboard') rerender(); window.setTimeout(open, retryMs); retryMs = Math.min(retryMs * 2, 15000); });
    ws.addEventListener('error', () => ws.close());
  };
  open();
}

function rerender() {
  const node = document.getElementById('root');
  if (node) node.innerHTML = `${nav()}${route()}`;
}

function route() {
  const path = location.pathname;
  if (path === '/blog') return shell(header('Austral Blog','Essays and proposals about linear types, security, resource governance and the Austral language.') + `<div class="grid md:grid-cols-2 gap-6 mt-10">${['Dawn of Linearity','The Language for Building Pyramids','Understanding the Use-Once Rule','Security Architecture Proposal','Secure-by-Design PQC','The Scuttle the Ship Philosophy'].map(t=>`<a href="/blog/article" class="block rounded-2xl border border-austral-border bg-austral-surface/70 p-6 hover:border-austral-pink transition"><h3 class="text-xl font-heading font-bold text-white mb-3">${t}</h3><p class="text-austral-text-muted">Read the archived article and continue the discussion around Austral's design.</p></a>`).join('')}</div>`);
  if (path === '/examples') return shell(header('Examples','Small Austral programs rendered by Elm components.') + `<div class="grid lg:grid-cols-2 gap-6 mt-10">${codeBlock('Hello.aui','module Hello is\n    function main(): Unit;\nend module.')}${codeBlock('Hello.aum','module body Hello is\n    function main(): Unit is\n        print("Hello, world!");\n        return nil;\n    end;\nend module body.')}${codeBlock('Result.aum','union Result[T: Free, E: Free]: Free is\n    case Success is\n        value: T;\n    case Failure is\n        error: E;\nend;')}${codeBlock('Memory.aum','let ptr: Address[Int32] := allocate(1);\n-- ... use pointer ...\ndeallocate(ptr);')}</div>`);
  if (path === '/projects') return shell(header('Projects','Reference projects and ecosystem experiments around Austral.') + `<div class="grid md:grid-cols-3 gap-6 my-6">${card('Austral compiler','Core compiler and specification work.')}${card('Aurora package hub','Registry, vault and publishing workflow.','text-austral-pink')}${card('vite.elm','The new Vite framework plugin and React-to-Elm converter powering this migration.')}</div>`);
  if (path === '/vault') return shell(header('Aurora Vault','A package index concept for Austral libraries and tools.') + `<div class="grid md:grid-cols-3 gap-6 my-6">${card('one-llm-4-all','Provider-rotation utilities for LLM integrations.')}${card('austral-memory','Safe memory governance primitives.','text-austral-pink')}${card('capability-kit','Capability-oriented application patterns.')}</div>`);
  if (path === '/dashboard') return shell(agentsDashboardHtml());
  if (path.startsWith('/blog/')) return shell(header('Blog article','The Elm migration keeps the static article catalog available. Markdown rendering can be reintroduced through Elm ports or precompiled content.') + codeBlock('vite.elm/converter','npm run convert:react -- --out converted-elm'));
  if (path.startsWith('/vault/')) return shell(header('Package details','Package detail routes are now served by Elm. Connect live package metadata through Elm flags or generated modules when the registry API is ready.'));
  return docs();
}

export const Elm = {
  Main: {
    init({ node }) {
      node.innerHTML = `${nav()}${route()}`;
      connectAgentsWebSocketFallback();
      document.addEventListener('input', (event) => {
        if (event.target.matches('[data-command-prompt]')) agentsState.prompt = event.target.value;
      });
      document.addEventListener('dblclick', (event) => {
        const overlay = event.target.closest('[data-agent-message]');
        if (!overlay) return;
        const agent = agentsState.agents.get(overlay.dataset.agentMessage);
        if (agent) agent.message = null;
        rerender();
      });
      document.addEventListener('click', async (event) => {
        const command = event.target.closest('[data-command-agent]');
        if (command) { agentsState.modalAgent = command.dataset.commandAgent; agentsState.prompt = ''; rerender(); return; }
        if (event.target.closest('[data-close-command]')) { agentsState.modalAgent = null; agentsState.prompt = ''; rerender(); return; }
        if (event.target.closest('[data-clear-command]')) { agentsState.prompt = ''; rerender(); return; }
        if (event.target.closest('[data-send-command]')) {
          try {
            await fetch(commandEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: agentsState.prompt, agent_id: agentsState.modalAgent }) });
          } catch {
            upsertAgentEvent({ agent: { id: agentsState.modalAgent, message: 'Envio falhou' }, event: { type: 'step.error', status: 'blocked', severity: 'error', msg: 'Envio falhou' } });
          }
          agentsState.modalAgent = null; agentsState.prompt = ''; rerender(); return;
        }
        const anchor = event.target.closest('a[href^="/"]');
        if (!anchor) return;
        event.preventDefault();
        history.pushState(null, '', anchor.getAttribute('href'));
        rerender();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      window.addEventListener('popstate', rerender);
      return {};
    },
  },
};
