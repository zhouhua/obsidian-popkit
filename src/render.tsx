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
  settings: ISetting;
  app: App;

  constructor(editor: Editor, app: App, settings: ISetting) {
    const sameInstance = instanceList.find(instance => instance.editor.containerEl === editor.containerEl);
    try {
      // 清除其他编辑器的 popover
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
      this.app = app;
      this.settings = settings;
      instanceList.push(this);

      const out = editor.containerEl.find('.cm-scroller');
      /* @ts-igonre */
      this.el = out.createDiv({
        cls: ['popkit-popover'],
      });
      // 添加 CSS transition
      this.el.style.transition = 'transform 100ms ease-out';

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

      // 延迟触发第一次位置计算
      setTimeout(() => {
        const event = new Event('popkit-popover-render');
        window.dispatchEvent(event);
      }, 0);
    }
    else {
      // 更新 editor 对象并重新渲染
      sameInstance.editor = editor;
      sameInstance.root.render(
        <StrictMode>
          <Popover
            destory={() => {
              sameInstance.destroy();
            }}
            editor={editor}
            actions={settings.actionList}
            out={editor.containerEl.find('.cm-scroller')}
            app={app}
            type="normal"
          />
        </StrictMode>,
      );
      // 延迟触发位置更新事件
      setTimeout(() => {
        const event = new Event('popkit-popover-render');
        window.dispatchEvent(event);
      }, 0);
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
