import { CheckIcon, icons } from 'lucide-react';
import type { App, Command, Plugin } from 'obsidian';
import { Notice } from 'obsidian';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'src/L';
import type { OrderItemProps } from 'src/utils';
import { fileToBase64, orderList } from 'src/utils';
import startCase from 'lodash/startCase';
import type { Action } from 'src/types';
import type { InternalPluginName, InternalPlugin, InternalPluginInstance } from 'obsidian-typings';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem } from '../ui/combobox';
import { useDebounce } from 'ahooks';

const NewCustomAction: FC<{
  app: App;
  onChange: (action: Action) => void;
}> = ({ app, onChange }) => {
  const [icon, setIcon] = useState<string>('');
  const [plugin, setPlugin] = useState<string>('');
  const [cmd, setCmd] = useState<string>('');
  const [iconInput, setIconInput] = useState<string>('');
  const [pluginInput, setPluginInput] = useState<string>('');
  const [cmdInput, setCmdInput] = useState<string>('');
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

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const Icon = useMemo(() => (icon in icons ? icons[icon as keyof typeof icons] : undefined), [icon]);
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
        cmdIcon = startCase(cmdIcon.replace(/^lucide-/, '')).replace(/\s/g, '');
        if (!(cmdIcon in icons)) {
          cmdIcon = '';
        }
      }
      else {
        cmdIcon = '';
      }
      if (cmdIcon) {
        setIcon(cmdIcon);
        setIconInput(cmdIcon);
      }
    }
    else {
      setIcon('');
      setIconInput('');
    }
  }, [commands, plugin, cmd]);

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

  const add = useCallback(() => {
    if (!plugin || !cmd || !icon) {
      return;
    }
    const commad = commands[cmd];
    onChange({
      icon,
      dependencies: [plugin],
      command: cmd,
      name: commad.name,
      desc: commad.name,
    });
    new Notice(L.setting.addSuccess());
  }, [plugin, cmd, icon, onChange]);

  const upload = async () => {
    const file = inputReference.current?.files?.[0];
    if (file) {
      setIcon(await fileToBase64(file));
    }
  };

  return (
    <div className="popkit-setting-form">
      <h3>{L.setting.customTitle()}</h3>
      <div
        className="setting-item"
        style={{ padding: '10px 0' }}
      >
        <div className="setting-item-info">
          <div className="setting-item-name">{L.setting.plugin()}</div>
          <div className="setting-item-description">
          </div>
        </div>
        <div className="setting-item-control">
          <Combobox
            value={plugin}
            filterItems={(inputValue, list) => list}
            onValueChange={value => {
              setPlugin(value);
              setPluginInput(value || '');
            }}
          >
            <ComboboxInput
              placeholder={L.setting.pickItem()}
              value={pluginInput}
              onChange={e => { setPluginInput(e.target.value); }}
            />
            <ComboboxContent>
              {orderedPluginList.map(item => {
                return (
                  <ComboboxItem
                    key={item.origin.pluginName}
                    label={item.origin.pluginName}
                    value={item.origin.pluginName}
                  >
                    <span
                      dangerouslySetInnerHTML={{
                        __html: item.markString,
                      }}
                      className="pk-text-xs pk-pl-5"
                    >
                    </span>
                    {plugin === item.origin.pluginName && (
                      <span className="pk-absolute pk-start-2 pk-top-0 pk-flex pk-h-full pk-items-center pk-justify-center">
                        <CheckIcon className="pk-size-4" />
                      </span>
                    )}
                  </ComboboxItem>
                );
              })}
              <ComboboxEmpty>{L.setting.noResult()}</ComboboxEmpty>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
      <div
        className="setting-item"
        style={{ padding: '10px 0' }}
      >
        <div className="setting-item-info">
          <div className="setting-item-name">{L.setting.command()}</div>
          <div className="setting-item-description">
          </div>
        </div>
        <div className="setting-item-control">
          <Combobox
            value={cmd}
            filterItems={(inputValue, list) => list}
            onValueChange={value => {
              setCmd(value || '');
              setCmdInput(value || '');
            }}
          >
            <ComboboxInput
              placeholder={L.setting.pickItem()}
              value={cmdInput}
              onChange={e => { setCmdInput(e.target.value); }}
            />
            <ComboboxContent>
              {orderedCmdList.map(command => {
                return (
                  <ComboboxItem key={command.origin.id} label={command.origin.name} value={command.origin.id}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: command.markString,
                      }}
                      className="pk-text-xs pk-pl-5"
                    >
                    </span>
                    {cmd === command.origin.id && (
                      <span className="pk-absolute pk-start-2 pk-top-0 pk-flex pk-h-full pk-items-center pk-justify-center">
                        <CheckIcon className="pk-size-4" />
                      </span>
                    )}
                  </ComboboxItem>
                );
              })}
              <ComboboxEmpty>{L.setting.noResult()}</ComboboxEmpty>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
      <div
        className="setting-item"
        style={{ padding: '10px 0' }}
      >
        <div className="setting-item-info">
          <div className="setting-item-name">{L.setting.icon()}</div>
          <div className="setting-item-description">
          </div>
        </div>
        <div className="setting-item-control">
          {icon && (Icon
            ? (
              <div className="popkit-setting-form-icon-container">
                <Icon color="#fff" size={20} />
              </div>
            )
            : (
              <div className="popkit-setting-form-icon-container">
                <img src={icon} width="20" height="20" />
              </div>
            )
          )}
          <button onClick={() => inputReference.current?.click()}>
            {L.setting.upload()}
            <input
              ref={inputReference}
              style={{ display: 'none' }}
              type="file"
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onChange={upload}
            />
          </button>
          <Combobox
            value={icon}
            filterItems={(inputValue, list) => list}
            onValueChange={value => {
              setIcon(value || '');
              setIconInput(value || '');
            }}
          >
            <ComboboxInput
              placeholder={L.setting.pickItem()}
              value={iconInput}
              onChange={e => {
                setIconInput(e.target.value);
              }}
            />
            <ComboboxContent>
              {orderedIconList.map(item => {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                const OptionIcon = icons[item.origin as keyof typeof icons];
                return (
                  <ComboboxItem key={item.origin} label={item.origin} value={item.origin}>
                    <div className="pk-pl-5 pk-flex pk-items-center pk-gap-2">
                      <OptionIcon size={14} />
                      <span
                        dangerouslySetInnerHTML={{
                          __html: item.markString,
                        }}
                        className="pk-text-xs"
                      >
                      </span>
                    </div>
                    {icon === item.origin && (
                      <span className="pk-absolute pk-start-2 pk-top-0 pk-flex pk-h-full pk-items-center pk-justify-center">
                        <CheckIcon className="pk-size-4" />
                      </span>
                    )}
                  </ComboboxItem>
                );
              })}
              <ComboboxEmpty>{L.setting.noResult()}</ComboboxEmpty>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
      <div
        className="setting-item"
        style={{ padding: '10px 0' }}
      >
        <div className="setting-item-info">

        </div>
        <div className="setting-item-control">
          <button onClick={add}>{L.setting.add()}</button>
        </div>
      </div>
    </div>
  );
};

export default NewCustomAction;
