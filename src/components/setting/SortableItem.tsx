import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

const SortableItem = ({children, id}: {children: React.ReactNode; id: string}) => {
	const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			{children}
		</div>
	);
};

export default SortableItem;
