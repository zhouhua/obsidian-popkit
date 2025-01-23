import { useCallback, useEffect, useState, type ChangeEvent, type ComponentPropsWithoutRef } from 'react';
import { PopoverAnchor } from '@radix-ui/react-popover';
import type { UseComboboxGetInputPropsReturnValue } from 'downshift';
import { ChevronDownIcon, X } from 'lucide-react';

import { Input } from '@/components/ui/input';

import { useComboboxContext } from './context';

export type ComboboxInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  keyof UseComboboxGetInputPropsReturnValue
> & {
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
};

export const ComboboxInput = (props: ComboboxInputProps) => {
  const { getInputProps } = useComboboxContext();
  const inputProps = getInputProps?.();
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const { value, onChange } = inputProps || {} as UseComboboxGetInputPropsReturnValue;

  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(props.value || '');
  }, [props.value]);

  const mergedOnChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange?.(e);
    props.onChange?.(e);
  }, [onChange, props.onChange]);

  return (
    <div className="pk-relative pk-w-full" data-combobox-input-wrapper="">
      <PopoverAnchor asChild>
        <Input {...props} {...getInputProps?.()} value={inputValue} type="text" onChange={mergedOnChange} />
      </PopoverAnchor>
      <div className="pk-absolute pk-inset-y-0 pk-end-3 pk-grid pk-h-full pk-place-items-center">
        {inputValue ? <X className="pk-size-4 pk-opacity-50 pk-cursor-pointer" onClick={() => { setInputValue(''); }} /> : <ChevronDownIcon className="pk-size-4 pk-opacity-50 cursor-pointer" />}
      </div>
    </div>
  );
};
