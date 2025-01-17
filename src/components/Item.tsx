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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
        // todo: trigger hotkeys
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
      setTooltip(itemRef.current, action.desc || action.name as string);
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
