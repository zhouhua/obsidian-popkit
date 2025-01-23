import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ children, id, className }: { children: React.ReactNode; id: string; className?: string; }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        style={{
          transition: 'all 0.2s ease',
        }}
        className={className}
      >
        {children}
      </div>
    </div>
  );
};

export default SortableItem;
