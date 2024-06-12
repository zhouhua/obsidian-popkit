import type { HandlerParams } from "src/types"

export const openHelp = {
	icon: 'CircleHelp',
	name: 'help',
	desc: 'open obsidian help',
	test: '^$',
	command: 'app:open-help'
}

export const openSetting = {
	icon: 'Settings',
	name: 'setting',
	desc: 'open obsidian setting',
	test: '^$',
	command: 'app:open-setting'
}

export const addBookmark = {
	icon: 'BookmarkCheck',
	name: 'add bookmark',
	desc: 'add bookmark',
	handler: ({selection, app}: HandlerParams) => {
		app.commands.executeCommandById(selection ? 'bookmarks:bookmark-current-section': 'bookmarks:bookmark-current-view')
	}
}

export const openBookmark = {
	icon: 'BookMarked',
	name: 'open bookmark',
	desc: 'open bookmark',
	test: '^$',
	command: 'bookmarks:open'
}

export const lineUp = {
	icon: 'CornerRightUp',
	name: 'line up',
	desc: 'move line up',
	test: '^$',
	command: 'editor:swap-line-up'
}

export const lineDown = {
	icon: 'CornerRightDown',
	name: 'line down',
	desc: 'move line down',
	test: '^$',
	command: 'editor:swap-line-down'
}

export const highlight= {
	icon: 'Highlighter',
	name: 'highlight',
	desc: 'highlight',
	test: '.+',
	command: ['editor:toggle-highlight']
};
