import type { Action, PopoverItem } from './types';
import { ItemType } from './types';

export function changeAction(action: Action, type: 'normal' | 'setting', selection?: string) {
  let newAction = { ...action };
  if (type === 'setting') {
    newAction.origin = action;
  }
  else {
    newAction = { ...newAction, ...(action.origin || {}) };
  }
  if (type === 'setting' && action.defaultIcon) {
    newAction.icon = action.defaultIcon;
  }
  if (typeof action.name === 'function') {
    try {
      newAction.name = action.name({ selection });
    }
    catch (e) {
      newAction.name = '';
    }
  }
  if (typeof action.icon === 'function') {
    try {
      newAction.icon = action.icon({ selection });
    }
    catch (e) {
      newAction.icon = '';
    }
  }
  return newAction;
}

export async function fileToBase64(file: Blob): Promise<string> {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  return new Promise((resolve, reject) => {
    reader.addEventListener('load', () => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      resolve(reader.result as string);
    });

    reader.onerror = error => {
      reject(error);
    };
  });
}

export function updateSettings(allActions: Action[], enabledActions: PopoverItem[]) {
  const actionMap: Record<string, Action> = {};
  allActions.forEach(action => {
    if (action.id) {
      actionMap[action.id] = action;
    }
  });
  enabledActions.forEach(item => {
    if (
      item.type === ItemType.Action
      && item.action.id
      && item.action.id in actionMap
      && item.action.version !== actionMap[item.action.id].version
    ) {
      item.action = actionMap[item.action.id];
    }
  });
  return [...enabledActions];
}
