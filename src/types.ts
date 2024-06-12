import type { App, Editor } from "obsidian";

export type HandlerParams = {
	app:App;
	editor: Editor;
	replace: (text: string) => void;
	getMarkdown: () => string;
	selection: string;
	action: Action;
}

interface IActionBase {
	name: string | ((param: Partial<HandlerParams>) => string);
	desc: string;
	icon?: string | ((param: Partial<HandlerParams>) => string);
	test?: string;
	dependencies?: string[];
	exampleText?: string;
	defaultIcon?: string;
	origin?: Action;
}

export interface IActionWithHandler extends IActionBase {
	handler: (params: HandlerParams) => void;
	handlerString: never;
	command: never;
	hotkeys: never;
}

export interface IActionWithHandlerString extends IActionBase {
	handlerString: string;
	handler: never;
	command: never;
	hotkeys: never;
}

export interface IActionWithCommand extends IActionBase {
	command: string;
	handlerString: never;
	handler: never;
	hotkeys: never;
}

export interface IActionWithHotkeys extends IActionBase {
	hotkeys: string[];
	handlerString: never;
	handler: never;
	command: never;
}

export type Action = IActionWithHandler | IActionWithHandlerString | IActionWithCommand | IActionWithHotkeys;
export enum ItemType {
	Action = 'action',
	Divider = 'divider'
}
export type PopoverItem = {type: ItemType.Action, action: Action, id: string} | {type: ItemType.Divider, id: string}

export interface ISetting {
	actionList: PopoverItem[];
}
