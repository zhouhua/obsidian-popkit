import type { App, Editor } from 'obsidian';
import { setTooltip } from 'obsidian';
import type { MouseEvent } from 'react';
import { useState, useRef, useEffect, forwardRef } from 'react';
import type { Action, HandlerParams } from 'src/types';
import { hasCommand, hasHandler, hasHandlerString, hasHotkeys } from 'src/types';
import uniqueId from 'lodash/uniqueId';
import { icons } from 'lucide-react';
import { parseFunction } from 'src/utils';
import { cn } from '@/lib/utils';

interface ItemProps {
  action: Action;
  editor?: Editor;
  replace?: (text: string) => void;
  getMarkdown?: () => string;
  selection?: string;
  finish?: () => void;
  app: App;
  type: 'normal' | 'setting';
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  highlight?: boolean;
}

const AsyncFunction = async function () { }.constructor;

interface KeyboardEventParams {
  key: string;
  code: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  charCode?: number;
  keyCode?: number;
  which?: number;
}

// 获取键码映射
const KEY_CODE_MAP: Record<string, number> = {
  a: 65,
  b: 66,
  c: 67,
  d: 68,
  e: 69,
  f: 70,
  g: 71,
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76,
  m: 77,
  n: 78,
  o: 79,
  p: 80,
  q: 81,
  r: 82,
  s: 83,
  t: 84,
  u: 85,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90,
  Control: 17,
  Meta: 91,
  Alt: 18,
  Shift: 16,
};

function createKeyboardEvent(type: 'keydown' | 'keyup' | 'keypress', params: KeyboardEventParams): KeyboardEvent {
  const keyCode = params.key.length === 1
    ? KEY_CODE_MAP[params.key.toLowerCase()] || params.key.charCodeAt(0)
    : KEY_CODE_MAP[params.key] || 0;

  const init: KeyboardEventInit = {
    ...params,
    bubbles: false,
    cancelable: true,
    composed: true,
    repeat: false,
    isComposing: false,
    location: 0,
    keyCode,
    which: keyCode,
    charCode: type === 'keypress' ? keyCode : 0,
    view: window,
  };

  return new KeyboardEvent(type, init);
}

