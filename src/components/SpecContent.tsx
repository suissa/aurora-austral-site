import Section from './Section';
import CodeBlock from './CodeBlock';
import { Shield, Layers, BookOpen, Lock, Eye, Wrench, Box, Zap, FileCode } from 'lucide-react';

const H1 = ({ id, children }: { id?: string; children: React.ReactNode }) => (
  <h1 id={id} className="text-3xl sm:text-4xl font-heading font-bold text-white mb-6 tracking-tight">
    <span className="bg-gradient-to-br from-austral-primary to-austral-pink bg-clip-text text-transparent">{children}</span>
  </h1>
);
const H2 = ({ id, children }: { id?: string; children: React.ReactNode }) => (
  <h2 id={id} className="text-2xl font-heading font-semibold text-white mt-12 mb-4 flex items-center gap-2">
    <span className="w-1 h-6 rounded bg-gradient-to-br from-austral-primary to-austral-pink inline-block" />
    {children}
  </h2>
);
const H3 = ({ id, children }: { id?: string; children: React.ReactNode }) => (
  <h3 id={id} className="text-lg font-heading font-semibold text-austral-primary mt-8 mb-3">{children}</h3>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-austral-text-muted leading-relaxed mb-4">{children}</p>
);
const Quote = ({ children, author }: { children: React.ReactNode; author?: string }) => (
  <blockquote className="spec-blockquote my-6">
    <p className="mb-2">{children}</p>
    {author && <p className="text-sm not-italic text-austral-pink">— {author}</p>}
  </blockquote>
);
const Kw = ({ children }: { children: React.ReactNode }) => (
  <code className="px-1.5 py-0.5 bg-austral-primary/10 text-austral-primary rounded text-sm font-mono">{children}</code>
);

