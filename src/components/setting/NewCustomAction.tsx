import type { App, Command, Plugin } from 'obsidian';
import { Notice } from 'obsidian';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import L from 'src/L';
import type { OrderItemProps } from 'src/utils';
import { fileToBase64, orderList } from 'src/utils';
import type { Action } from 'src/types';
import type { InternalPluginName, InternalPlugin, InternalPluginInstance } from 'obsidian-typings';
import { useDebounce } from 'ahooks';
import CommandForm from './action-types/command';
import HotkeysForm from './action-types/hotkeys';
import IconForm from './action-types/icon';
import HandlerForm from './action-types/handler';
import { icons } from 'lucide-react';
import startCase from 'lodash/startCase';

type ActionType = 'command' | 'hotkeys' | 'handlerString';

const NewCustomAction: FC<{
  app: App;
  onChange: (action: Action) => void;
}> = ({ app, onChange }) => {
  const [actionType, setActionType] = useState<ActionType>('command');
  const [icon, setIcon] = useState<string>('');
  const [plugin, setPlugin] = useState<string>('');
  const [cmd, setCmd] = useState<string>('');
  const [iconInput, setIconInput] = useState<string>('');
  const [pluginInput, setPluginInput] = useState<string>('');
  const [cmdInput, setCmdInput] = useState<string>('');
  const [hotkey, setHotkey] = useState<string>('');
  const [handlerString, setHandlerString] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const inputReference = useRef<HTMLInputElement>(null);
  const iconInputDebounce = useDebounce<string>(iconInput, { wait: 400 });
  const pluginInputDebounce = useDebounce<string>(pluginInput, { wait: 400 });
  const cmdInputDebounce = useDebounce<string>(cmdInput, { wait: 400 });

  interface PluginInfo {
    pluginName: string;
    plugin?: Plugin | InternalPlugin<{ name: string; } & InternalPluginInstance<object>>;
    isEnabled: boolean;
    commands: Command[];
  }

  const { commands } = app.commands;
  const { plugins } = app.plugins;
  const { plugins: internalPlugins, config: internalPluginConfig } = app.internalPlugins;
  const info: Array<PluginInfo> = [];
  Object.keys(commands).forEach(key => {
    const [pluginId, cmdId] = key.split(':');
    if (pluginId && cmdId) {
      const cache = info.find(i => i.pluginName === pluginId);
      if (cache) {
        cache.commands.push(commands[key]);
      }
      else {
        const pluginInfo: Plugin | InternalPlugin | undefined = pluginId in plugins
          ? plugins[pluginId]
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          : (pluginId in internalPlugins ? internalPlugins[pluginId as InternalPluginName] : undefined);

        const isEnabled = app.plugins.enabledPlugins.has(pluginId)
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          || !!internalPluginConfig[pluginId as InternalPluginName];
        if (pluginId && (!isEnabled === !pluginInfo)) {
          info.push({
            pluginName: pluginId,
            plugin: pluginInfo,
            isEnabled,
            commands: [commands[key]],
          });
        }
      }
    }
  });

  useEffect(() => {
    if (!plugin) {
      setPlugin(info[0]?.pluginName);
      setPluginInput(info[0]?.pluginName);
    }
  }, [info.length, plugin]);

  useEffect(() => {
    if (plugin) {
      const cache = info.find(i => i.pluginName === plugin);
      if (cache?.commands.length && !cache.commands.find(c => c.id === cmd)) {
        setCmd(cache.commands[0].id);
        setCmdInput(cache.commands[0].id);
      }
    }
    else {
      setCmd('');
      setCmdInput('');
    }
  }, [plugin, info, cmd]);

  useEffect(() => {
    if (plugin && cmd) {
      let { icon: cmdIcon } = commands[cmd];
      if (cmdIcon?.startsWith('lucide-')) {
        cmdIcon = cmdIcon.replace(/^lucide-/, '').replace(/\s/g, '');
      }
      if (cmdIcon) {
        cmdIcon = startCase(cmdIcon).replace(/\s/g, '');
        if (cmdIcon in icons) {
          setIcon(cmdIcon);
          setIconInput(cmdIcon);
        }
      }
    }
    else if (actionType !== 'command') {
      setIcon('');
      setIconInput('');
    }
  }, [commands, plugin, cmd, actionType]);

  const orderedCmdList = useMemo<OrderItemProps<Command>[]>(() => {
    return orderList<Command>(
      info.find(i => i.pluginName === plugin)?.commands || [],
      cmdInputDebounce,
      item => item.name,
    );
  }, [info, plugin, cmdInputDebounce]);

  const orderedIconList = useMemo<OrderItemProps<string>[]>(() => {
    return orderList<string>(Object.keys(icons), iconInputDebounce);
  }, [iconInputDebounce]);

  const orderedPluginList = useMemo<OrderItemProps<PluginInfo>[]>(() => {
    return orderList<PluginInfo>(
      info,
      pluginInputDebounce,
      item => item.pluginName,
    );
  }, [info, pluginInputDebounce]);

  const upload = async () => {
    const file = inputReference.current?.files?.[0];
    if (file) {
      setIcon(await fileToBase64(file));
    }
  };

  const add = useCallback(() => {
    if (!icon) {
      new Notice('请选择图标');
      return;
    }

    let action: Action;
    const baseAction = {
      icon,
      name: '',
      desc: description || '',
    };

    switch (actionType) {
      case 'command':
        if (!plugin || !cmd) {
          new Notice('请选择命令');
          return;
        }
        action = {
          ...baseAction,
          name: commands[cmd].name,
          desc: description || commands[cmd].name,
          dependencies: [plugin],
          command: cmd,
        };
        break;
      case 'hotkeys':
        if (!hotkey) {
          new Notice('请设置快捷键');
          return;
        }
        if (!description) {
          new Notice('请输入描述');
          return;
        }
        action = {
          ...baseAction,
          name: description,
          hotkeys: [hotkey],
        };
        break;
      case 'handlerString':
        if (!handlerString) {
          new Notice('请输入处理函数');
          return;
        }
        if (!description) {
          new Notice('请输入描述');
          return;
        }
        action = {
          ...baseAction,
          name: description,
          handlerString,
        };
        break;
    }

    onChange(action);
    new Notice(L.setting.addSuccess());
  }, [actionType, plugin, cmd, icon, hotkey, handlerString, description, onChange]);

  return (
    <div className="popkit-setting-form">
      <h3>{L.setting.customTitle()}</h3>

      {/* Action Type Selector */}
      <div className="setting-item" style={{ padding: '10px 0' }}>
        <div className="setting-item-info">
          <div className="setting-item-name">Action Type</div>
          <div className="setting-item-description">
            Select the type of action you want to create
          </div>
        </div>
        <div className="setting-item-control">
          <div className="pk-flex pk-gap-4">
            <label className="pk-flex pk-items-center pk-gap-1">
              <input
                type="radio"
                checked={actionType === 'command'}
                onChange={() => { setActionType('command'); }}
              />
              Command
            </label>
            <label className="pk-flex pk-items-center pk-gap-1">
              <input
                type="radio"
                checked={actionType === 'hotkeys'}
                onChange={() => { setActionType('hotkeys'); }}
              />
              Hotkeys
            </label>
            <label className="pk-flex pk-items-center pk-gap-1">
              <input
                type="radio"
                checked={actionType === 'handlerString'}
                onChange={() => { setActionType('handlerString'); }}
              />
              Handler
            </label>
          </div>
        </div>
      </div>

      {/* Command Type Fields */}
      {actionType === 'command' && (
        <CommandForm
          app={app}
          plugin={plugin}
          cmd={cmd}
          pluginInput={pluginInput}
          cmdInput={cmdInput}
          orderedPluginList={orderedPluginList}
          orderedCmdList={orderedCmdList}
          setPlugin={setPlugin}
          setPluginInput={setPluginInput}
          setCmd={setCmd}
          setCmdInput={setCmdInput}
        />
      )}

      {/* Description Field - 只在 hotkeys 和 handlerString 类型时显示 */}
      {(actionType === 'hotkeys' || actionType === 'handlerString') && (
        <div className="setting-item" style={{ padding: '10px 0' }}>
          <div className="setting-item-info">
            <div className="setting-item-name">Description</div>
            <div className="setting-item-description">
              Enter a description for this action
            </div>
          </div>
          <div className="setting-item-control">
            <input
              type="text"
              className="setting-hotkey-input"
              value={description}
              placeholder="Enter description"
              onChange={e => { setDescription(e.target.value); }}
            />
          </div>
        </div>
      )}

      {/* Hotkeys Type Fields */}
      {actionType === 'hotkeys' && (
        <HotkeysForm
          hotkey={hotkey}
          onChange={setHotkey}
        />
      )}

      {/* Handler Type Fields */}
      {actionType === 'handlerString' && (
        <HandlerForm
          value={handlerString}
          onChange={setHandlerString}
        />
      )}

      {/* Icon Selector - Always visible */}
      <IconForm
        icon={icon}
        iconInput={iconInput}
        orderedIconList={orderedIconList}
        setIcon={setIcon}
        setIconInput={setIconInput}
        inputReference={inputReference}
        onUpload={upload}
      />

      {/* Add Button */}
      <div className="setting-item" style={{ padding: '10px 0' }}>
        <div className="setting-item-info"></div>
        <div className="setting-item-control">
          <button onClick={add}>{L.setting.add()}</button>
        </div>
      </div>
    </div>
  );
};

export default NewCustomAction;
