import { MarkdownRenderChild, MarkdownRenderer } from 'obsidian';
import L from 'src/L';
import type { Action, HandlerParams } from 'src/types';

export const cut: Action = {
  id: 'cut',
  version: 0,
  name: 'Cut',
  desc: L.actions.cut(),
  test: '.+',
  handler: async ({ selection, replace }: HandlerParams) => {
    replace('');
    await navigator.clipboard.writeText(selection);
  },
};

export const cutWithIcon: Action = {
  id: 'cut-with-icon',
  version: 0,
  icon: 'Scissors',
  name: 'Cut',
  desc: L.actions.cut(),
  test: '.+',
  handler: async ({ selection, replace }: HandlerParams) => {
    replace('');
    await navigator.clipboard.writeText(selection);
  },
};

export const copy: Action = {
  id: 'copy',
  version: 0,
  name: 'Copy',
  desc: L.actions.copy(),
  test: '.+',
  handler: async ({ selection }: HandlerParams) => {
    await navigator.clipboard.writeText(selection);
  },
};

export const copyWithIcon: Action = {
  id: 'copy-with-icon',
  version: 0,
  icon: 'Copy',
  name: 'Copy',
  desc: L.actions.copy(),
  test: '.+',
  handler: async ({ selection }: HandlerParams) => {
    await navigator.clipboard.writeText(selection);
  },
};

export const paste: Action = {
  id: 'paste',
  version: 0,
  name: 'Paste',
  desc: L.actions.paste(),
  handler: async ({ replace }: HandlerParams) => {
    const text = await navigator.clipboard.readText();
    replace(text);
  },
};

export const pasteWithIcon: Action = {
  id: 'paste-with-icon',
  version: 0,
  icon: 'ClipboardCheck',
  name: 'Paste',
  desc: L.actions.paste(),
  handler: async ({ replace }: HandlerParams) => {
    const text = await navigator.clipboard.readText();
    replace(text);
  },
};

export const zCopyHtml: Action = {
  id: 'copy-html',
  version: 0,
  icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIyIj48cGF0aCBkPSJNMTQgM3Y0YTEgMSAwIDAgMCAxIDFoNCIvPjxwYXRoIGQ9Ik01IDEyVjVhMiAyIDAgMCAxIDItMmg3bDUgNXY0TTIgMjF2LTZtMyAwdjZtLTMtM2gzbTE1LTN2NmgybS05IDB2LTZsMiAzbDItM3Y2bS05LjUtNmgzTTkgMTV2NiIvPjwvZz48L3N2Zz4=',
  name: 'Copy HTML',
  desc: L.actions.copyHtml(),
  test: '.+',
  handler: async ({ selection, app }: HandlerParams) => {
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
  },
};
