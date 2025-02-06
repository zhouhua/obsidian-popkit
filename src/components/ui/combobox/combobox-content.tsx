import {
  Children,
  type ComponentPropsWithoutRef,
  isValidElement,
  type ReactElement,
  useEffect,
  useMemo,
} from 'react';
import type { ListChildComponentProps } from 'react-window';
import { FixedSizeList } from 'react-window';

import { PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { ComboboxItem, type ComboboxItemProps } from './combobox-item';
import { useComboboxContext } from './context';

const ITEM_HEIGHT = 28; // 每个选项的高度
const LIST_HEIGHT = 360; // 列表最大高度

interface VirtualizedListProps {
  children: ReactElement<ComboboxItemProps>[];
}

const VirtualizedList = ({ children }: VirtualizedListProps) => {
  if (!children.length) return null;

  const height = Math.min(children.length * ITEM_HEIGHT, LIST_HEIGHT);

  return (
    <div style={{ height }}>
      <FixedSizeList
        height={height}
        width="100%"
        itemCount={children.length}
        itemSize={ITEM_HEIGHT}
        className="pk-scrollbar-none pk-outline-none"
      >
        {({ index, style }: ListChildComponentProps) => (
          <div style={{ ...style, position: 'absolute', left: 0, right: 0 }}>
            {children[index]}
          </div>
        )}
      </FixedSizeList>
    </div>
  );
};

export const ComboboxContent = ({
  onOpenAutoFocus,
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof PopoverContent>) => {
  const { getMenuProps, isOpen, openedOnce, onItemsChange }
    = useComboboxContext();

  const childItems = useMemo(
    () =>
      Children.toArray(children).filter(
        (child): child is ReactElement<ComboboxItemProps> =>
          isValidElement(child) && child.type === ComboboxItem,
      ),
    [children],
  );

  const otherChildren = useMemo(
    () =>
      Children.toArray(children).filter(
        child =>
          !isValidElement(child) || child.type !== ComboboxItem,
      ),
    [children],
  );

  useEffect(() => {
    onItemsChange?.(
      childItems.map(child => ({
        disabled: child.props.disabled,
        label: child.props.label,
        value: child.props.value,
      })),
    );
  }, [childItems, onItemsChange]);

  return (
    <PopoverContent
      {...props}
      forceMount
      className={cn(
        'pk-w-[--radix-popper-anchor-width] pk-p-0 pk-overflow-hidden',
        !isOpen && 'pk-pointer-events-none',
        !openedOnce && 'pk-hidden',
        className,
      )}
      onOpenAutoFocus={e => {
        e.preventDefault();
        onOpenAutoFocus?.(e);
      }}
      {...getMenuProps?.({}, { suppressRefError: true })}
    >
      <VirtualizedList>
        {childItems}
      </VirtualizedList>
      {otherChildren}
    </PopoverContent>
  );
};
