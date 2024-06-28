import type { HandlerParams } from "src/types";
import { moment } from 'obsidian';
import L from "src/L";

export const date = {
	name: () => {
		const date = moment();
		return date.format('YYYY-MM-DD');
	},
	desc: L.actions.date(),
	handler: ({action, replace}: HandlerParams) => {
		replace(action.name as string);
	}
}

export const time = {
	name: () => {
		const date = moment();
		return date.format('HH:mm:ss');
	},
	desc: L.actions.time(),
	handler: ({action, replace}: HandlerParams) => replace(action.name as string)
}
