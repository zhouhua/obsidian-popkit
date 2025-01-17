import type { App } from 'obsidian';
import type { FC, PropsWithChildren } from 'react';
import { useCallback, useState } from 'react';
import type { ISetting, PopoverItem, Action } from 'src/types';
import { ItemType } from 'src/types';
import buildIn from '../../actions';
import Item from '../Item';
import { changeAction } from 'src/utils';
import type {
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  DndContext,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import DraggableWrap from './DraggableWrap';
import SortableItem from './SortableItem';
import DroppableWrap from './DroppableWrap';
import L from 'src/L';
import NewCustomAction from './NewCustomAction';

const Add: FC<PropsWithChildren> = ({ children, ...props }) => <div className="popkit-setting-add" {...props}>{children}</div>;

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
    [setFormData, updateSetting],
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const [type, id] = `${active.id}`.split('_');
    if (type === 'custom') {
      setHighlight(true);
      setActiveItem({
        action: formData.customActionList[Number(id)],
        type: ItemType.Action,
        id: '',
      });
    }
    else if (type === 'list') {
      const activeAction = formData.actionList[Number(id)];
      setActiveItem(activeAction);
      setHighlight(true);
    }
    else if (type === 'all') {
      const activeAction = buildIn[Number(id)];
      setActiveItem({
        action: activeAction,
        type: ItemType.Action,
        id: `${active.id}`,
      });
      setHighlight(true);
    }
  }

  function handleDragCancel() {
    setActiveItem(null);
    setHighlight(false);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveItem(null);
    setHighlight(false);
    const { active, over } = event;
    if (!over) {
      return;
    }
    const [activType, activeId] = `${active.id}`.split('_');
    const [overType, overId] = `${over.id}`.split('_');
    if (overType === 'all') {
      return;
    }
    let newList = [...formData.actionList];
    let newCustomList = [...formData.customActionList];
    if (activType === 'all' && overType === 'list') {
      // 设置新的按钮
      newList.splice(Number(overId), 0, {
        action: buildIn[Number(activeId)],
        type: ItemType.Action,
        id: '',
      });
    }
    else if (activType === 'custom' && overType === 'list') {
      // 设置新的自定义按钮
      newList.splice(Number(overId), 0, {
        action: newCustomList[Number(activeId)],
        type: ItemType.Action,
        id: '',
      });
    }
    else if (activType === 'list' && overType === 'list') {
      // 调整顺序
      newList = arrayMove(newList, Number(activeId), Number(overId));
    }
    else if (activType === 'list' && overType === 'add') {
      // 调整顺序
      newList = arrayMove(newList, Number(activeId), newList.length - 1);
    }
    else if (activType === 'custom' && overType === 'custom') {
      // 调整自定义按钮顺序
      newCustomList = arrayMove(newCustomList, Number(activeId), Number(overId));
    }
    else if (activType === 'list' && overType === 'delete') {
      // 删除按钮
      newList.splice(Number(activeId), 1);
    }
    else if (activType === 'custom' && overType === 'delete') {
      // 删除自定义按钮
      newCustomList.splice(Number(activeId), 1);
    }
    else if (activType === 'all' && overType === 'add') {
      // 添加按钮
      newList.push(
        { type: ItemType.Action, action: buildIn[Number(activeId)], id: '' },
      );
    }
    else if (activType === 'custom' && overType === 'add') {
      // 添加自定义按钮
      newList.push(
        { type: ItemType.Action, action: newCustomList[Number(activeId)], id: '' },
      );
    }
    else if (activType === 'divider' && overType === 'list') {
      // 添加分割线
      newList.splice(Number(overId), 0, {
        type: ItemType.Divider,
        id: '',
      });
    }
    else if (activType === 'divider' && overType === 'add') {
      // 添加分割线
      newList.push({
        type: ItemType.Divider,
        id: '',
      });
    }
    else {
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
      customActionList: newCustomList,
    });
  }

  function addCustomAction(action: Action) {
    update({
      ...formData,
      customActionList: [...formData.customActionList, action],
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
    >
      <section className="popkit-setting-section">
        <h3>{L.setting.buildIn()}</h3>
        <div className="popkit-setting-actions-container">
          {buildIn.map((action, i) => (
            <DraggableWrap key={`all_${i}`} id={`all_${i}`}>
              <Item app={app} action={changeAction(action, 'setting', action.exampleText)} type="setting" />
            </DraggableWrap>
          ))}
          <DraggableWrap id="divider">
            <Item
              action={{
                name: 'divider',
                handlerString: '',
                desc: L.setting.divider(),
              }}
              app={app}
              type="setting"
            />
          </DraggableWrap>
        </div>
      </section>
      <section className="popkit-setting-section">
        <h3>{L.setting.custom()}</h3>
        <div className="popkit-setting-actions-container">
          {formData.customActionList.length
            // ? formData.customActionList.map((action, i) => (
            //   <DraggableWrap key={`custom_${i}`} id={`custom_${i}`}>
            //     <Item app={app} action={changeAction(action, 'setting', action.exampleText)} type="setting" />
            //   </DraggableWrap>
            // ))
            ? (
              <SortableContext
                items={formData.customActionList}
                strategy={horizontalListSortingStrategy}
              >
                {formData.customActionList.map((action, i) => (
                  <SortableItem key={`custom_${i}`} id={`custom_${i}`}>
                    <Item
                      app={app}
                      action={changeAction(action, 'setting', action.exampleText)}
                      type="setting"
                      selection={action.exampleText || ''}
                    />
                  </SortableItem>
                ))}
              </SortableContext>
            )
            : (
              <p>
                {L.setting.empty()}
              </p>
            )}
        </div>
      </section>
      <div className="popkit-setting-droppable-area popkit-popover">
        <div className="popkit-container popkit-setting">
          <SortableContext
            items={formData.actionList}
            strategy={horizontalListSortingStrategy}
          >
            {formData.actionList.map((popoverItem, i) => (
              <SortableItem key={`list_${i}`} id={`list_${i}`}>
                {
                  popoverItem.type === ItemType.Action
                    ? (
                      <Item
                        action={changeAction(popoverItem.action, 'setting', popoverItem.action.exampleText)}
                        selection={popoverItem.action.exampleText || ''}
                        app={app}
                        type="setting"
                      />
                    )
                    : <div className="popkit-divider" />
                }
              </SortableItem>
            ))}
          </SortableContext>
          <DroppableWrap id="add" Component={Add} />
        </div>
        <DroppableWrap id="delete">
          <div className={`popkit-setting-delete-area${highlight ? ' popkit-setting-delete-area-highlight' : ''}`}>{L.setting.delete()}</div>
        </DroppableWrap>
      </div>

      <NewCustomAction app={app} onChange={addCustomAction} />
      <DragOverlay
        style={{
          opacity: 0.8,
        }}
        className="popkit-popover"
      >
        {activeItem && (
          activeItem.type === ItemType.Action
            ? (
              <Item
                app={app}
                action={changeAction(activeItem.action, 'setting', activeItem.action.exampleText)}
                type="setting"
              />
            )
            : <div className="popkit-divider" />)}
      </DragOverlay>
    </DndContext>
  );
};

export default Setting;
