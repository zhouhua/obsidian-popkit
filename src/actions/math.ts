import type { Unit } from 'mathjs';
import { evaluate, format, typeOf } from 'mathjs';
import L from 'src/L';
import type { Action, HandlerParams } from 'src/types';

export const calc: Action = {
  id: 'calc',
  version: 0,
  name: ({ selection }: Partial<HandlerParams>) => {
    const result: unknown = evaluate(selection?.trim() || '');
    if (typeOf(result).startsWith('ResultSet')) {
      // @ts-expect-error mathjs type error
      // eslint-disable-next-line
      const resultArray: number[] = result.valueOf();
      const lastResult = resultArray[resultArray.length - 1]; // take final entry of resultset
      return format(lastResult, { notation: 'fixed' });
    }
    else if (typeOf(result) === 'number') {
      return format(result, { notation: 'fixed' });
    }
    else if (typeOf(result) === 'Unit') {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return (result as Unit).valueOf();
    }
    return '';
  },
  desc: L.actions.calc(),
  test: '^[^\n]+$',
  handler: ({ action, replace }: HandlerParams) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    replace(action.name as string);
  },
  defaultIcon: 'Calculator',
};
