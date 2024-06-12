import * as clipboard from './clipboard';
import * as basicFormat from './basicFormat';
import * as search from './search';
import * as web from './web';
import * as translation from './translation';
import * as math from './math';
import * as letterCase from './letterCase';
import * as stats from './stats';
import * as appActions from './app';
import * as list from './list';
import * as date from './date';
import { Action } from 'src/types';

export default [clipboard, basicFormat, search, web, translation, math, letterCase, stats, appActions, list, date].reduce((acc, cur) => {
	return acc.concat(Object.values(cur))
}, [] as Action[])
