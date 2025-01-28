import type { App, Editor } from 'obsidian';
import Popover from './components/Popover';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import type { ISetting } from './types';

const instanceList: PopoverManager[] = [];

export default class PopoverManager {
  el: HTMLElement;
  root: Root;
  destroying: boolean = false;
  editor: Editor;
  constructor(editor: Editor, app: App, settings: ISetting) {
    const sameInstance = instanceList.find(instance => instance.editor.containerEl === editor.containerEl);
    try {
      instanceList.forEach(instance => {
        if (instance.editor.containerEl !== editor.containerEl) {
          instance.destroy();
        }
      });
    }
    catch (error) {
      console.warn(error);
    }
    if (!sameInstance) {
      this.editor = editor;
      instanceList.push(this);
      const out = editor.containerEl.find('.cm-scroller');
      /* @ts-igonre */
      this.el = out.createDiv({
        cls: ['popkit-popover'],
      });
      this.root = createRoot(this.el);
      this.root.render(
        <StrictMode>
          <Popover
            destory={() => {
              this.destroy();
            }}
            editor={editor}
            actions={settings.actionList}
            out={out}
            app={app}
            type="normal"
          />
        </StrictMode>,
      );
    }
    else {
      const event = new Event('popkit-popover-render');
      setTimeout(() => {
        window.dispatchEvent(event);
      }, 0);
    }
    if (sameInstance) {
      return sameInstance;
    }
    return this;
  }

  destroy() {
    if (this.destroying) {
      return;
    }
    this.destroying = true;
    this.root.unmount();
    this.el.remove();
    const index = instanceList.indexOf(this);
    if (index !== -1) {
      instanceList.splice(index, 1);
    }
  }
}

export const clearPopover = () => {
  instanceList.forEach(instance => {
    instance.destroy();
  });
};
