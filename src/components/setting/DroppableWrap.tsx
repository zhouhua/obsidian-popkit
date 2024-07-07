import { useDroppable } from '@dnd-kit/core';
import type { StyledComponent } from '@emotion/styled';

const DroppableWrap = ({ children, id, Component }: {
  children?: React.ReactNode;
  id: string;
  Component?: StyledComponent<
    object,
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    object
  >;
}) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  return Component
    ? (<Component ref={setNodeRef}>{children}</Component>)
    : (<div ref={setNodeRef}>{children}</div>);
};

export default DroppableWrap;
