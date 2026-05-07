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
  <h3 id={id} className="text-lg font-heading font-semibold text-austral-accent mt-8 mb-3">{children}</h3>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-austral-text-muted leading-relaxed mb-4">{children}</p>
);
const Quote = ({ children, author }: { children: React.ReactNode; author?: string }) => (
  <blockquote className="spec-blockquote my-6">
    <p className="mb-2">{children}</p>
    {author && <p className="text-sm not-italic text-austral-accent-2">— {author}</p>}
  </blockquote>
);
const Kw = ({ children }: { children: React.ReactNode }) => (
  <code className="px-1.5 py-0.5 bg-austral-accent/10 text-austral-accent rounded text-sm font-mono">{children}</code>
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
            <span className="text-austral-text-muted">By <span className="text-austral-accent"><a href="https://borretti.me" target="_blank">Fernando Borretti</a></span></span>
          </div>
        </div>
        <div className="glow-line mt-20 max-w-2xl mx-auto opacity-50" />
      </section>

      {/* Introduction */}
      <Section id="intro">
        <H1>Introduction</H1>
        <Quote author="Jorge Luis Borges, El Zahir">Time, which attenuates all memories, sharpens that of the Zahir.</Quote>
        <P>Austral is a new programming language. It is designed to enable writing code that is secure, readable, maintainable, robust, and long-lasting.</P>
        <P>Most systems programming languages are either unsafe (like C and C++) or rely on complex automated proof systems or garbage collectors. Austral takes a different path: using simple type system features like linear types and capability-based security to achieve memory safety and resource management without runtime overhead or unpredictable heuristics.</P>
      </Section>

      {/* Design Goals */}
      <Section id="goals">
        <H1>Design Goals</H1>
        <P>This section lists the design goals for Austral, and justifies them.</P>
        <div className="space-y-12 my-12">
          {[
            { icon: <Layers size={24} />, title: 'Simplicity', desc: 'The language must be simple enough for a single person to hold the entire specification in their head. This "fits-in-head" simplicity rules out features like garbage collection or complex static analysis heuristics.', extra: 'Simplicity is measured by Kolmogorov complexity: a system is simple when its description is brief.' },
            { icon: <Shield size={24} />, title: 'Correctness', desc: 'If the code compiles, it should work. 80% of correctness comes from strong, static typing and ADTs. The remaining 20% is provided by linear types, ensuring absolute resource safety.', extra: 'Exhaustiveness checking for pattern matching is a non-negotiable pillar.' },
            { icon: <Lock size={24} />, title: 'Security', desc: 'Global state and ambient authority are the enemies of security. Austral uses capability-based security to restrict side effects and sensitive resource access.', extra: 'Memory safety is achieved through linear types, preventing 70% of modern vulnerabilities.' },
            { icon: <Eye size={24} />, title: 'Readability', desc: 'Code is read far more often than it is written. Austral optimizes for the reader by being explicit rather than implicit, and verbose rather than concise.', extra: 'No type inference (except generics), no implicit conversions, and no operator overloading.' },
            { icon: <Wrench size={24} />, title: 'Maintainability', desc: 'Software should last decades. We avoid "moving targets" and prioritize a stable, well-defined core that doesn\'t break over time.', extra: 'Separate compilation and a strong module system are essential for scaling.' },
            { icon: <Zap size={24} />, title: 'Strictness', desc: 'Austral is for building pyramids: strict, rigid, crystalline, and brittle by design. It is not for exploratory scripting.', extra: 'The language forces discipline to produce understandable and maintainable artifacts.' }
          ].map((g, i) => (
            <div key={i} className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-austral-primary/20 to-austral-pink/20 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000" />
              <div className="relative bg-austral-surface border border-austral-border rounded-2xl p-8 leading-relaxed">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-austral-accent/10 flex items-center justify-center text-austral-accent group-hover:scale-110 transition-transform duration-500">{g.icon}</div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-white mb-3 tracking-tight">{g.title}</h3>
                    <p className="text-austral-text-muted mb-4">{g.desc}</p>
                    <p className="text-sm text-austral-accent-2/80 font-medium italic border-l-2 border-austral-accent/30 pl-4 py-1">{g.extra}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Rationale */}
      <Section id="rationale">
        <H1>Rationale</H1>
        <P>This section explains and justifies the design of Austral.</P>
        
        <H2 id="rationale-syntax">Syntax</H2>
        <P>Austral syntax follows a statement-oriented, keyword-heavy philosophy inspired by Ada and Modula-3. Each block naming its terminator (e.g., <Kw>end if</Kw>) allows the compiler to provide superior error messages compared to brace-based languages.</P>
        <CodeBlock language="rust" filename="logic.aum" code={`if condition then
    for i from 0 to n do
        doSomething();
    end for;
end if;`} />

        <H2 id="rationale-errors">Error Handling</H2>
        <P>Austral does not have exceptions. Instead, it uses sum types (Unions) to represent failure explicitly, similar to Rust's <Kw>Result</Kw> or Haskell's <Kw>Either</Kw>.</P>
        
        <H2 id="rationale-capabilities">Capability-Based Security</H2>
        <P>The language eliminates ambient authority. Access to sensitive resources (like the filesystem or network) requires a <span className="text-white">capability token</span>, which must be passed explicitly from the program entry point.</P>
      </Section>

      {/* Syntax */}
      <Section id="syntax">
        <H1>Syntax</H1>
        <H2 id="syntax-meta">Meta-Language</H2>
        <P>The syntax is defined using a variant of BNF. Non-terminal symbols are in italics, terminals are in monospace.</P>

        <H2 id="syntax-lexical">Lexical Structure</H2>
        <H3 id="syntax-identifiers">Identifiers</H3>
        <P>Identifiers are used to name modules, types, functions, and variables. They consist of a letter followed by any number of letters, digits, or underscores.</P>
        <div className="bg-austral-surface/50 border border-austral-border p-4 rounded-xl font-mono text-sm mb-6">
           <span className="text-austral-accent-2">identifier</span> ::= [a-zA-Z] [a-zA-Z0-9_]*
        </div>

        <H3 id="syntax-keywords">Keywords</H3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 my-6">
           {['module', 'body', 'import', 'as', 'type', 'record', 'union', 'case', 'is', 'end', 'function', 'generic', 'val', 'var', 'let', 'if', 'then', 'else', 'for', 'from', 'to', 'do', 'while', 'return', 'borrow', 'discard', 'sizeof', 'not', 'and', 'or', 'nil', 'true', 'false'].map(kw => (
             <div key={kw} className="px-3 py-1.5 bg-austral-surface border border-austral-border rounded text-center text-xs font-mono text-austral-accent">
                {kw}
             </div>
           ))}
        </div>

        <H3 id="syntax-literals">Literals</H3>
        <div className="space-y-4 my-6">
           <div className="p-4 rounded-xl bg-austral-surface border border-austral-border">
              <h4 className="text-sm font-bold text-white mb-2">Integer Literals</h4>
              <CodeBlock language="rust" code={`let a: Int32 := 123;
let b: Int32 := 0x7B; -- Hex
let c: Int32 := 0o173; -- Octal
let d: Int32 := 0b1111011; -- Binary`} />
           </div>
           <div className="p-4 rounded-xl bg-austral-surface border border-austral-border">
              <h4 className="text-sm font-bold text-white mb-2">Strings</h4>
              <CodeBlock language="rust" code={`let s: String := "Hello, \"Austral\"!\n";
let c: Char := 'A';`} />
           </div>
        </div>
      </Section>

      {/* Module System */}
      <Section id="modules">
        <H1>Module System</H1>
        <P>Austral modules consist of an interface (<Kw>.aui</Kw>) and a body (<Kw>.aum</Kw>).</P>
        
        <H2 id="module-interfaces">Interfaces (.aui)</H2>
        <P>The interface declares the public API: opaque types, function signatures, and constants.</P>
        <CodeBlock language="rust" filename="Stack.aui" code={`module Stack is
    type Stack[T: Free]: Free;
    generic [T: Free]
    function empty(): Stack[T];
    generic [T: Free]
    function push(s: Stack[T], val: T): Stack[T];
end module.`} />

        <H2 id="module-bodies">Bodies (.aum)</H2>
        <P>The body contains the implementations and private declarations.</P>
        <CodeBlock language="rust" filename="Stack.aum" code={`module body Stack is
    record Stack[T: Free]: Free is
        items: Array[T];
    end;
    -- implementation of functions...
end module body.`} />
      </Section>

      {/* Type System */}
      <Section id="types">
        <H1>Type System</H1>
        <H2 id="type-universes">Type Universes</H2>
        <P>Every type belongs to either the <Kw>Free</Kw> or <Kw>Linear</Kw> universe.</P>
        <div className="grid sm:grid-cols-2 gap-6 my-6">
          <div className="bg-austral-surface border border-austral-border rounded-xl p-6">
            <h4 className="font-heading font-semibold text-austral-accent mb-2">Free Universe</h4>
            <p className="text-sm text-austral-text-muted">Can be copied and discarded. Includes primitive types and structures of free types.</p>
          </div>
          <div className="bg-austral-surface border border-austral-border rounded-xl p-6">
            <h4 className="font-heading font-semibold text-austral-accent-2 mb-2">Linear Universe</h4>
            <p className="text-sm text-austral-text-muted">Must be consumed exactly once. Used for resources like file handles or memory buffers.</p>
          </div>
        </div>

        <H2 id="type-builtin">Built-in Types</H2>
        <div className="grid sm:grid-cols-2 gap-4 my-8">
           {[
             { name: 'Unit', desc: 'Single value: nil.' },
             { name: 'Boolean', desc: 'true or false.' },
             { name: 'Integer8..64', desc: 'Signed integers.' },
             { name: 'Natural8..64', desc: 'Unsigned integers.' },
             { name: 'Float32, 64', desc: 'IEEE 754 floats.' },
             { name: 'Char', desc: 'Unicode character.' }
           ].map(t => (
             <div key={t.name} className="p-4 rounded-xl bg-austral-surface border border-austral-border">
                <h4 className="font-mono text-austral-accent mb-1">{t.name}</h4>
                <p className="text-xs text-austral-text-muted">{t.desc}</p>
             </div>
           ))}
        </div>

        <H2 id="type-records">Records</H2>
        <CodeBlock language="rust" filename="User.aum" code={`record User: Free is
    id: Int32;
    username: String;
end;`} />

        <H2 id="type-unions">Unions</H2>
        <CodeBlock language="rust" filename="Option.aum" code={`union Option[T: Free]: Free is
    case Some is
        value: T;
    case None;
end;`} />
      </Section>

      {/* Linear Types */}
      <Section id="linear-types">
        <H1>Linear Types</H1>
        <P>Resource-aware types that remove categories of errors like leaks and use-after-free.</P>
        
        <H2 id="linear-lifecycle">Resource Lifecycle</H2>
        <div className="my-8 flex flex-col items-center">
          <div className="bg-austral-surface/50 border border-austral-border rounded-2xl p-8 w-full max-w-2xl relative overflow-hidden">
            <div className="flex flex-col items-center gap-12 relative py-4">
              <div className="w-40 h-12 rounded-full border-2 border-austral-accent flex items-center justify-center bg-austral-accent/5 font-mono text-sm text-white relative z-10">
                openFile
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-austral-accent" />
              </div>
              <div className="w-40 h-12 rounded-full border-2 border-austral-accent flex items-center justify-center bg-austral-accent/5 font-mono text-sm text-white relative z-10">
                writeString
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-austral-accent" />
              </div>
              <div className="w-40 h-12 rounded-full border-2 border-austral-accent-3 flex items-center justify-center bg-austral-accent-3/5 font-mono text-sm text-white relative z-10">
                closeFile
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-austral-text-muted italic">Figure: Linear resource lifecycle (Open → Use → Close)</p>
        </div>

        <P>A linear value cannot be discarded (causing a leak) and cannot be used after it is consumed (use-after-free).</P>
      </Section>

      {/* Declarations */}
      <Section id="declarations">
        <H1>Declarations</H1>
        <H2 id="decl-constants">Constants</H2>
        <CodeBlock language="rust" code={`constant PI: Float64 := 3.14159;`} />
        <H2 id="decl-functions">Functions</H2>
        <CodeBlock language="rust" code={`function add(a: Int32, b: Int32): Int32 is
    return a + b;
end;`} />
      </Section>

      {/* Statements */}
      <Section id="statements">
        <H1>Statements</H1>
        <H2 id="stmt-let">Let</H2>
        <CodeBlock language="rust" code={`let x: Int32 := 10;`} />
        <H2 id="stmt-if">If</H2>
        <CodeBlock language="rust" code={`if x > 0 then ... else ... end if;`} />
        <H2 id="stmt-borrow">Borrow</H2>
        <CodeBlock language="rust" code={`borrow resource as r in
    -- r is a reference, resource is not consumed yet
end borrow;`} />
      </Section>

      {/* Linearity Checking */}
      <Section id="linearity">
        <H1>Linearity Checking</H1>
        <P>The compiler verifies that every linear value is consumed exactly once along every possible execution path.</P>
        <ul className="list-disc list-inside space-y-2 text-austral-text-muted my-6">
           <li><span className="text-white">Consumption</span> occurs when a value is passed to a function or returned.</li>
           <li><span className="text-white">Borrowing</span> allows temporary access without consumption.</li>
        </ul>
      </Section>

      {/* Standard Library */}
      <Section id="stdlib">
        <H1>Standard Library</H1>
        <P>Core modules include <Kw>Austral.Memory</Kw> and <Kw>Austral.Pervasive</Kw>.</P>
      </Section>

      {/* FFI */}
      <Section id="ffi">
        <H1>Foreign Interfaces</H1>
        <P>Interoperability with C through <Kw>pragma Foreign_Import</Kw>.</P>
        <CodeBlock language="rust" filename="ffi.aum" code={`pragma Foreign_Import(External_Name => "puts");
function puts(str: Address[Nat8]): Int32;`} />
      </Section>

      {/* Style Guide */}
      <Section id="style">
        <H1>Style Guide</H1>
        <ul className="list-disc list-inside space-y-2 text-austral-text-muted my-4">
           <li><Kw>PascalCase</Kw> for types.</li>
           <li><Kw>camelCase</Kw> for functions/variables.</li>
           <li><Kw>SCREAMING_SNAKE_CASE</Kw> for constants.</li>
        </ul>
      </Section>

      {/* Footer */}
      <footer className="mt-24 pt-8 border-t border-austral-border text-center text-sm text-austral-text-muted pb-12">
        <p className="mb-2">The Austral Language Specification — Fernando Borretti</p>
        <p>Licensed under the GNU Free Documentation License</p>
      </footer>
    </div>
  );
}
