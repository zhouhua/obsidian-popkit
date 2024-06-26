import type { App, Editor } from "obsidian";
import Popover from "./components/Popover";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { ISetting } from "./types";

const instanceList: PopoverManager[] = [];
const AnimationTime = 400;

export default class PopoverManager {
  el: HTMLElement;
  root: Root;
  destroying: boolean = false;
  constructor(editor: Editor, app: App, settings: ISetting) {
    instanceList.forEach((instance) => instance.destroy());
    instanceList.push(this);
    /* @ts-igonre */
    const out = editor.containerEl.find(".cm-scroller");
    this.el = out.createDiv({
      cls: ["popkit-popover"],
    });
    this.root = createRoot(this.el);
    this.root.render(
      <StrictMode>
        <Popover
          editor={editor}
          destory={this.destroy.bind(this)}
          actions={settings.actionList}
          out={out}
          app={app}
        ></Popover>
      </StrictMode>
    );
    this.el.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: AnimationTime,
      easing: "ease-in-out",
    });
  }
  destroy() {
    if (this.destroying) {
      return;
    }
    this.destroying = true;
    const animation = this.el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: AnimationTime,
      easing: "ease-in-out",
    });
    animation.onfinish = () => {
      this.root?.unmount();
      this.el.remove();
      const index = instanceList.indexOf(this);
      if (index !== -1) {
        instanceList.splice(index, 1);
      }
    };
  }
}

export const clearPopover = () =>
  instanceList.forEach((instance) => instance.destroy());
