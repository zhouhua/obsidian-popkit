import type { HandlerParams } from "src/types";
import dayjs from 'dayjs';

export const date = {
	name: () => {
		const date = dayjs();
		return date.format('YYYY-MM-DD');
	},
	desc: 'paste date',
	handler: ({action, replace}: HandlerParams) => {
		replace(action.name as string);
	}
}

export const time = {
	name: () => {
		const date = dayjs();
		return date.format('HH:mm:ss');
	},
	desc: 'paste time',
	handler: ({action, replace}: HandlerParams) => replace(action.name as string)
}
