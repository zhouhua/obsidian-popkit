import { icons } from 'lucide-react';
import type { App, Command, InternalPlugin, InternalPluginInstance, Plugin } from 'obsidian';
import { Notice } from 'obsidian';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'src/L';
import { fileToBase64 } from 'src/utils';
import startCase from 'lodash/startCase';
import type { Action } from 'src/types';
import type { InternalPluginName } from 'obsidian-typings';

const NewCustomAction: FC<{
  app: App;
  onChange: (action: Action) => void;
}> = ({ app, onChange }) => {
  const [icon, setIcon] = useState<string>('Lollipop');
  const [plugin, setPlugin] = useState<string>('');
  const [cmd, setCmd] = useState<string>('');
  const inputReference = useRef<HTMLInputElement>(null);

  const { commands } = app.commands;
  const { plugins } = app.plugins;
  const { plugins: internalPlugins, config: internalPluginConfig } = app.internalPlugins;
  const info: Array<{
    pluginName: string;
    plugin?: Plugin | InternalPlugin<{ name: string; } & InternalPluginInstance>;
    isEnabled: boolean;
    commands: Command[];
  }> = [];
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
    !plugin && setPlugin(info[0]?.pluginName);
  }, [info.length, plugin]);

  useEffect(() => {
    if (plugin) {
      const cache = info.find(i => i.pluginName === plugin);
      if (cache?.commands.length && !cache.commands.find(c => c.id === cmd)) {
        setCmd(cache.commands[0].id);
      }
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
      }
    }
  }, [commands, plugin, cmd]);

  const add = useCallback(() => {
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
          <select
            value={plugin}
            className="dropdown"
            onChange={e => {
              setPlugin(e.target.value);
            }}
          >
            {info.map(item => {
              return (
                <option key={item.pluginName} value={item.pluginName}>
                  {item.plugin ? ('instance' in item.plugin ? item.plugin.instance.name : item.plugin.manifest.name) : item.pluginName}
                </option>
              );
            })}
          </select>
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
          <select
            value={cmd}
            className="dropdown"
            onChange={e => {
              setCmd(e.target.value);
            }}
          >
            {info.find(i => i.pluginName === plugin)?.commands.map(command => {
              return (
                <option key={command.id} value={command.id}>
                  {command.name}
                </option>
              );
            })}
          </select>
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
          <select
            value={icon}
            className="dropdown"
            onChange={e => {
              setIcon(e.target.value);
            }}
          >
            {Object.keys(icons).map(name => {
              return (
                <option key={name} value={name}>
                  {name}
                </option>
              );
            })}
          </select>
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
