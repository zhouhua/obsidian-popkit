import { evaluate, format, typeOf } from 'mathjs'
import L from 'src/L';
import type { HandlerParams } from 'src/types';

export const calc = {
	name: ({selection}: Partial<HandlerParams>) => {
		const result = evaluate(selection?.trim() || '');
		if (typeOf(result).startsWith('ResultSet')) {
			const resultArray = result.valueOf()
			const lastResult = resultArray[resultArray.length - 1] // take final entry of resultset
			return format(lastResult, { notation: 'fixed' });
		} else if(typeOf(result) === 'number') {
			return format(result, { notation: 'fixed' });
		} else if(typeOf(result) === 'Unit') {
      return result.valueOf();
    }
		return '';
	},
	desc: L.actions.calc(),
	test: '^[^\n]+$',
	handler: ({action, replace}: HandlerParams) => {
		replace(action.name as string)
	},
	defaultIcon: 'Calculator',
}
