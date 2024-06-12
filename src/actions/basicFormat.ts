import L from "src/L";

export const bold = {
	name: 'bold',
	desc: L.actions.bold(),
	icon: 'Bold',
	test: '.+',
	command: 'editor:toggle-bold'
};

export const italic = {
	name: 'italic',
	desc: L.actions.italic(),
	icon: 'Italic',
	test: '.+',
	command: 'editor:toggle-italics'
};

export const comment = {
	name: 'comment',
	desc: L.actions.comment(),
	icon: 'MessageSquareText',
	test: '.+',
	command: 'editor:toggle-comments'
};

export const strikethrough = {
	name: 'strikethrough',
	desc: L.actions.strikethrough(),
	icon: 'Strikethrough',
	test: '.+',
	command: 'editor:toggle-strikethrough'
};

export const addAttach = {
	name: 'add attachment',
	desc: L.actions.addAttach(),
	icon: 'Paperclip',
	command: 'editor:attach-file'
};

export const blockquote = {
	name: 'blockquote',
	desc: L.actions.blockquote(),
	icon: 'RemoveFormatting',
	command: 'editor:toggle-blockquote'
};

export const clearFormat = {
	name: 'clear format',
	desc: L.actions.clearFormat(),
	icon: 'Quote',
	command: 'editor:clear-formatting'
};
