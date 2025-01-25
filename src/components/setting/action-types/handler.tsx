import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import type { HandlerParams } from 'src/types';

interface HandlerFormProps {
  value: string;
  onChange: (value: string) => void;
}

// 默认代码模板
function getDefaultValue(): string {
  return `async function handler(context: HandlerParams) {
  const {
    app,      // Obsidian App instance
    editor,   // Current editor
    replace,  // Replace selection with text
    getMarkdown, // Get current markdown content
    selection,   // Current selection text
    action,   // Current action config
  } = context;

  // Write your code here
  
}`;
}

const HandlerForm: FC<HandlerFormProps> = ({
  value,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!containerRef.current || initialized.current) return;

    // 创建编辑器
    const monacoEditor = monaco.editor.create(containerRef.current, {
      value: value || getDefaultValue(),
      language: 'typescript',
      theme: 'vs-dark',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      glyphMargin: false,
      folding: true,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 3,
      tabSize: 2,
      wordWrap: 'on',
      wrappingStrategy: 'advanced',
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        useShadows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
      fontSize: 14,
      fontFamily: 'var(--font-monospace)',
      padding: { top: 8, bottom: 8 },
    });

    editorRef.current = monacoEditor;
    initialized.current = true;

    // 监听内容变化
    const disposable = monacoEditor.onDidChangeModelContent(() => {
      const newValue = monacoEditor.getValue();
      onChange(newValue);
    });

    // 清理函数
    return () => {
      disposable.dispose();
      monacoEditor.dispose();
      editorRef.current = null;
      initialized.current = false;
    };
  }, [value, onChange]);

  return (
    <div className="setting-item setting-item-heading" style={{ display: 'block', padding: '24px 0' }}>
      <div className="setting-item-info" style={{ marginBottom: 12 }}>
        <div className="setting-item-name">Handler</div>
        <div className="setting-item-description">
          Write your custom handler code here. You can use the context parameter to access
          editor, app, and other utilities.
        </div>
      </div>
      <div
        style={{
          backgroundColor: 'var(--background-primary)',
          border: '1px solid var(--background-modifier-border)',
          borderRadius: 'var(--radius-s)',
          width: '100%',
          height: 400,
        }}
        className="setting-item-control"
      >
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default HandlerForm;
