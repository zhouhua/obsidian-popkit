import { useDroppable } from '@dnd-kit/core';
import { StyledComponent } from '@emotion/styled';

const DroppableWrap = ({ children, id, Component }: {
	children?: React.ReactNode;
	id: string;
	Component?: StyledComponent<{}, React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>
}) => {
	const { setNodeRef } = useDroppable({
		id,
	});

	return Component ?
		(<Component ref={setNodeRef}>{children}</Component>) :
		(<div ref={setNodeRef}>{children}</div>);
};

export default DroppableWrap;
