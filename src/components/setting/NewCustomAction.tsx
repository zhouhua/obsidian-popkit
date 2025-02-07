import type { App, Command, Plugin } from 'obsidian';
import { Notice } from 'obsidian';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import L from 'src/L';
import type { OrderItemProps } from 'src/utils';
import { fileToBase64, orderList } from 'src/utils';
import type { Action, IActionWithCommand, IActionWithHotkeys } from 'src/types';
import type { InternalPlugin } from 'obsidian-typings';
import { useDebounce } from 'ahooks';
import CommandForm from './action-types/command';
import HotkeysForm from './action-types/hotkeys';
import IconForm from './action-types/icon';
import { icons } from 'lucide-react';
import startCase from 'lodash/startCase';

type ActionType = 'command' | 'hotkeys';

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
  const [description, setDescription] = useState<string>('');
  const inputReference = useRef<HTMLInputElement>(null);
  const iconInputDebounce = useDebounce<string>(iconInput, { wait: 400 });
  const pluginInputDebounce = useDebounce<string>(pluginInput, { wait: 400 });
  const cmdInputDebounce = useDebounce<string>(cmdInput, { wait: 400 });

  interface PluginInfo {
    pluginName: string;
    plugin?: Plugin | InternalPlugin<object>;
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
        const pluginInfo = pluginId in plugins
          ? plugins[pluginId]
          : pluginId in internalPlugins
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            ? (internalPlugins as Record<string, InternalPlugin<object>>)[pluginId]
            : undefined;
        const isEnabled = app.plugins.enabledPlugins.has(pluginId)
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          || Boolean((internalPluginConfig as Record<string, boolean>)[pluginId]);

        if (pluginId && isEnabled === Boolean(pluginInfo)) {
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
      setPlugin(info[0]?.pluginName ?? '');
      setPluginInput(info[0]?.pluginName ?? '');
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
      let { icon: cmdIcon } = commands[cmd] ?? {};
      const { name: cmdName } = commands[cmd] ?? {};
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
      if (cmdName) {
        setDescription(cmdName);
      }
    }
    else if (actionType !== 'command') {
      setIcon('');
      setIconInput('');
    }
  }, [commands, plugin, cmd, actionType]);

  const orderedCmdList = useMemo<OrderItemProps<Command>[]>(() => {
    return orderList<Command>(
      info.find(i => i.pluginName === plugin)?.commands ?? [],
      cmdInputDebounce,
      (item: Command) => `${item.name}(${item.id})`,
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

  const upload = useCallback(async () => {
    const file = inputReference.current?.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setIcon(base64);
    }
  }, []);

  const add = useCallback(() => {
    if (!icon) {
      new Notice(L.setting.iconNotice());
      return;
    }

    let action: IActionWithCommand | IActionWithHotkeys;
    const baseAction = {
      icon,
      name: '',
      desc: description || '',
    };

    switch (actionType) {
      case 'command': {
        if (!plugin || !cmd) {
          new Notice(L.setting.commandNotice());
          return;
        }
        const command = commands[cmd];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!command) {
          new Notice(L.setting.invalidCommand());
          return;
        }
        action = {
          ...baseAction,
          name: command.name,
          desc: description || command.name,
          dependencies: [plugin],
          command: cmd,
        };
        break;
      }
      case 'hotkeys': {
        if (!hotkey) {
          new Notice(L.setting.hotkeysNotice());
          return;
        }
        if (!description) {
          new Notice(L.setting.descriptionNotice());
          return;
        }
        action = {
          ...baseAction,
          name: description,
          hotkeys: [hotkey],
        };
        break;
      }
    }

    onChange(action);
    new Notice(L.setting.addSuccess());
  }, [actionType, plugin, cmd, commands, icon, hotkey, description, onChange]);

  return (
    <div className="popkit-setting-form">
      <h3>{L.setting.customTitle()}</h3>

      {/* Action Type Selector */}
      <div className="setting-item" style={{ padding: '10px 0' }}>
        <div className="setting-item-info">
          <div className="setting-item-name">{L.setting.actionType()}</div>
          <div className="setting-item-description">
            {L.setting.actionTypeDesc()}
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
              {L.setting.commandLabel()}
            </label>
            <label className="pk-flex pk-items-center pk-gap-1">
              <input
                type="radio"
                checked={actionType === 'hotkeys'}
                onChange={() => { setActionType('hotkeys'); }}
              />
              {L.setting.hotkeysLabel()}
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

      {/* Hotkeys Type Fields */}
      {actionType === 'hotkeys' && (
        <HotkeysForm
          hotkey={hotkey}
          onChange={setHotkey}
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

      {/* Description Field - Always visible */}
      <div className="setting-item" style={{ padding: '10px 0' }}>
        <div className="setting-item-info">
          <div className="setting-item-name">{L.setting.descriptionLabel()}</div>
          <div className="setting-item-description">
            {L.setting.descriptionDesc()}
          </div>
        </div>
        <div className="setting-item-control">
          <input
            type="text"
            className="setting-hotkey-input"
            value={description}
            placeholder={L.setting.descriptionPlaceholder()}
            onChange={e => { setDescription(e.target.value); }}
          />
        </div>
      </div>

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
