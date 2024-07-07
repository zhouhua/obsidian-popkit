import L from 'src/L';
import type { Action } from 'src/types';

export const find: Action = {
  id: 'find',
  version: 0,
  icon: 'Search',
  name: 'find',
  desc: L.actions.find(),
  test: '.+',
  command: 'editor:open-search',
};

export const replace: Action = {
  id: 'replace',
  version: 0,
  icon: 'Replace',
  name: 'replace',
  desc: L.actions.replace(),
  test: '.+',
  command: 'editor:open-search-replace',
};

export const search: Action = {
  id: 'search',
  version: 0,
  icon: 'ScanSearch',
  name: 'global search',
  desc: L.actions.search(),
  test: '.+',
  command: 'global-search:open',
};
