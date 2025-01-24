import type { App, Editor } from 'obsidian';

export interface HandlerParams {
  app: App;
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
  id?: string;
  version?: number;
}

export interface IActionWithHandler extends IActionBase {
  handler: string | ((params: HandlerParams) => Promise<void> | void);
}

export function hasHandler(action: Action): action is IActionWithHandler {
  return 'handler' in action;
}

export interface IActionWithHandlerString extends IActionBase {
  handlerString: string;
}

export function hasHandlerString(action: Action): action is IActionWithHandlerString {
  return 'handlerString' in action;
}

export interface IActionWithCommand extends IActionBase {
  command: string;
}

export function hasCommand(action: Action): action is IActionWithCommand {
  return 'command' in action;
}

export interface IActionWithHotkeys extends IActionBase {
  hotkeys: string[];
}

export function hasHotkeys(action: Action): action is IActionWithHotkeys {
  return 'hotkeys' in action;
}

export type Action = IActionWithHandler | IActionWithHandlerString | IActionWithCommand | IActionWithHotkeys;

export enum ItemType {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Action = 'action',
  Divider = 'divider',
}
export type PopoverItem =
  | { type: ItemType.Action; action: Action; id: string; }
  | { type: ItemType.Divider; id: string; };

export interface ISetting {
  refreshKey: number;
  disableNativeToolbar: boolean;
  mouseSelectionOnly: boolean;
  actionList: PopoverItem[];
  customActionList: Action[];
}
