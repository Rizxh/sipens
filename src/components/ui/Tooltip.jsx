import { useState } from 'react';

export default function Tooltip({ children, content, maxWidth = 220 }) {
  const [visible, setVisible] = useState(false);

  if (!content) return children;

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 rounded-lg bg-slate-800 text-white text-xs leading-relaxed shadow-xl pointer-events-none"
          style={{ width: maxWidth, padding: '8px 10px' }}
        >
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </span>
      )}
    </span>
  );
}
