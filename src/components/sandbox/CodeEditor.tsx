'use client';

import { useEffect, useRef } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { sql } from '@codemirror/lang-sql';
import { yaml } from '@codemirror/lang-yaml';
import { oneDark } from '@codemirror/theme-one-dark';
import { basicSetup } from 'codemirror';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'sql' | 'yaml';
  onRun?: () => void;
  readOnly?: boolean;
  height?: string;
}

export default function CodeEditor({
  value,
  onChange,
  language,
  onRun,
  readOnly = false,
  height = '200px',
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const langExtension = language === 'sql' ? sql() : yaml();

    const extensions = [
      basicSetup,
      langExtension,
      oneDark,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        '&': { height, fontSize: '13px' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-content': { fontFamily: 'var(--font-geist-mono), monospace' },
        '.cm-gutters': { backgroundColor: '#1e2028', borderRight: '1px solid #3f3f46' },
      }),
    ];

    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true));
    }

    if (onRun) {
      extensions.push(
        keymap.of([
          {
            key: 'Ctrl-Enter',
            mac: 'Cmd-Enter',
            run: () => {
              onRun();
              return true;
            },
          },
        ])
      );
    }

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, readOnly]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentValue = view.state.doc.toString();
    if (currentValue !== value) {
      view.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-700">
      <div className="flex items-center justify-between border-b border-zinc-700 bg-zinc-800/50 px-3 py-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          {language === 'sql' ? 'SQL' : 'YAML'}
        </span>
        {onRun && (
          <span className="text-[10px] text-zinc-500">
            {navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enter to run
          </span>
        )}
      </div>
      <div ref={containerRef} />
    </div>
  );
}
