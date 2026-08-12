import React from 'react';

/**
 * LaTeXRenderer
 * Safely parses and renders standard text and KaTeX/LaTeX math expressions.
 * Formats inline math `$ ... $` and display math `$$ ... $$`.
 */
export const LaTeXRenderer = ({ content, className = '' }) => {
  if (!content) return null;

  // Split content by LaTeX math delimiters $...$ or $$...$$
  const parts = content.split(/(\$\$.*?\$\$|\$.*?\$)/g);

  return (
    <span className={`inline-wrap ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Display math $$...$$
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2);
          return (
            <span
              key={index}
              className="block my-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-mono text-center font-bold overflow-x-auto"
            >
              {math}
            </span>
          );
        }

        // Inline math $...$
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          return (
            <span
              key={index}
              className="inline-block px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono text-xs font-bold mx-0.5"
            >
              {math}
            </span>
          );
        }

        // Normal text
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
