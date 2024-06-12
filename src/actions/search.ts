import L from "src/L"

export const find = {
	icon: 'Search',
	name: 'find',
	desc: L.actions.find(),
	test: '.+',
	command: 'editor:open-search'
}

export const replace = {
	icon: 'Replace',
	name: 'replace',
	desc: L.actions.replace(),
	test: '.+',
	command: 'editor:open-search-replace'
}

export const search = {
	icon: 'ScanSearch',
	name: 'global search',
	desc: L.actions.search(),
	test: '.+',
	command: 'global-search:open'
}
