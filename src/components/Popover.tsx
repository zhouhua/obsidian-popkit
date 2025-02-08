import type { App, Editor } from 'obsidian';
import type { FC } from 'react';
import { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import type { PopoverItem } from 'src/types';
import { ItemType } from 'src/types';
import Item from './Item';
import { changeAction } from 'src/utils';
import type { InternalPluginNameType } from 'obsidian-typings';

interface PopoverProps {
  editor?: Editor;
  destory?: () => void;
  out?: HTMLElement;
  actions: PopoverItem[];
  app: App;
  type?: 'normal' | 'setting';
}

const Popover: FC<PopoverProps> = ({
  editor,
  destory,
  out,
  actions,
  app,
  type = 'normal',
}) => {
  const selection = editor?.getSelection();
  const listRef = useRef<HTMLUListElement>(null);
  const [positionLeft, setPositionLeft] = useState(0);
  const [positionTop, setPositionTop] = useState(0);
  const [firstRender, setFirstRender] = useState(-1);

  function calcPosition() {
    if (!editor || !out) return;

    // 使用 requestAnimationFrame 确保在下一帧计算位置
    requestAnimationFrame(() => {
      const pos = editor.getCursor();
      const coord = editor.coordsAtPos(pos, false);
      let left = 0;
      let top = 0;
      const rect = out.getBoundingClientRect();

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!coord) {
        const cmContainer = editor.cm.contentDOM;
        const outRect = cmContainer.getBoundingClientRect();
        const position = editor.cm.lineBlockAt(editor.posToOffset(pos));
        left = outRect.x;
        top = (position.top || 0) + cmContainer.offsetTop;
      }
      else {
        left = coord.left - rect.left;
        top = coord.top - rect.top + out.scrollTop;
      }

      const height = listRef.current?.clientHeight || 0;
      const width = listRef.current?.clientWidth || 0;

      if (width <= rect.width - 40) {
        if (left - width / 2 <= 20) {
          left = 20;
        }
        else if (left + width / 2 > rect.width - 20) {
          left = rect.width - width - 20;
        }
        else {
          left = left - width / 2;
        }
      }
      else if (width <= rect.width) {
        if (left - width / 2 <= 0) {
          left = 0;
        }
        else if (left + width / 2 > rect.width) {
          left = rect.width - width;
        }
        else {
          left = left - width / 2;
        }
      }
      else {
        left = 0;
      }

      const spaceAbove = top;
      const spaceBelow = rect.height - top;

      if (height < spaceAbove || spaceBelow < height) {
        top = top - height - 5;
      }
      else {
        top = top + 20;
      }

      setPositionLeft(left);
      setPositionTop(top);
    });
  }

  function getMarkdown() {
    return editor!.getValue();
  }

  function replace(text: string) {
    editor!.replaceSelection(text);
  }

  const filterList = useMemo(() => {
    return actions
      .map(item => {
        if (item.type === ItemType.Divider) {
          return item;
        }
        return { type: item.type, action: changeAction(item.action, type, type === 'setting' ? item.action.exampleText : selection) };
      })
      .filter(item => {
        if (type === 'setting' || item.type === ItemType.Divider) {
          return true;
        }
        const { action } = item;
        let valid = Boolean(action.name || action.icon);
        if (valid && action.test) {
          const reg = new RegExp(action.test.replace(/\\/g, '\\\\'));
          valid = reg.test(selection ?? '') && Boolean(action.name || action.icon);
        }
        if (valid && action.dependencies) {
          valid = action.dependencies.every(dep => {
            return [
              'editor',
              'app',
              'workspace',
              'file-explorer',
              'markdown',
              'open-with-default-app',
              'theme',
              'window',
            ].includes(dep)
              // eslint-disable-next-line @stylistic/indent-binary-ops
              || app.plugins.enabledPlugins.has(dep)
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              || app.internalPlugins.getEnabledPluginById(dep as InternalPluginNameType);
          });
        }
        return valid;
      })
      .filter((item, i, list) => {
        if (item.type === ItemType.Divider) {
          if (i > 0 && list[i - 1].type === ItemType.Divider) {
            return false;
          }
          return i !== 0 && i !== list.length - 1;
        }
        return true;
      });
  }, [actions, type, selection, app.plugins.enabledPlugins]);

  useEffect(() => {
    if (type === 'normal') {
      calcPosition();
      const observer = new ResizeObserver(calcPosition);
      observer.observe(out!);
      out!.addEventListener('scroll', calcPosition);
      window.addEventListener('popkit-popover-render', calcPosition);
      return () => {
        observer.unobserve(out!);
        out!.removeEventListener('scroll', calcPosition);
        window.removeEventListener('popkit-popover-render', calcPosition);
      };
    }
  }, [type, editor]);

  useLayoutEffect(() => {
    if (positionLeft !== 0 && positionTop !== 0) {
      setFirstRender(pre => Math.min(pre + 1, 10));
    }
  }, [positionLeft, positionTop]);

  if (!filterList.some(i => i.type === ItemType.Action)) {
    return null;
  }

  return (
    <div
      style={{
        transform: type === 'normal' ? `translate(${positionLeft}px, ${positionTop}px)` : undefined,
        transition: firstRender <= 0 ? 'none' : 'transform 50ms ease-in-out',
        opacity: firstRender < 0 ? 0 : 1,
      }}
      className={`popkit-container ${type === 'normal' ? 'popkit-normal' : 'popkit-setting'}`}
    >
      <ul ref={listRef}>
        {filterList.map((popoverItem, i) => (
          <li key={`${i}`}>
            {popoverItem.type === ItemType.Action && (
              <Item
                action={popoverItem.action}
                editor={editor}
                app={app}
                getMarkdown={getMarkdown}
                selection={(type === 'normal' ? selection : popoverItem.action.exampleText) || ''}
                finish={destory}
                replace={replace}
                type={type}
              />
            )}
            {popoverItem.type === ItemType.Divider && <div className="popkit-divider" />}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Popover;
