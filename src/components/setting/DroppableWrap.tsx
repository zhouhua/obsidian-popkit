import { useDroppable } from '@dnd-kit/core';

const DroppableWrap = ({ children, id, Component }: {
  children?: React.ReactNode;
  id: string;
  Component?: React.ElementType;
}) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  return Component
    ? (<Component ref={setNodeRef}>{children}</Component>)
    : (<div ref={setNodeRef}>{children}</div>);
};

export default DroppableWrap;
