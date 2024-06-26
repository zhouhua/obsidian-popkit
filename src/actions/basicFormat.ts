import L from "src/L";

export const bold = {
	name: 'bold',
	desc: L.actions.bold(),
	icon: 'Bold',
	command: 'editor:toggle-bold'
};

export const italic = {
	name: 'italic',
	desc: L.actions.italic(),
	icon: 'Italic',
	command: 'editor:toggle-italics'
};

export const strikethrough = {
	name: 'strikethrough',
	desc: L.actions.strikethrough(),
	icon: 'Strikethrough',
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
	icon: 'Quote',
	command: 'editor:toggle-blockquote'
};

export const clearFormat = {
	name: 'clear format',
	desc: L.actions.clearFormat(),
	icon: 'RemoveFormatting',
	test: '.+',
	command: 'editor:clear-formatting'
};
