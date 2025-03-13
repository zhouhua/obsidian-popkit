import { cn } from '@/lib/utils';
import type { IGroup } from '@/types';
import { ChevronDown, icons } from 'lucide-react';
import { setTooltip } from 'obsidian';
import type { MouseEvent } from 'react';
import { forwardRef, useEffect, useRef } from 'react';

interface GroupProps {
  group: IGroup;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  highlight?: boolean;
}

const Group = forwardRef<HTMLDivElement, GroupProps>(({ group, onClick, highlight = false }, ref) => {
  const { icon, description, name } = group;
  const itemRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const Icon = icons[icon as keyof typeof icons];

  useEffect(() => {
    if (itemRef.current) {
      setTooltip(itemRef.current, description || name, {
        placement: 'top',
        delay: 50,
      });
    }
  }, [itemRef.current, description, name]);
  return (
    <div ref={ref} style={{ touchAction: 'none' }}>
      <div
        ref={itemRef}
        className={cn('popkit-item', highlight && 'popkit-item-highlight')}
        onClick={onClick}
      >
        {icon && (
          /^https?:|^data:/.test(icon)
            ? (
              <div className="popkit-item-image" style={{ backgroundImage: `url(${icon})` }} />
            )
            : icon in icons
              ? (
                <Icon size={20} />
              )
              : (
                <div className="popkit-item-text">{icon}</div>
              )
        )}
        {!icon && (
          <div className="popkit-item-text">{name}</div>
        )}
        <ChevronDown size={8} />
      </div>
    </div>
  );
});

export default Group;
