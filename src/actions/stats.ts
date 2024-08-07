import type { Action, HandlerParams } from 'src/types';
import words from 'lodash/words';
import L from 'src/L';

export const wordCount: Action = {
  id: 'word-count',
  version: 0,
  name: ({ selection }: Partial<HandlerParams>) => {
    const count = words(selection, /[\p{sc=Katakana}\p{sc=Hiragana}\p{sc=Han}]|\p{L}+['’]\p{L}+|\p{L}+/gu).length;
    return `W ${count}`;
  },
  desc: L.actions.wordCount(),
  test: '.+',
  handler: () => {},
  exampleText: 'hello world',
};

export const lineCount: Action = {
  id: 'line-count',
  version: 0,
  name: ({ selection }: Partial<HandlerParams>) => {
    const count = selection?.split('\n').length || 0;
    return `L ${count}`;
  },
  desc: L.actions.lineCount(),
  test: '.+',
  handler: () => {},
  exampleText: 'hello world',
};
