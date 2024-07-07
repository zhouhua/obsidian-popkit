import L from 'src/L';
import type { Action } from 'src/types';

export const bold: Action = {
  id: 'bold',
  version: 0,
  name: 'bold',
  desc: L.actions.bold(),
  icon: 'Bold',
  command: 'editor:toggle-bold',
};

export const italic: Action = {
  id: 'italic',
  version: 0,
  name: 'italic',
  desc: L.actions.italic(),
  icon: 'Italic',
  command: 'editor:toggle-italics',
};

export const strikethrough: Action = {
  id: 'strikethrough',
  version: 0,
  name: 'strikethrough',
  desc: L.actions.strikethrough(),
  icon: 'Strikethrough',
  command: 'editor:toggle-strikethrough',
};

export const addAttach: Action = {
  id: 'add-attach',
  version: 0,
  name: 'add attachment',
  desc: L.actions.addAttach(),
  icon: 'Paperclip',
  command: 'editor:attach-file',
};

export const blockquote: Action = {
  id: 'blockquote',
  version: 0,
  name: 'blockquote',
  desc: L.actions.blockquote(),
  icon: 'Quote',
  command: 'editor:toggle-blockquote',
};

export const clearFormat: Action = {
  id: 'clear-format',
  version: 0,
  name: 'clear format',
  desc: L.actions.clearFormat(),
  icon: 'RemoveFormatting',
  test: '.+',
  command: 'editor:clear-formatting',
};
