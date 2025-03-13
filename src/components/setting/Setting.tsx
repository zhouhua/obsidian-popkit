/* eslint-disable @typescript-eslint/consistent-type-assertions */
import type { App } from 'obsidian';
import type { FC, PropsWithChildren, MouseEvent } from 'react';
import { Fragment, useCallback, useEffect, useState } from 'react';
import type { ISetting, PopoverItem, Action } from 'src/types';
import { ItemType } from 'src/types';
import buildIn from '../../actions';
import Item from '../Item';
import { changeAction } from 'src/utils';
import type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  DndContext,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
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
import Group from '../Group';
import { cn } from '@/lib/utils';

const Add: FC<PropsWithChildren> = ({ children, ...props }) => <div className="popkit-setting-add" {...props}>{children}</div>;

// 获取目标层级的列表
const getTargetList = (actionList: PopoverItem[], layerPath: string) => {
  if (!layerPath) return actionList;
  const indices = layerPath.split('-').map(Number);
  let current = actionList;
  for (const index of indices) {
    const item = current[index];
    if (item.type === ItemType.Group && item.group) {
      current = item.group.items;
    }
    else {
      return current;
    }
  }
  return current;
};

// 更新嵌套数组中的特定路径
const updateNestedList = (list: PopoverItem[], layerPath: string, newItems: PopoverItem[]) => {
  if (!layerPath) return newItems;
  const indices = layerPath.split('-').map(Number);
  const result = [...list];
  let current = result;
  for (let i = 0; i < indices.length - 1; i++) {
    const index = indices[i];
    const currentItem = current[index];
    if (currentItem.type === ItemType.Group && currentItem.group) {
      current = currentItem.group.items;
    }
  }
  const lastIndex = indices[indices.length - 1];
  const lastItem = current[lastIndex];
  if (lastItem.type === ItemType.Group && lastItem.group) {
    lastItem.group.items = newItems;
  }
  return result;
};

// 更新所有项目的 id
const updateIds = (items: PopoverItem[], parentPath = '') => {
  return items.map((item, index) => {
    const newId = `list-${parentPath}${index}`;
    if (item.type === ItemType.Group && item.group) {
      const newPath = parentPath ? `${parentPath}${index}-` : `${index}-`;
      item.group.items = updateIds(item.group.items, newPath);
    }
    return { ...item, id: newId };
  });
};

