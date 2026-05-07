import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export default function CodeBlock({ code, language = 'rust', filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="code-ide my-6 group">
      <div className="code-ide-header">
        <div className="flex items-center gap-3">
          <div className="code-dots">
            <span /><span /><span />
          </div>
          {filename && (
            <span className="text-xs text-austral-text-muted font-mono">{filename}</span>
          )}
          {!filename && language && (
            <span className="text-xs text-austral-text-muted font-mono uppercase tracking-wider">{language}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-austral-text-muted hover:text-austral-primary transition-colors px-2 py-1 rounded hover:bg-white/5"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} className="text-austral-pink" />
              <span className="text-austral-pink">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
            </>
          )}
        </button>
      </div>
      <Highlight theme={themes.nightOwl} code={code.trim()} language={language as any}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre style={{ ...style, background: 'transparent' }} className="overflow-x-auto p-4 text-[13.5px] leading-relaxed font-mono">
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="table-row">
                <span className="table-cell pr-4 text-right select-none text-austral-text-muted/30 text-xs w-8">{i + 1}</span>
                <span className="table-cell">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
