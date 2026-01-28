'use client';

import Editor, { loader } from '@monaco-editor/react';

// Configure Monaco Loader to use CDN
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });

interface CodeEditorProps {
  language?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  height?: string;
}

export default function CodeEditor({
  language = 'python',
  defaultValue = '# Write your code here',
  value,
  onChange,
  height = '400px'
}: CodeEditorProps) {
  return (
    <div className="border border-onyx-800 rounded-xl overflow-hidden shadow-inner bg-[#1e1e1e]">
      <Editor
        height={height}
        defaultLanguage={language}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          padding: { top: 16, bottom: 16 },
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
        }}
      />
    </div>
  );
}