const Setting: FC<{
  initialSetting: ISetting;
  updateSetting: (data: ISetting) => void;
  app: App;
}> = ({ initialSetting, updateSetting, app }) => {
  const [formData, setFormData] = useState<ISetting>(initialSetting);
  const [highlight, setHighlight] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<PopoverItem | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [layers, setLayers] = useState<PopoverItem[][]>([]);
  const [selectedItems, setSelectedItems] = useState<PopoverItem[]>([]);
  useEffect(() => {
    setLayers([formData.actionList]);
  }, [formData.actionList]);

  const update = useCallback(
    (data: ISetting) => {
      updateSetting(data);
      setFormData(data);
    },
    [setFormData, updateSetting],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleClick(event: MouseEvent<HTMLDivElement>, layer: PopoverItem[], item: PopoverItem, layerIndex: number) {
    const prevIndex = selectedItems.findIndex(selectedItem => selectedItem.id === item.id);
    if (prevIndex === -1) {
      // 如果点击的是更浅层级的节点，需要截断当前路径
      if (layerIndex < selectedItems.length) {
        setSelectedItems([...selectedItems.slice(0, layerIndex), item]);
        setLayers(layers.slice(0, layerIndex + 1));
      }
      else {
        // 在当前路径上添加新节点
        setSelectedItems([...selectedItems, item]);
      }

      // 如果点击的是组，展开显示其内容
      if (item.type === ItemType.Group && item.group) {
        setLayers([...layers.slice(0, layerIndex + 1), item.group.items]);
      }
    }
    else {
      // 如果点击已选中的节点，收起该节点（移除该节点之后的所有选中状态）
      setSelectedItems(selectedItems.slice(0, prevIndex));
      setLayers(layers.slice(0, layerIndex + 1));
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const [type, id] = `${active.id}`.split(':');

    // 如果是点击事件，不处理拖拽
    if (active.data.current?.type !== 'sortable' && active.data.current?.type !== 'draggable') {
      return;
    }

    // 只有当拖动的是 list 或 custom 类型的项目时才显示删除区域高亮
    if (type === 'list' || type === 'custom') {
      setHighlight(true);
    }

    if (type === 'custom') {
      const action = formData.customActionList[Number(id)];
      setActiveItem({
        type: ItemType.Action,
        action,
        id: String(active.id),
      });
    }
    else if (type === 'list') {
      const parts = id.split('-');
      const layerPath = parts.slice(0, -1).join('-');
      const index = Number(parts[parts.length - 1]);
      const list = getTargetList(formData.actionList, layerPath);
      const activeAction = list[index];
      setActiveItem(activeAction);
    }
    else if (type === 'all') {
      const action = buildIn[Number(id)];
      setActiveItem({
        type: ItemType.Action,
        action,
        id: String(active.id),
      });
    }
    else if (type === 'divider') {
      setActiveItem({
        type: ItemType.Divider,
        id: String(active.id),
      });
    }
    else if (type === 'group') {
      setActiveItem({
        type: ItemType.Group,
        id: String(active.id),
        group: {
          name: 'New Group',
          description: 'New Group',
          icon: 'Folder',
          items: [],
        },
      });
    }
  }

  function handleDragCancel() {
    setActiveItem(null);
    setHighlight(false);
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    setOverId(over?.id as string || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // 重置状态
    setActiveItem(null);
    setHighlight(false);
    setOverId(null);

    if (!over) {
      return;
    }

    // ID 格式：type:id
    // - all:1 表示第2个内置动作
    // - custom:1 表示第2个自定义动作
    // - list:0-1 表示根层级第2个项目
    // - list:0-1-2 表示根层级第2个组内的第3个项目
    // - add:0-1 表示第2个组的添加区域
    // - delete 表示删除区域
    const [activeType, activeId] = `${active.id}`.split(':');
    const [overType, overId] = `${over.id}`.split(':');

    let activeIndex = activeId;
    let overIndex = overId;
    let activeLayerPath = '';
    let overLayerPath = '';

    // 如果是 list 类型，需要进一步解析路径
    if (activeType === 'list') {
      const parts = activeId.split('-');
      activeIndex = parts[parts.length - 1];
      activeLayerPath = parts.slice(0, -1).join('-');
    }
    if (overType === 'list') {
      const parts = overId.split('-');
      overIndex = parts[parts.length - 1];
      overLayerPath = parts.slice(0, -1).join('-');
    }

    // 如果是拖到 buildIn 区域，直接返回
    if (overType === 'all') {
      return;
    }

    // 如果内置工具拖到删除区域，直接返回
    if (activeType === 'all' && overType === 'delete') {
      return;
    }

    // 检查是否形成循环依赖
    const isCircularMove = () => {
      if (activeType !== 'list' || !activeLayerPath) return false;
      // 检查目标路径是否是源路径的子路径
      return overLayerPath.startsWith(`${activeLayerPath}-`);
    };

    // 检查是否移动到已展开的组的下级
    const isMovingToOpenedLayer = () => {
      if (activeType !== 'list') return false;
      // 检查是否移动到已展开的层级中
      return layers.some((_, index) => {
        const selectedItem = selectedItems[index - 1];
        if (!selectedItem) return false;
        const selectedPath = selectedItem.id.split('-').slice(1, -1).join('-');
        return overLayerPath.startsWith(`${selectedPath}-`);
      });
    };

    if (isCircularMove() || isMovingToOpenedLayer()) {
      return;
    }

    let newList = [...formData.actionList];
    const newCustomList = [...formData.customActionList];

    // 处理删除操作
    if (overType === 'delete') {
      if (activeType === 'list') {
        const sourceList = getTargetList(newList, activeLayerPath);
        const deletedItem = sourceList[Number(activeIndex)];
        sourceList.splice(Number(activeIndex), 1);
        newList = updateNestedList(newList, activeLayerPath, sourceList);

        // 更新选中状态和层级显示
        const itemIndex = selectedItems.findIndex(item => item.id === deletedItem.id);
        if (itemIndex !== -1) {
          setSelectedItems(selectedItems.slice(0, itemIndex));
          setLayers(layers.slice(0, itemIndex + 1));
        }
      }
      else if (activeType === 'custom') {
        newCustomList.splice(Number(activeIndex), 1);
      }

      // 更新数据后直接返回
      newList = updateIds(newList);
      update({
        ...formData,
        actionList: newList,
        customActionList: newCustomList,
      });
      return;
    }
    if (activeType === 'all' && overType === 'list') {
      // 添加内置动作到目标组
      const targetList = getTargetList(newList, overLayerPath);
      const newItem: PopoverItem = {
        type: ItemType.Action,
        action: buildIn[Number(activeIndex)],
        id: `list-${overLayerPath ? `${overLayerPath}-` : ''}${targetList.length}`,
      } as const;
      targetList.splice(Number(overIndex), 0, newItem);
      newList = updateNestedList(newList, overLayerPath, targetList);
    }
    else if (activeType === 'custom' && overType === 'list') {
      // 添加自定义动作到目标组
      const targetList = getTargetList(newList, overLayerPath);
      const newItem: PopoverItem = {
        type: ItemType.Action,
        action: newCustomList[Number(activeIndex)],
        id: `list-${overLayerPath ? `${overLayerPath}-` : ''}${targetList.length}`,
      } as const;
      targetList.splice(Number(overIndex), 0, newItem);
      newList = updateNestedList(newList, overLayerPath, targetList);
    }
    else if (activeType === 'list' && overType === 'list') {
      // 组内或组间项目移动
      const sourceList = getTargetList(newList, activeLayerPath);
      const targetList = getTargetList(newList, overLayerPath);

      if (activeLayerPath === overLayerPath) {
        // 同组内移动
        const newItems = arrayMove(sourceList, Number(activeIndex), Number(overIndex));
        newList = updateNestedList(newList, activeLayerPath, newItems);
      }
      else {
        // 不同组间移动
        const [movedItem] = sourceList.splice(Number(activeIndex), 1);
        targetList.splice(Number(overIndex), 0, movedItem);
        newList = updateNestedList(newList, activeLayerPath, sourceList);
        newList = updateNestedList(newList, overLayerPath, targetList);
      }
    }
    else if (activeType === 'group' && overType === 'list') {
      // 添加新组
      const targetList = getTargetList(newList, overLayerPath);
      const newGroup: PopoverItem = {
        type: ItemType.Group,
        id: `list-${overLayerPath ? `${overLayerPath}-` : ''}${targetList.length}`,
        group: {
          name: 'New Group',
          items: [],
        },
      };
      targetList.splice(Number(overIndex), 0, newGroup);
      newList = updateNestedList(newList, overLayerPath, targetList);
    }
    else if (activeType === 'divider' && overType === 'list') {
      // 添加分割线到目标组
      const targetList = getTargetList(newList, overLayerPath);
      const newItem: PopoverItem = {
        type: ItemType.Divider,
        id: `list-${overLayerPath ? `${overLayerPath}-` : ''}${targetList.length}`,
      } as const;
      targetList.splice(Number(overIndex), 0, newItem);
      newList = updateNestedList(newList, overLayerPath, targetList);
    }
    else if (activeType === 'list' && overType === 'add') {
      // 从 add id 中获取层级路径
      const addLayerPath = overLayerPath;
      // 移动到末尾
      const sourceList = getTargetList(newList, activeLayerPath);
      const [movedItem] = sourceList.splice(Number(activeIndex), 1);
      sourceList.push(movedItem);
      newList = updateNestedList(newList, activeLayerPath, sourceList);
    }
    else if (activeType === 'all' && overType === 'add') {
      // 从 add id 中获取层级路径
      const addLayerPath = overLayerPath;
      // 添加内置动作到末尾
      const targetList = getTargetList(newList, addLayerPath);
      const newItem: PopoverItem = {
        type: ItemType.Action,
        action: buildIn[Number(activeIndex)],
        id: `list-${addLayerPath ? `${addLayerPath}-` : ''}${targetList.length}`,
      } as const;
      targetList.push(newItem);
      newList = updateNestedList(newList, addLayerPath, targetList);
    }
    else if (activeType === 'custom' && overType === 'add') {
      // 从 add id 中获取层级路径
      const addLayerPath = overLayerPath;
      // 添加自定义动作到末尾
      const targetList = getTargetList(newList, addLayerPath);
      const newItem: PopoverItem = {
        type: ItemType.Action,
        action: newCustomList[Number(activeIndex)],
        id: `list-${addLayerPath ? `${addLayerPath}-` : ''}${targetList.length}`,
      } as const;
      targetList.push(newItem);
      newList = updateNestedList(newList, addLayerPath, targetList);
    }
    else if (activeType === 'divider' && overType === 'add') {
      // 从 add id 中获取层级路径
      const addLayerPath = overLayerPath;
      // 添加分割线到末尾
      const targetList = getTargetList(newList, addLayerPath);
      const newItem: PopoverItem = {
        type: ItemType.Divider,
        id: `list-${addLayerPath ? `${addLayerPath}-` : ''}${targetList.length}`,
      } as const;
      targetList.push(newItem);
      newList = updateNestedList(newList, addLayerPath, targetList);
    }
    else if (activeType === 'group' && overType === 'add') {
      // 从 add id 中获取层级路径
      const addLayerPath = overLayerPath;
      // 添加新组到末尾
      const targetList = getTargetList(newList, addLayerPath);
      const newGroup: PopoverItem = {
        type: ItemType.Group,
        id: `list-${addLayerPath ? `${addLayerPath}-` : ''}${targetList.length}`,
        group: {
          name: 'New Group',
          description: 'New Group',
          icon: 'Folder',
          items: [],
        },
      };
      targetList.push(newGroup);
      newList = updateNestedList(newList, addLayerPath, targetList);
    }
    else {
      return;
    }

    // 过滤连续的分割线
    newList = newList.filter((item, index) => {
      if (index > 0) {
        if (item.type === ItemType.Divider && newList[index - 1].type === ItemType.Divider) {
          return false;
        }
      }
      return true;
    });

    // 更新所有项目的 id
    newList = updateIds(newList);

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
      onDragOver={handleDragOver}
    >
      <section className="popkit-setting-section">
        <h3>{L.setting.buildIn()}</h3>
        <div className="popkit-setting-actions-container">
          {buildIn.map((action, i) => (
            <DraggableWrap key={`all:${i}`} id={`all:${i}`}>
              <Item
                app={app}
                action={changeAction(action, 'setting', action.exampleText)}
                type="setting"
              />
            </DraggableWrap>
          ))}
          <DraggableWrap id="divider">
            <Item
              action={{
                name: L.setting.divider(),
                handlerString: '',
                desc: L.setting.divider(),
              }}
              app={app}
              type="setting"
            />
          </DraggableWrap>
          <DraggableWrap id="group">
            <Item
              action={{
                name: L.setting.group(),
                handlerString: '',
                desc: L.setting.group(),
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
            ? (
              <SortableContext
                items={formData.customActionList.map((_, i) => `custom:${i}`)}
                strategy={horizontalListSortingStrategy}
              >
                {formData.customActionList.map((action, i) => (
                  <SortableItem key={`custom:${i}`} id={`custom:${i}`}>
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
              <p>{L.setting.empty()}</p>
            )}
        </div>
      </section>

      <div className="popkit-setting-droppable-area popkit-popover">
        {layers.map((items, index) => (
          <Fragment key={`list-${index}`}>
            <div
              style={{
                marginTop: index > 0 ? '40px' : '0',
              }}
              className="popkit-container popkit-setting"
            >
              {index > 0 && selectedItems[index - 1]?.type === ItemType.Group && (
                <div className="popkit-setting-group-header">
                  <div className="popkit-setting-group-title">
                    {selectedItems[index - 1].group?.name}
                  </div>
                  <div className="popkit-setting-group-actions">
                    <button
                      className="popkit-setting-group-edit"
                      onClick={() => {
                        const group = selectedItems[index - 1];
                        if (group.type !== ItemType.Group || !group.group) return;

                        // 创建一个新的组配置
                        const newGroup = {
                          ...group,
                          group: {
                            ...group.group,
                            name: prompt('输入组名称', group.group.name) || group.group.name,
                            description: prompt('输入组描述', group.group.description) || group.group.description,
                            icon: prompt('输入组图标', group.group.icon) || group.group.icon,
                          },
                        };

                        // 更新组配置
                        const parentPath = group.id.split('-').slice(0, -1).join('-');
                        const groupIndex = Number(group.id.split('-').pop());
                        const parentList = getTargetList(formData.actionList, parentPath);
                        parentList[groupIndex] = newGroup;
                        let newList = formData.actionList;
                        if (parentPath) {
                          newList = updateNestedList(newList, parentPath, parentList);
                        }
                        else {
                          newList = parentList;
                        }
                        newList = updateIds(newList);

                        // 更新选中状态
                        const newSelectedItems = [...selectedItems];
                        newSelectedItems[index - 1] = newGroup;
                        setSelectedItems(newSelectedItems);

                        update({
                          ...formData,
                          actionList: newList,
                        });
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              <SortableContext
                items={items.map((_, i) => {
                  const path = selectedItems.slice(0, index).map(item => item.id.split('-').pop()).join('-');
                  return `list:${path ? `${path}-` : ''}${i}`;
                })}
                strategy={horizontalListSortingStrategy}
              >
                {items.map((popoverItem, i) => {
                  const path = selectedItems.slice(0, index).map(item => item.id.split('-').pop()).join('-');
                  const id = `list:${path ? `${path}-` : ''}${i}`;
                  const isOver = overId === id;

                  return (
                    <SortableItem
                      key={id}
                      id={id}
                      className={isOver ? 'popkit-sortable-over' : ''}
                    >
                      {popoverItem.type === ItemType.Action && (
                        <Item
                          action={changeAction(popoverItem.action, 'setting', popoverItem.action.exampleText)}
                          selection={popoverItem.action.exampleText || ''}
                          app={app}
                          type="setting"
                          highlight={selectedItems.some(item => item.id === id)}
                          onClick={event => { handleClick(event, items, popoverItem, index); }}
                        />
                      )}
                      {popoverItem.type === ItemType.Divider && (
                        <div className="popkit-divider" />
                      )}
                      {popoverItem.type === ItemType.Group && (
                        <Group
                          group={popoverItem.group}
                          highlight={selectedItems.some(item => item.id === id)}
                          onClick={event => { handleClick(event, items, popoverItem, index); }}
                        />
                      )}
                    </SortableItem>
                  );
                })}
              </SortableContext>
              <DroppableWrap id={`add:${selectedItems.slice(0, index).map(item => item.id.split('-').pop()).join('-')}`} Component={Add} />
            </div>
          </Fragment>
        ))}
        <DroppableWrap id="delete">
          <div className={cn('popkit-setting-delete-area', highlight && 'popkit-setting-delete-area-highlight')}>{L.setting.delete()}</div>
        </DroppableWrap>
      </div>

      <NewCustomAction app={app} onChange={addCustomAction} />
      <DragOverlay
        style={{
          opacity: 0.7,
          cursor: 'grabbing',
          transformOrigin: '0 0',
        }}
        dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}
        className="popkit-popover popkit-drag-overlay"
      >
        {activeItem && (
          <div>
            {activeItem.type === ItemType.Action && (
              <Item
                app={app}
                action={changeAction(activeItem.action, 'setting', activeItem.action.exampleText)}
                type="setting"
              />
            )}
            {activeItem.type === ItemType.Divider && (
              <div className="popkit-divider" />
            )}
            {activeItem.type === ItemType.Group && (
              <Group
                group={activeItem.group}
                onClick={() => void 0}
              />
            )}
            000
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default Setting;
