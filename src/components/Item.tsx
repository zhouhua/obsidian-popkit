import type { App, Editor } from 'obsidian';
import { setTooltip } from 'obsidian';
import type { MouseEvent } from 'react';
import { useState, useRef, useEffect, forwardRef } from 'react';
import type { Action, HandlerParams } from 'src/types';
import { hasCommand, hasHandler, hasHandlerString, hasHotkeys } from 'src/types';
import uniqueId from 'lodash/uniqueId';
import { icons } from 'lucide-react';
import styled from '@emotion/styled';

const Container = styled.div`
  padding: 4px 6px;
  transition: all 200ms ease-in-out;
  opacity: 0.8;
  cursor: pointer;
  background-color: #000;
  font-family: var(--font-default);
  color: #fff;
  height: 28px;
  font-size: 16px;
  line-height: 20px;
  border-radius: 4px;
  &:hover {
    opacity: 1;
    background-color: var(--color-blue);
  }
`;

const Image = styled.div`
  background-size: contain;
  background-position: center center;
  background-repeat: no-repeat;
  height: 20px;
  width: 20px;
`;

const Text = styled.div`
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

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
        await action.handler({
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
    <div ref={ref}>
      <Container
        ref={itemRef}
        id={id}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={click}
      >
        {icon
          ? (
              /^https?:|^data:/.test(icon)
                ? (
                    <Image
                      style={{ backgroundImage: `url(${icon})` }}
                    />
                  )
                : icon in icons
                  ? (
                      <Icon size={20} color="#fff" />
                    )
                  : (
                      <Text>{icon}</Text>
                    )
            )
          : (
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              <Text>{action.name as string}</Text>
            )}
      </Container>
    </div>
  );
});

export default Item;
