import { App } from "obsidian";
import { FC, useCallback, useState } from "react";
import { ISetting, PopoverItem, ItemType, IActionWithHandlerString } from "src/types";
import buildIn from "../../actions";
import Item from "../Item";
import { changeAction } from "src/utils";
import styled from "@emotion/styled";
import {
	DndContext,
	rectIntersection,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragOverlay,
	DragStartEvent,
	DragEndEvent,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import DraggableWrap from "./DraggableWrap";
import { Devider, PopoverContainer } from "../styles";
import SortableItem from "./SortableItem";
import DroppableWrap from "./DroppableWrap";
import L from "src/L";


const BuildInContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin-bottom: 10px;
	padding: 10px;
`;

const DeleteArea = styled.div<{ hightlight: boolean }>`
	height: 40px;
	border: 1px dashed ${props => props.hightlight ? 'red' : '#ccc'};
	border-radius: 4px;
	margin-top: 10px;
	display: flex;
	justify-content: center;
	align-items: center;
	color: ${props => props.hightlight ? 'red' : '#ccc'};
	transition: all 200ms ease-in-out;
`;

const Add = styled.div`
	flex-grow: 1;
	min-width: 20px;
`;

const Setting: FC<{
	initialSetting: ISetting;
	updateSetting: (data: ISetting) => void;
	app: App;
}> = ({ initialSetting, updateSetting, app }) => {
	const [formData, setFormData] = useState<ISetting>(initialSetting);
	const [highlight, setHighlight] = useState<boolean>(false);
	const [activeItem, setActiveItem] = useState<PopoverItem | null>(null);

	const update = useCallback(
		(data: ISetting) => {
			updateSetting(data);
			setFormData(data);
		},
		[setFormData, updateSetting]
	);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	function handleDragStart(event: DragStartEvent) {
		const { active } = event;
		const [type, id] = (active.id as string).split('_');
		if (type === 'all') {
			const activeAction = buildIn[Number(id)];
			setActiveItem({
				type: ItemType.Action,
				action: activeAction,
				id: '',
			});
		} else if (type === 'list') {
			const activeAction = formData.actionList[Number(id)];
			setActiveItem(activeAction);
			setHighlight(true);
		}
	}
	function handleDragEnd(event: DragEndEvent) {
		setActiveItem(null);
		setHighlight(false);
		const { active, over } = event;
		if (!over) {
			return;
		}
		const [activType, actioveId] = (active.id as string).split('_');
		const [overType, overId] = (over?.id as string).split('_');
		console.log(activType, actioveId, overType, overId);
		if (overType === 'all') {
			return;
		}
		let newList = [...formData.actionList];
		if (activType === 'all' && overType === 'list') {
			// 设置新的按钮
			newList.splice(Number(overId), 0, {
				action: buildIn[Number(actioveId)],
				type: ItemType.Action,
				id: '',
			});
		} else if (activType === 'list' && overType === 'list') {
			// 调整顺序
			newList = arrayMove(newList, Number(actioveId), Number(overId));
		} else if (activType === 'list' && overType === 'delete') {
			// 删除按钮
			newList.splice(Number(actioveId), 1);
		} else if (activType === 'all' && overType === 'add') {
			// 添加按钮
			newList.push(
				{ type: ItemType.Action, action: buildIn[Number(actioveId)], id: '' }
			);
		} else if (activType === 'divider' && overType === 'list') {
			// 添加分割线
			newList.splice(Number(overId), 0, {
				type: ItemType.Divider,
				id: '',
			});
		} else if (activType === 'divider' && overType === 'add') {
			// 添加分割线
			newList.push({
				type: ItemType.Divider,
				id: '',
			});
		} else {
			return;
		}
		newList = newList.filter((item, index) => {
			if (index > 0) {
				if (item.type === ItemType.Divider && newList[index - 1].type === ItemType.Divider) {
					return false;
				}
			}
			return true;
		});
		newList.forEach((item, index) => {
			item.id = `list_${index}`;
		});
		update({
			...formData,
			actionList: newList,
		});
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={rectIntersection}
			onDragEnd={handleDragEnd}
			onDragStart={handleDragStart}
		>
			<h3>{L.setting.buildIn()}</h3>
			<BuildInContainer>
				{buildIn.map((action, i) => (
					<DraggableWrap id={`all_${i}`} key={`all_${i}`}>
						<Item app={app} action={changeAction(action, 'setting', action.exampleText)} type="setting"></Item>
					</DraggableWrap>
				))}
				<DraggableWrap id="divider">
					<Item app={app} action={{
						name: 'divider',
						handlerString: '',
						desc: '分割线',
					} as IActionWithHandlerString} type="setting"></Item>
				</DraggableWrap>
			</BuildInContainer>
			<div>
				<PopoverContainer type="setting">
					<SortableContext
						items={formData.actionList}
						strategy={horizontalListSortingStrategy}
					>
						{formData.actionList.map((popoverItem, i) => (
							<SortableItem id={`list_${i}`} key={`list_${i}`}>{
								popoverItem.type === ItemType.Action ? <Item
									action={popoverItem.action}
									selection={popoverItem.action.exampleText || ''}
									app={app}
									type="setting"
								/> : <Devider />
							}</SortableItem>
						))}
					</SortableContext>
					<DroppableWrap id="add" Component={Add}></DroppableWrap>
				</PopoverContainer>
				<DroppableWrap id="delete"><DeleteArea hightlight={highlight}>{L.setting.delete()}</DeleteArea></DroppableWrap>
			</div>
			<DragOverlay>
				{activeItem && (
					activeItem.type === ItemType.Action ? (
						<Item
							app={app}
							action={changeAction(activeItem.action, 'setting', activeItem.action.exampleText)}
							type="setting">
						</Item>
					) : <Devider />)}
			</DragOverlay>
		</DndContext >
	);
};

export default Setting;
