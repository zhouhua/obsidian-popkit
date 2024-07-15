import type { App } from 'obsidian';
import { MarkdownView, Platform, Plugin, PluginSettingTab, Setting } from 'obsidian';
import PopoverManager, { clearPopover } from './render';
import type { ISetting } from './types';
import defaultSetting from './defaultSetting';
import renderSetting from './components/setting';
import type { Root } from 'react-dom/client';
import { updateSettings } from './utils';
import actions from './actions';
import L from './L';

export default class PopkitPlugin extends Plugin {
  settings: ISetting;
  async onload() {
    await this.loadSettings();
    this.registerDomEvent(
      document.body,
      'pointerup',
      e => {
        this.onpointerup(e);
      },
    );
    this.registerDomEvent(
      document.body,
      'contextmenu',
      e => {
        this.settings.disableNativeToolbar && Platform.isMobile && e.preventDefault();
      },
    );
    this.registerDomEvent(
      document.body,
      'keydown',
      clearPopover,
    );
    this.addCommand({
      id: 'show',
      name: 'Show PopKit',
      // hotkeys: [{ modifiers: ["Mod"], key: "." }],
      editorCallback: editor => {
        clearPopover();
        new PopoverManager(editor, this.app, this.settings);
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.addSettingTab(new PopkitSetting(this.app, this));
  }

  onpointerup(e: PointerEvent) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    if ((e.target as HTMLElement).closest('.popkit-popover')) {
      return;
    }
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view?.getMode() !== 'source') {
      return;
    }
    const { editor } = view;
    clearPopover();
    setTimeout(() => {
      if (editor.somethingSelected()) {
        new PopoverManager(editor, this.app, this.settings);
      }
    }, 20);
  }

  onunload() {}

  async loadSettings() {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const savedData: Partial<ISetting> = (await this.loadData() || {}) as Partial<ISetting>;
    if (savedData.actionList?.length) {
      savedData.actionList = updateSettings(actions, savedData.actionList);
      this.saveSettings();
    }
    this.settings = { ...defaultSetting, ...savedData };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class PopkitSetting extends PluginSettingTab {
  plugin: PopkitPlugin;
  render: (settings: ISetting) => void;
  root?: Root;

  constructor(app: App, plugin: PopkitPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  update(data: ISetting) {
    this.plugin.settings = data;
    this.plugin.saveSettings();
  }

  display(): void {
    const { containerEl } = this;
    if (this.root) {
      this.root.unmount();
    }
    containerEl.empty();
    new Setting(containerEl)
      .setName(L.setting.disableNativeToolbar())
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.disableNativeToolbar)
          .onChange(value => {
            this.update({
              ...this.plugin.settings,
              disableNativeToolbar: value,
            });
          });
      });
    const rootEl = containerEl.createDiv();
    this.root = renderSetting(
      rootEl,
      this.plugin.settings,
      this.app,
      data => { this.update(data); },
    );
  }
}
