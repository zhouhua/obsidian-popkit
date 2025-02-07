import type { App, Editor } from 'obsidian';
import { setTooltip } from 'obsidian';
import type { MouseEvent } from 'react';
import { useState, useRef, useEffect, forwardRef } from 'react';
import type { Action, HandlerParams } from 'src/types';
import { hasCommand, hasHandler, hasHandlerString, hasHotkeys } from 'src/types';
import uniqueId from 'lodash/uniqueId';
import { icons } from 'lucide-react';
import { parseFunction } from 'src/utils';

interface ItemProps {
  action: Action;
  editor?: Editor;
  replace?: (text: string) => void;
  getMarkdown?: () => string;
  selection?: string;
  finish?: () => void;
  app: App;
  type: 'normal' | 'setting';
}

const AsyncFunction = async function () { }.constructor;

const Item = forwardRef<HTMLDivElement, ItemProps>(({
  action,
  editor,
  replace,
  getMarkdown,
  selection,
  finish,
  app,
  type,
}, ref) => {
  const [id] = useState<string>(uniqueId('action-item-'));
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const icon = type === 'setting' && action.defaultIcon ? action.defaultIcon : action.icon as string;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const Icon = icons[icon as keyof typeof icons];
  const itemRef = useRef<HTMLDivElement>(null);
  async function click(event: MouseEvent<HTMLDivElement>) {
    if (type === 'setting') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
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
        // 将热键字符串转换为事件参数
        const key = hotkeyStr.split(' ').filter(k => !['Ctrl', '⌘', '⌥', '⇧'].includes(k)).pop() || '';
        const ctrlKey = hotkeyStr.includes('Ctrl');
        const metaKey = hotkeyStr.includes('⌘');
        const altKey = hotkeyStr.includes('⌥');
        const shiftKey = hotkeyStr.includes('⇧');
        console.log('key', key, 'ctrlKey', ctrlKey, 'metaKey', metaKey, 'altKey', altKey, 'shiftKey', shiftKey);

        // 获取当前焦点元素
        const target = document.activeElement || document.body;

        // 创建 keydown 事件
        const keydown = new KeyboardEvent('keydown', {
          key: key,
          code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
          which: key.length === 1 ? key.charCodeAt(0) : 0,
          ctrlKey,
          metaKey,
          altKey,
          shiftKey,
          bubbles: true,
          cancelable: true,
          composed: true,
          repeat: false,
          isComposing: false,
          location: 0,
          charCode: key.length === 1 ? key.charCodeAt(0) : 0,
          keyCode: key.length === 1 ? key.charCodeAt(0) : 0,
        });

        // 创建 keyup 事件
        const keyup = new KeyboardEvent('keyup', {
          key: key,
          code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
          which: key.length === 1 ? key.charCodeAt(0) : 0,
          ctrlKey,
          metaKey,
          altKey,
          shiftKey,
          bubbles: true,
          cancelable: true,
          composed: true,
          repeat: false,
          isComposing: false,
          location: 0,
          charCode: key.length === 1 ? key.charCodeAt(0) : 0,
          keyCode: key.length === 1 ? key.charCodeAt(0) : 0,
        });

        // 按顺序触发事件
        target.dispatchEvent(keydown);
        void (async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          target.dispatchEvent(keyup);
        })();

        finish!();
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
        className="popkit-item"
        onClick={click}
      >
        {icon && (
          /^https?:|^data:/.test(icon)
            ? (
              <div className="popkit-item-image" style={{ backgroundImage: `url(${icon})` }} />
            )
            : icon in icons
              ? (
                <Icon size={20} color="#fff" />
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
