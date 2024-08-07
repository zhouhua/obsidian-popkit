import { createRoot } from 'react-dom/client';
import React from 'react';
import Setting from './Setting';
import type { App } from 'obsidian';
import type { ISetting } from 'src/types';

export default function renderSetting(
  el: HTMLElement,
  initialSetting: ISetting,
  app: App,
  updateSetting: (data: ISetting) => void,
) {
  const root = createRoot(el);
  root.render(
    <Setting
      initialSetting={initialSetting}
      app={app}
      updateSetting={updateSetting}
    />,
  );
  return root;
}