async function simulateKeyboardEvents(target: EventTarget, params: KeyboardEventParams) {
  const modifiers = [
    { key: 'Control', pressed: params.ctrlKey },
    { key: 'Meta', pressed: params.metaKey },
    { key: 'Alt', pressed: params.altKey },
    { key: 'Shift', pressed: params.shiftKey },
  ].filter(m => m.pressed);

  const doc = target instanceof Window ? target.document : document;

  // 跟踪修饰键的状态
  const modifierState = {
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
  };

  // 按下修饰键
  for (const mod of modifiers) {
    // 更新当前修饰键的状态
    switch (mod.key) {
      case 'Control':
        modifierState.ctrlKey = true;
        break;
      case 'Meta':
        modifierState.metaKey = true;
        break;
      case 'Alt':
        modifierState.altKey = true;
        break;
      case 'Shift':
        modifierState.shiftKey = true;
        break;
    }

    const modEvent = createKeyboardEvent('keydown', {
      ...params,
      key: mod.key,
      code: `${mod.key}Left`,
      // 使用当前的修饰键状态
      ...modifierState,
    });
    doc.dispatchEvent(modEvent);
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // 主键按下 - 使用所有修饰键的最终状态
  const downEvent = createKeyboardEvent('keydown', params);
  doc.dispatchEvent(downEvent);

  // 如果是可打印字符，触发 keypress
  if (params.key.length === 1) {
    const pressEvent = createKeyboardEvent('keypress', params);
    doc.dispatchEvent(pressEvent);
  }

  await new Promise(resolve => setTimeout(resolve, 50));

  // 主键释放 - 仍然使用所有修饰键的状态
  const upEvent = createKeyboardEvent('keyup', params);
  doc.dispatchEvent(upEvent);

  // 释放修饰键（反序）
  for (const mod of modifiers.reverse()) {
    // 更新当前修饰键的状态
    switch (mod.key) {
      case 'Control':
        modifierState.ctrlKey = false;
        break;
      case 'Meta':
        modifierState.metaKey = false;
        break;
      case 'Alt':
        modifierState.altKey = false;
        break;
      case 'Shift':
        modifierState.shiftKey = false;
        break;
    }

    const modUpEvent = createKeyboardEvent('keyup', {
      ...params,
      key: mod.key,
      code: `${mod.key}Left`,
      // 使用当前的修饰键状态
      ...modifierState,
    });
    doc.dispatchEvent(modUpEvent);
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}

const Item = forwardRef<HTMLDivElement, ItemProps>(({
  action,
  editor,
  replace,
  getMarkdown,
  selection,
  finish,
  app,
  type,
  onClick,
  highlight = false,
}, ref) => {
  const [id] = useState<string>(uniqueId('action-item-'));
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const icon = type === 'setting' && action.defaultIcon ? action.defaultIcon : action.icon as string;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const Icon = icons[icon as keyof typeof icons];
  const itemRef = useRef<HTMLDivElement>(null);
  function click(event: MouseEvent<HTMLDivElement>) {
    if (type === 'setting') {
      onClick?.(event);
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const executeAction = async () => {
      try {
        if (hasHandler(action)) {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          await (parseFunction(action).handler as ((params: HandlerParams) => Promise<void> | void))({
            editor: editor!,
            getMarkdown: getMarkdown!,
            replace: replace!,
            app,
            selection: selection!,
            action,
          });
          finish!();
        }
        else if (hasCommand(action)) {
          const result = app.commands.executeCommandById(action.command);
          if (!result) {
            console.error(`Command ${action.command} not found`);
          }
          finish!();
        }
        else if (hasHandlerString(action)) {
          // @ts-expect-error AsyncFunction is ok
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          const fn: (param: HandlerParams) => Promise<void> = new AsyncFunction('context', action.handlerString);
          await fn({
            editor: editor!,
            getMarkdown: getMarkdown!,
            replace: replace!,
            app,
            selection: selection!,
            action,
          });
          finish!();
        }
        else if (hasHotkeys(action)) {
          const [hotkeyStr] = action.hotkeys;
          const key = hotkeyStr.split(' ').filter(k => !['Ctrl', '⌘', '⌥', '⇧'].includes(k)).pop() || '';
          const params: KeyboardEventParams = {
            key,
            code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
            ctrlKey: hotkeyStr.includes('Ctrl'),
            metaKey: hotkeyStr.includes('⌘'),
            altKey: hotkeyStr.includes('⌥'),
            shiftKey: hotkeyStr.includes('⇧'),
            charCode: key.length === 1 ? key.charCodeAt(0) : undefined,
            keyCode: key.length === 1 ? key.charCodeAt(0) : undefined,
            which: key.length === 1 ? key.charCodeAt(0) : undefined,
          };

          const target = document;
          try {
            await simulateKeyboardEvents(target, params);
          }
          finally {
            finish!();
          }
        }
        else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const exception: never = action;
        }
      }
      catch (e) {
        console.error(e);
        finish!();
      }
    };

    void executeAction();
  }
  useEffect(() => {
    if (itemRef.current) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      setTooltip(itemRef.current, action.desc || action.name as string, {
        placement: 'top',
        delay: 50,
      });
    }
  }, [itemRef.current, action]);
  return (
    <div ref={ref} style={{ touchAction: 'none' }}>
      <div
        ref={itemRef}
        id={id}
        className={cn('popkit-item', highlight && 'popkit-item-highlight')}
        onClick={click}
      >
        {icon && (
          /^https?:|^data:/.test(icon)
            ? (
              <div className="popkit-item-image" style={{ backgroundImage: `url(${icon})` }} />
            )
            : icon in icons
              ? (
                <Icon size={20} />
              )
              : (
                <div className="popkit-item-text">{icon}</div>
              )
        )}
        {!icon && (
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          <div className="popkit-item-text">{action.name as string}</div>
        )}
      </div>
    </div>
  );
});

export default Item;
