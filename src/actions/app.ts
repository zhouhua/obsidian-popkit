import L from 'src/L';
import type { Action, HandlerParams } from 'src/types';

export const openHelp: Action = {
  id: 'open-help',
  version: 0,
  icon: 'CircleHelp',
  name: 'help',
  desc: L.actions.help(),
  test: '^$',
  command: 'app:open-help',
};

export const openSetting: Action = {
  id: 'open-setting',
  version: 0,
  icon: 'Settings',
  name: 'setting',
  desc: L.actions.setting(),
  test: '^$',
  command: 'app:open-setting',
};

export const addBookmark: Action = {
  id: 'add-bookmark',
  version: 0,
  icon: 'BookmarkCheck',
  name: 'add bookmark',
  desc: L.actions.addBookmark(),
  handler: ({ selection, app }: HandlerParams) => {
    app.commands.executeCommandById(selection ? 'bookmarks:bookmark-current-section' : 'bookmarks:bookmark-current-view');
  },
};

export const openBookmark: Action = {
  id: 'open-bookmark',
  version: 0,
  icon: 'BookMarked',
  name: 'open bookmark',
  desc: L.actions.openBookmark(),
  command: 'bookmarks:open',
};

export const lineUp: Action = {
  id: 'line-up',
  version: 0,
  icon: 'CornerRightUp',
  name: 'line up',
  desc: L.actions.lineUp(),
  command: 'editor:swap-line-up',
};

export const lineDown: Action = {
  id: 'line-down',
  version: 0,
  icon: 'CornerRightDown',
  name: 'line down',
  desc: L.actions.lineDown(),
  command: 'editor:swap-line-down',
};

export const highlight: Action = {
  id: 'highlight',
  version: 0,
  icon: 'Highlighter',
  name: 'highlight',
  desc: L.actions.highlight(),
  test: '.+',
  command: 'editor:toggle-highlight',
};
