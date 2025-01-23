import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'pk-flex pk-h-9 pk-w-full pk-rounded-md pk-border pk-border-input pk-bg-transparent pk-px-3 pk-py-1 pk-text-base pk-shadow-sm pk-transition-colors pk-file:pk-border-0 pk-file:pk-bg-transparent pk-file:pk-text-sm pk-file:pk-font-medium pk-file:pk-text-foreground pk-placeholder:pk-text-muted-foreground pk-focus-visible:pk-outline-none pk-focus-visible:pk-ring-1 pk-focus-visible:pk-ring-ring pk-disabled:pk-cursor-not-allowed pk-disabled:pk-opacity-50 pk-md:pk-text-sm',
          className,
        )}
        type={type}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
