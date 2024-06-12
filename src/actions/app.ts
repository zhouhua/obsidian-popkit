import L from "src/L"
import type { HandlerParams } from "src/types"

export const openHelp = {
	icon: 'CircleHelp',
	name: 'help',
	desc: L.actions.help(),
	test: '^$',
	command: 'app:open-help'
}

export const openSetting = {
	icon: 'Settings',
	name: 'setting',
	desc: L.actions.setting(),
	test: '^$',
	command: 'app:open-setting'
}

export const addBookmark = {
	icon: 'BookmarkCheck',
	name: 'add bookmark',
	desc: L.actions.addBookmark(),
	handler: ({selection, app}: HandlerParams) => {
		app.commands.executeCommandById(selection ? 'bookmarks:bookmark-current-section': 'bookmarks:bookmark-current-view')
	}
}

export const openBookmark = {
	icon: 'BookMarked',
	name: 'open bookmark',
	desc: L.actions.openBookmark(),
	test: '^$',
	command: 'bookmarks:open'
}

export const lineUp = {
	icon: 'CornerRightUp',
	name: 'line up',
	desc: L.actions.lineUp(),
	test: '^$',
	command: 'editor:swap-line-up'
}

export const lineDown = {
	icon: 'CornerRightDown',
	name: 'line down',
	desc: L.actions.lineDown(),
	test: '^$',
	command: 'editor:swap-line-down'
}

export const highlight= {
	icon: 'Highlighter',
	name: 'highlight',
	desc: L.actions.highlight(),
	test: '.+',
	command: ['editor:toggle-highlight']
};
