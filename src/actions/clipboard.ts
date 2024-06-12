import { MarkdownRenderChild, MarkdownRenderer } from "obsidian";
import L from "src/L";
import type { HandlerParams } from "src/types";

export const cut = {
	name: 'Cut',
	desc: L.actions.cut(),
	test: '.+',
	handlerString: `
		context.replace('');
		await navigator.clipboard.writeText(context.selection);
	`
};

export const copy = {
	name: 'Copy',
	desc: L.actions.copy(),
	test: '.+',
	handlerString: `
		await navigator.clipboard.writeText(context.selection);
	`
};

export const paste = {
	name: 'Paste',
	desc: L.actions.paste(),
	handlerString: `
		const text = await navigator.clipboard.readText();
		context.replace(text);
	`
};

export const copyHtml = {
	icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIyIj48cGF0aCBkPSJNMTQgM3Y0YTEgMSAwIDAgMCAxIDFoNCIvPjxwYXRoIGQ9Ik01IDEyVjVhMiAyIDAgMCAxIDItMmg3bDUgNXY0TTIgMjF2LTZtMyAwdjZtLTMtM2gzbTE1LTN2NmgybS05IDB2LTZsMiAzbDItM3Y2bS05LjUtNmgzTTkgMTV2NiIvPjwvZz48L3N2Zz4=',
	name: 'copy HTML',
	desc: L.actions.copyHtml(),
	test: '.+',
	handler: async ({selection, app}: HandlerParams) => {
		const div = createDiv();
		await MarkdownRenderer.render(
			app,
			selection,
			div,
			'',
			new MarkdownRenderChild(div),
		);
		const html = div.innerHTML;
		div.remove();
		await navigator.clipboard.writeText(html);
	}
}