export default function SpecContent() {
  return (
    <div className="flex-1 min-w-0 pb-24">
      {/* Hero Section */}
      <section className="relative py-20 pt-2 mb-20 text-center animate__animated animate__fadeIn">
        <img src="/logo.png" alt="Austral Logo" className="w-[80%] max-w-[400px] mx-auto mb-2 logo-float" />
        <div className="relative">
          <p className="text-2xl text-austral-text-muted max-w-3xl mx-auto mb-6 leading-relaxed px-4">
            A systems programming language with <span className="text-white font-semibold">linear types</span> and <span className="text-white font-semibold">capability-based security</span>.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <span className="text-austral-text-muted">By <span className="text-austral-primary"><a href="https://borretti.me" target="_blank">Fernando Borretti</a></span></span>
          </div>
        </div>
        <div className="glow-line mt-20 max-w-2xl mx-auto opacity-50" />
      </section>

      {/* Quick Tour - Anchoring Philosophy in Practice */}
      <Section id="quick-tour">
        <H1>Quick Tour: The Power of Linearity</H1>
        <P>Before diving into the theory, let's see why Austral's strictness is your greatest ally. Imagine managing a file. In most languages, forgetting to close it is a common bug. In Austral, it's a <strong>compilation error</strong>.</P>
        
        <div className="my-12 bg-austral-surface/30 border border-austral-border/50 rounded-2xl p-8 backdrop-blur-sm">
          <H2 id="practical-lifecycle">The Resource Lifecycle</H2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <P>The compiler tracks the state of the <Kw>File</Kw> object. Because it is a <strong>Linear Type</strong>, you must consume it exactly once. Opening a file creates the obligation to close it.</P>
              <CodeBlock language="rust" filename="main.aum" code={`let f1: File := openFile(cap, "data.txt");
-- We 'thread' the file through operations
let f2: File := writeString(f1, "Hello Austral!");
-- If we stop here, the compiler errors: 'f2' is leaked
closeFile(f2); -- Obligation met.`} />
            </div>
            <div className="flex flex-col items-center gap-8 py-4 bg-black/20 rounded-xl border border-white/5">
              <div className="w-40 h-10 rounded-full border-2 border-austral-primary flex items-center justify-center bg-austral-primary/5 font-mono text-xs text-white relative">
                openFile
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-austral-primary" />
              </div>
              <div className="w-40 h-10 rounded-full border-2 border-austral-primary flex items-center justify-center bg-austral-primary/5 font-mono text-xs text-white relative">
                writeString
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-austral-primary" />
              </div>
              <div className="w-40 h-10 rounded-full border-2 border-austral-pink flex items-center justify-center bg-austral-pink/5 font-mono text-xs text-white">
                closeFile
              </div>
              <p className="text-[10px] text-austral-text-muted italic">Linear Resource Pipeline</p>
            </div>
          </div>
        </div>
        <P>This "strictness" isn't a hurdle; it's <strong>Peace of Mind</strong>. It's the difference between a car that lets you drive off a cliff and one with autonomous emergency braking that saves your life.</P>
      </Section>

      {/* Introduction */}
      <Section id="intro">
        <H1>Introduction</H1>
        <Quote author="Jorge Luis Borges, El Zahir">Time, which attenuates all memories, sharpens that of the Zahir.</Quote>
        <P>Austral is designed for building software that lasts decades. It achieves memory safety and resource management without the overhead of a garbage collector or the complexity of borrow checkers, by using two fundamental pillars: <strong>Linear Types</strong> and <strong>Capability-Based Security</strong>.</P>
      </Section>

      {/* Design Goals */}
      <Section id="goals">
        <H1>Design Goals</H1>
        <P>These principles guide every decision in Austral's design.</P>
        <div className="space-y-12 my-12">
          {[
            { icon: <Layers size={24} />, title: 'Simplicity', desc: 'The language must be simple enough for a single person to hold the entire specification in their head. This rules out unpredictable heuristics.', extra: 'Simplicity is measured by Kolmogorov complexity.' },
            { icon: <Shield size={24} />, title: 'Correctness', desc: 'If the code compiles, it should work. Static typing and exhaustiveness checking are non-negotiable.', extra: 'Linear types provide absolute resource safety.' },
            { icon: <Lock size={24} />, title: 'Security', desc: 'Global state is the enemy. Access to sensitive resources requires explicit capability tokens.', extra: 'Memory safety is the default, preventing 70% of modern vulnerabilities.' },
            { icon: <Eye size={24} />, title: 'Readability', desc: 'Code is read far more often than written. We optimize for the reader by being explicit and verbose.', extra: 'No hidden control flow, no implicit conversions.' },
            { icon: <Wrench size={24} />, title: 'Stability', desc: 'Software should last decades. We avoid "moving targets" and prioritize a stable core.', extra: 'Separate compilation ensures scalability.' },
            { icon: <Zap size={24} />, title: 'Predictability', desc: 'Austral is for building pyramids: intransigently stable, resilient, and crystalline. It is not for exploratory scripting.', extra: 'The rigidity provides the peace of mind that the structure will not fail.' }
          ].map((g, i) => (
            <div key={i} className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-austral-primary/20 to-austral-pink/20 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000" />
              <div className="relative bg-austral-surface border border-austral-border rounded-2xl p-8 leading-relaxed">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-austral-primary/10 flex items-center justify-center text-austral-primary group-hover:scale-110 transition-transform duration-500">{g.icon}</div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-white mb-3 tracking-tight">{g.title}</h3>
                    <p className="text-austral-text-muted mb-4">{g.desc}</p>
                    <p className="text-sm text-austral-pink/80 font-medium italic border-l-2 border-austral-primary/30 pl-4 py-1">{g.extra}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Type System & Rationale Integration */}
      <Section id="types">
        <H1>The Type System</H1>
        <P>Every type in Austral belongs to a <strong>Universe</strong>. This is the foundation of our safety model.</P>
        <div className="grid sm:grid-cols-2 gap-6 my-6">
          <div className="bg-austral-surface border border-austral-border rounded-xl p-6">
            <h4 className="font-heading font-semibold text-austral-primary mb-2">Free Universe</h4>
            <p className="text-sm text-austral-text-muted">Types that can be copied or discarded freely. Examples: integers, booleans, simple records.</p>
          </div>
          <div className="bg-austral-surface border border-austral-border rounded-xl p-6">
            <h4 className="font-heading font-semibold text-austral-pink mb-2">Linear Universe</h4>
            <p className="text-sm text-austral-text-muted">Types representing exclusive resources. Must be consumed exactly once. Prevents leaks and double-frees.</p>
          </div>
        </div>

        <H2 id="rationale-errors">Error Handling Philosophy</H2>
        <P>Austral does not have exceptions. Why? Because exceptions introduce "invisible" control flow paths that make it impossible to reason about resource safety. Instead, we use <strong>Sum Types (Unions)</strong>.</P>
        <CodeBlock language="rust" filename="Result.aum" code={`union Result[T: Free, E: Free]: Free is
    case Success is
        value: T;
    case Failure is
        error: E;
end;`} />
        <P>This forces you to handle the error path <em>at the call site</em>, making the code's behavior predictable and transparent.</P>
      </Section>

      {/* Syntax */}
      <Section id="syntax">
        <H1>Syntax</H1>
        <P>Inspired by Ada and Modula-3, Austral uses a keyword-heavy syntax that favors clarity over brevity.</P>
        <H2 id="syntax-meta">Declarations</H2>
        <CodeBlock language="rust" filename="logic.aum" code={`if condition then
    for i from 0 to n do
        doSomething();
    end for;
end if;`} />
        <P>Naming the end of each block (e.g., <Kw>end if</Kw>) prevents the "cascading braces" problem and allows the compiler to provide much clearer error messages.</P>
      </Section>

      {/* Linear Types */}
      <Section id="linear-types">
        <H1>Linear Types In-Depth</H1>
        <P>Linearity is not just a feature; it's a governance protocol for memory.</P>
        <H2 id="linear-destructuring">Destructuring</H2>
        <P>To access the fields of a linear record, you must <strong>destructure</strong> it. This consumes the record and gives you ownership of its parts.</P>
        <CodeBlock language="rust" code={`let { handle, path } := file;
-- 'file' is now consumed. We have 'handle' and 'path'.`} />
      </Section>

      {/* FFI & The Trust Boundary */}
      <Section id="ffi">
        <H1>Foreign Function Interface (FFI)</H1>
        <P>No language is an island. Austral interacts with C, but it does so through a strict <strong>Trust Boundary</strong>.</P>
        
        <H2 id="ffi-boundary">The Linear Wrapper Pattern</H2>
        <P>The goal of FFI in Austral is to take "unsafe" C handles and wrap them in "safe" Linear types. This ensures that the client of your module cannot leak the resource, even if the underlying C library doesn't care.</P>
        
        <div className="bg-austral-surface/50 border border-austral-border rounded-xl p-8 my-8">
          <h3 className="text-xl font-bold text-white mb-4">Guideline: The Safe Wrapper Path</h3>
          <ol className="list-decimal list-inside space-y-4 text-austral-text-muted">
            <li>
              <strong className="text-austral-primary">Import the Raw Symbol:</strong> Use <Kw>pragma Foreign_Import</Kw> to bring in the C function.
            </li>
            <li>
              <strong className="text-austral-primary">Define a Linear Wrapper:</strong> Create a linear record in your module's interface that holds the raw pointer.
            </li>
            <li>
              <strong className="text-austral-primary">Handle Nulls Immediately:</strong> If C returns a null pointer, convert it to an <Kw>Option</Kw> or <Kw>Result</Kw> immediately at the boundary. Never let a raw null escape into the rest of your Austral code.
            </li>
            <li>
              <strong className="text-austral-primary">Encapsulate Unsafe:</strong> Mark your module body as <Kw>unsafe</Kw>, but keep the interface <Kw>safe</Kw>.
            </li>
          </ol>
        </div>

        <CodeBlock language="rust" filename="C_Wrapper.aum" code={`-- 1. Import
pragma Foreign_Import(External_Name => "malloc");
function c_malloc(size: SizeT): Address[Nat8];

-- 2. Wrap linearly
record Buffer: Linear is
    ptr: Address[Nat8];
end;

-- 3. The Safe Boundary
function allocate(size: SizeT): Option[Buffer] is
    let p: Address[Nat8] := c_malloc(size);
    if is_null(p) then
        return None();
    else
        return Some(Buffer(ptr => p));
    end if;
end;`} />
      </Section>

      {/* Footer */}
      <footer className="mt-24 pt-8 border-t border-austral-border text-center text-sm text-austral-text-muted pb-12">
        <p className="mb-2">The Austral Language Specification — Fernando Borretti</p>
        <p>Licensed under the GNU Free Documentation License</p>
      </footer>
    </div>
  );
}

