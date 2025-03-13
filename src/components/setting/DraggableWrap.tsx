import { useDraggable } from '@dnd-kit/core';

const DraggableWrap = ({ children, id }: { children?: React.ReactNode; id: string; }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
    data: {
      type: 'draggable',
    },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      {children}
      123
    </div>
  );
};

export default DraggableWrap;
