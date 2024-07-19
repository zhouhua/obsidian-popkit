import type { ISetting } from './types';
import { ItemType } from './types';
import * as basicFormat from './actions/basicFormat';
import * as search from './actions/search';

export default {
  refreshKey: 1,
  disableNativeToolbar: true,
  customActionList: [],
  actionList: [
    ...Object.values(basicFormat).map(action => ({ type: ItemType.Action, action })),
    { type: ItemType.Divider } as const,
    ...Object.values(search).map(action => ({ type: ItemType.Action, action })),
  ].map((item, i) => ({ ...item, id: `list_${i}` })),
} satisfies ISetting;
