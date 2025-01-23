import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      className={cn(
        'pk-z-50 pk-w-72 pk-rounded-md pk-border pk-bg-popover pk-p-4 pk-text-popover-foreground pk-shadow-md pk-outline-none pk-data-[state=open]:pk-animate-in pk-data-[state=closed]:pk-animate-out pk-data-[state=closed]:pk-fade-out-0 pk-data-[state=open]:pk-fade-in-0 pk-data-[state=closed]:pk-zoom-out-95 pk-data-[state=open]:pk-zoom-in-95 pk-data-[side=bottom]:pk-slide-in-from-top-2 pk-data-[side=left]:pk-slide-in-from-right-2 pk-data-[side=right]:pk-slide-in-from-left-2 pk-data-[side=top]:pk-slide-in-from-bottom-2',
        className,
      )}
      align={align}
      sideOffset={sideOffset}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
