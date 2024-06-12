import { App, MarkdownView, Plugin, PluginSettingTab } from "obsidian";
import PopoverManager, { clearPopover } from "./render";
import { ISetting } from "./types";
import defaultSetting from "./defaultSetting";
import renderSetting from "./components/setting";

export default class PopkitPlugin extends Plugin {
	settings: ISetting;
	async onload() {
		await this.loadSettings();
		this.registerDomEvent(
			document.body,
			"pointerup",
			this.onpointerup.bind(this)
		);
		this.registerDomEvent(
			document.body,
			"keydown",
			clearPopover
		);
		this.addCommand({
			id: "popkit-open-popover",
			name: "Show Popkit",
			hotkeys: [{ modifiers: ["Mod"], key: "." }],
			editorCallback: (editor) => {
				new PopoverManager(editor, this.app, this.settings);
			},
		});
		this.addSettingTab(new PopkitSetting(this.app, this));
	}

	onpointerup(e: PointerEvent) {
		if ((e.target as HTMLElement)?.closest('.popkit-popover')) {
			return;
		}
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if(view?.getMode() !== 'source') {
			return;
		}
		const editor = view.editor;
		if(editor.somethingSelected()) {
			new PopoverManager(editor, this.app, this.settings);
		}
	}

	onunload() {}

	async loadSettings() {
    this.settings = { ...defaultSetting, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class PopkitSetting extends PluginSettingTab {
  plugin: PopkitPlugin;
  render: (settings: ISetting) => void;

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
    containerEl.empty();
    renderSetting(
      containerEl,
      this.plugin.settings,
      this.app,
      this.update.bind(this),
    );
  }
}
