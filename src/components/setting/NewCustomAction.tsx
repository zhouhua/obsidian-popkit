import type { App, Command } from 'obsidian';
import { Notice } from 'obsidian';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import L from 'src/L';
import type { OrderItemProps } from 'src/utils';
import { fileToBase64, orderList } from 'src/utils';
import type { Action, IActionWithCommand, IActionWithHotkeys } from 'src/types';
import { useDebounce } from 'ahooks';
import CommandForm from './action-types/command';
import HotkeysForm from './action-types/hotkeys';
import IconForm from './action-types/icon';
import RegexForm from './action-types/regex';
import { icons } from 'lucide-react';
import startCase from 'lodash/startCase';

type ActionType = 'command' | 'hotkeys';

const NewCustomAction: FC<{
  app: App;
  onChange: (action: Action) => void;
}> = ({ app, onChange }) => {
  const [actionType, setActionType] = useState<ActionType>('command');
  const [icon, setIcon] = useState<string>('');
  const [cmd, setCmd] = useState<string>('');
  const [iconInput, setIconInput] = useState<string>('');
  const [cmdInput, setCmdInput] = useState<string>('');
  const [hotkey, setHotkey] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [test, setTest] = useState<string>('');
  const inputReference = useRef<HTMLInputElement>(null);
  const iconInputDebounce = useDebounce<string>(iconInput, { wait: 400 });
  const cmdInputDebounce = useDebounce<string>(cmdInput, { wait: 400 });

  interface CommandWithPluginInfo extends Command {
    pluginId: string;
  }

  const { commands } = app.commands;
  const { plugins } = app.plugins;
  const { plugins: internalPlugins, config: internalPluginConfig } = app.internalPlugins;

  // 创建一个包含所有命令的统一列表，同时保留命令所属的插件信息
  const allCommands: CommandWithPluginInfo[] = useMemo(() => {
    const result: CommandWithPluginInfo[] = [];
    Object.keys(commands).forEach(key => {
      const [pluginId, cmdId] = key.split(':');
      if (pluginId && cmdId) {
        const isEnabled = app.plugins.enabledPlugins.has(pluginId)
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          || Boolean((internalPluginConfig as Record<string, boolean>)[pluginId]);

        const pluginExists = pluginId in plugins || pluginId in internalPlugins;

        if (pluginId && isEnabled && pluginExists) {
          const command = commands[key];
          result.push({
            ...command,
            pluginId,
          });
        }
      }
    });
    return result;
  }, [commands, plugins, internalPlugins, internalPluginConfig, app.plugins.enabledPlugins]);

  useEffect(() => {
    if (cmd) {
      const selectedCommand = allCommands.find(c => c.id === cmd);
      if (selectedCommand) {
        let cmdIcon = selectedCommand.icon;
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
        if (selectedCommand.name) {
          setDescription(selectedCommand.name);
        }
      }
    }
    else if (actionType !== 'command') {
      setIcon('');
      setIconInput('');
    }
  }, [allCommands, cmd, actionType]);

  const orderedCmdList = useMemo<OrderItemProps<CommandWithPluginInfo>[]>(() => {
    return orderList<CommandWithPluginInfo>(
      allCommands,
      cmdInputDebounce,
      (item: CommandWithPluginInfo) => `${item.name} (${item.pluginId})`,
    );
  }, [allCommands, cmdInputDebounce]);

  const orderedIconList = useMemo<OrderItemProps<string>[]>(() => {
    return orderList<string>(Object.keys(icons), iconInputDebounce);
  }, [iconInputDebounce]);

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

    // 检查正则表达式是否合法
    if (test) {
      try {
        new RegExp(test);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      catch (e) {
        new Notice(L.setting.invalidRegex());
        return;
      }
    }

    let action: IActionWithCommand | IActionWithHotkeys;
    const baseAction = {
      icon,
      name: '',
      desc: description || '',
      test: test || undefined,
    };

    switch (actionType) {
      case 'command': {
        if (!cmd) {
          new Notice(L.setting.commandNotice());
          return;
        }

        // 从所有命令中找到选择的命令
        const selectedCommand = allCommands.find(c => c.id === cmd);
        if (!selectedCommand) {
          new Notice(L.setting.invalidCommand());
          return;
        }

        action = {
          ...baseAction,
          name: selectedCommand.name,
          desc: description || selectedCommand.name,
          dependencies: [selectedCommand.pluginId],
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
  }, [actionType, cmd, allCommands, icon, hotkey, description, test, onChange]);

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
          cmd={cmd}
          cmdInput={cmdInput}
          orderedCmdList={orderedCmdList}
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

      {/* RegEx Test Field - Always visible */}
      <RegexForm
        test={test}
        onChange={setTest}
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
