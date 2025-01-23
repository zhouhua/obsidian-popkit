import { type ComponentPropsWithoutRef, useMemo } from 'react';
import { CircleIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { useComboboxContext } from './context';
import type { ComboboxItemBase } from './types';

export type ComboboxItemProps = ComboboxItemBase &
  ComponentPropsWithoutRef<'li'>;

export const ComboboxItem = ({
  label,
  value,
  disabled,
  className,
  children,
  ...props
}: ComboboxItemProps) => {
  const { filteredItems, getItemProps, selectedItem } = useComboboxContext();

  const isSelected = selectedItem?.value === value;
  const item = useMemo(
    () => ({ disabled, label, value }),
    [disabled, label, value],
  );
  const index = (filteredItems || []).findIndex(
    item => item.value.toLowerCase() === value.toLowerCase(),
  );
  if (index < 0) return null;

  return (
    <li
      {...props}
      className={cn(
        'pk-relative pk-flex pk-cursor-default pk-select-none pk-flex-col pk-rounded-sm pk-px-3 pk-py-1.5 pk-aria-disabled:pk-pointer-events-none pk-aria-disabled:pk-opacity-50 pk-aria-selected:pk-bg-accent pk-aria-selected:pk-text-accent-foreground',
        !children && 'pk-ps-8',
        className,
      )}
      data-index={index}
      {...getItemProps?.({ item, index })}
    >
      {children || (
        <>
          <span className="pk-text-sm pk-text-foreground">{label}</span>
          {isSelected && (
            <span className="pk-absolute pk-start-3 pk-top-0 pk-flex pk-h-full pk-items-center pk-justify-center">
              <CircleIcon className="pk-size-2 pk-fill-current" />
            </span>
          )}
        </>
      )}
    </li>
  );
};
