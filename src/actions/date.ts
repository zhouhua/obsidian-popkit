import type { Action, HandlerParams } from 'src/types';
import { moment } from 'obsidian';
import L from 'src/L';

export const date: Action = {
  id: 'date',
  version: 0,
  name: () => {
    const now = moment();
    return now.format('YYYY-MM-DD');
  },
  desc: L.actions.date(),
  handler: ({ action, replace }: HandlerParams) => {
    replace(typeof action.name === 'string' ? action.name : action.name({}));
  },
};

export const time: Action = {
  id: 'time',
  version: 0,
  name: () => {
    const now = moment();
    return now.format('HH:mm:ss');
  },
  desc: L.actions.time(),
  handler: ({ action, replace }: HandlerParams) => { replace(typeof action.name === 'string' ? action.name : action.name({})); },
};
