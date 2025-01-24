/* eslint-disable @typescript-eslint/consistent-type-assertions */
import type { EditorView, ViewUpdate } from '@codemirror/view';
import { ViewPlugin } from '@codemirror/view';
import type { Editor, EditorPosition } from 'obsidian';
import type PopkitPlugin from './Plugin';
import PopoverManager, { clearPopover } from './render';

export function popoverPlugin(plugin: PopkitPlugin) {
  return ViewPlugin.fromClass(class {
    private isMouseSelection: boolean = false;
    private mouseDown: boolean = false;

    constructor(private view: EditorView) {
      // 监听鼠标事件
      this.view.dom.addEventListener('mousedown', () => {
        this.mouseDown = true;
      });

      this.view.dom.addEventListener('mousemove', () => {
        if (this.mouseDown) {
          this.isMouseSelection = true;
        }
      });

      this.view.dom.addEventListener('mouseup', () => {
        this.mouseDown = false;
      });

      // 监听键盘事件，重置鼠标选择状态
      this.view.dom.addEventListener('keydown', () => {
        this.isMouseSelection = false;
        this.mouseDown = false;
      });
    }

    createEditor(selectedText: string, selection: { from: number; to: number; }): Editor {
      const offsetToPos = (offset: number): EditorPosition => {
        const clampedOffset = Math.min(Math.max(0, offset), this.view.state.doc.length);
        const line = this.view.state.doc.lineAt(clampedOffset);
        return {
          line: line.number - 1,
          ch: clampedOffset - line.from,
        } as EditorPosition;
      };

      const posToOffset = (pos: EditorPosition): number => {
        if (pos.line < 0) return 0;
        const line = this.view.state.doc.line(pos.line + 1);
        if (pos.ch < 0) {
          return line.from + Math.max(0, line.length + pos.ch);
        }
        return line.from + Math.min(pos.ch, line.length);
      };

      return {
        somethingSelected: () => true,
        getSelection: () => selectedText,
        getCursor: () => {
          const pos = this.view.state.selection.main.head;
          const line = this.view.state.doc.lineAt(pos);
          return {
            line: line.number - 1,
            ch: pos - line.from,
          } as EditorPosition;
        },
        posAtDOM: (x: number, y: number): number => {
          const pos = this.view.posAtCoords({ x, y });
          return pos ?? selection.to;
        },
        containerEl: this.view.dom,
        coordsAtPos: (pos: EditorPosition) => {
          const offset = posToOffset(pos);
          return this.view.coordsAtPos(offset);
        },
        posToOffset,
        offsetToPos,
        cm: this.view,
      } as unknown as Editor;
    }

    update = (update: ViewUpdate): void => {
      // 检查是否有真正的选择变化
      const hasSelectionChange = update.transactions.some(tr => tr.selection);

      if (hasSelectionChange) {
        const selection = this.view.state.selection.main;
        const selectedText = selection.empty ? '' : this.view.state.sliceDoc(selection.from, selection.to);
        // 如果有选中内容，并且满足鼠标选择的要求
        if (selectedText && (!plugin.settings.mouseSelectionOnly || this.isMouseSelection)) {
          const editor = this.createEditor(selectedText, selection);
          new PopoverManager(editor, plugin.app, plugin.settings);
        }
        else {
          clearPopover();
        }
        // 如果是键盘选择，重置鼠标选择状态
        if (!this.isMouseSelection) {
          this.mouseDown = false;
        }
      }
    };
  });
}
