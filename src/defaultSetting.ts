import { ISetting } from "./types";
import * as basicFormat from './actions/basicFormat';
import * as search from './actions/search';

export default { actionList: [
	...Object.values(basicFormat).map(action => ({type: 'action', action})),
	{type: 'divider'},
	...Object.values(search).map(action => ({type: 'action', action})),
].map((item, i) => ({...item, id: `list_${i}`})) } as ISetting;
