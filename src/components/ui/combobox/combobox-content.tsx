import {
  Children,
  type ComponentPropsWithoutRef,
  isValidElement,
  type ReactElement,
  useEffect,
  useMemo,
} from 'react';

import { PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { ComboboxItem, type ComboboxItemProps } from './combobox-item';
import { useComboboxContext } from './context';

export const ComboboxContent = ({
  onOpenAutoFocus,
  children,
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
      asChild
      className={cn(
        'pk-w-[--radix-popper-anchor-width] !pk-p-0 pk-[[data-radix-popper-content-wrapper]:has(&)]:h-0',
        !isOpen && 'pk-pointer-events-none',
        !openedOnce && 'pk-hidden',
        'pk-max-h-[240px] pk-overflow-y-auto',
      )}
      onOpenAutoFocus={e => {
        e.preventDefault();
        onOpenAutoFocus?.(e);
      }}
      {...getMenuProps?.({}, { suppressRefError: true })}
    >
      <div>
        {children}
      </div>
    </PopoverContent>
  );
};
