import { Action } from "./types";

export function changeAction(action: Action, type: 'normal' | 'setting', selection?: string) {
	const newAction = { ...action, origin: action };
	if(type === 'setting' && action.defaultIcon) {
		newAction.icon = action.defaultIcon;
	}
	if (typeof action.name === "function") {
		try {
			newAction.name = action.name({ selection });
		} catch (e) {
			newAction.name = "";
		}
	}
	if (typeof action.icon === "function") {
		try {
			newAction.icon = action.icon({ selection });
		} catch (e) {
			newAction.icon = "";
		}
	}
	return newAction;
}
