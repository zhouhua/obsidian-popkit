import styled from "@emotion/styled";
import { icons } from "lucide-react";
import { App, Command, Notice, Plugin } from "obsidian";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "src/L";
import { fileToBase64 } from "src/utils";
import startCase from 'lodash/startCase';
import { Action } from "src/types";


const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid var(--background-modifier-border);
`;

const IconContainer = styled.div`
  background-color: #000;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  padding: 2px;
`;

const NewCustomAction: FC<{
  app: App;
  onChange: (action: Action) => void;
}> = ({ app, onChange }) => {
  const [icon, setIcon] = useState<string>('Lollipop');
  const [plugin, setPlugin] = useState<string>('');
  const [cmd, setCmd] = useState<string>('');
  const inputReference = useRef<HTMLInputElement>(null);

  const commands = app.commands.commands;
  const plugins = app.plugins.plugins;
  const info: Array<{
    pluginName: string;
    plugin: Plugin;
    isEnabled: boolean;
    commands: Command[];
  }> = [];
  Object.keys(commands).forEach(key => {
    const [plugin, cmd] = key.split(':');
    if (plugin && cmd) {
      const cache = info.find(i => i.pluginName === plugin);
      if (cache) {
        cache.commands.push(commands[key]);
      } else {
        const pluginInfo = plugins[plugin];
        const isEnabled = app.plugins.enabledPlugins.has(plugin);
        if (plugin && (!isEnabled === !pluginInfo)) {
          info.push({
            pluginName: plugin,
            plugin: pluginInfo,
            isEnabled,
            commands: [commands[key]],
          })
        }
      }
    }
  });

  const Icon = useMemo(() => icons[icon as keyof typeof icons], [icon]);

  useEffect(() => {
    !plugin && setPlugin(info[0]?.pluginName);
  }, [info.length, plugin]);

  useEffect(() => {
    if (plugin) {
      const cache = info.find(i => i.pluginName === plugin);
      if (cache && cache.commands.length && !cache.commands.find(c => c.id === cmd)) {
        setCmd(cache.commands[0].id);
      }
    }
  }, [plugin, info, cmd]);

  useEffect(() => {
    if (plugin && cmd) {
      let icon = commands[cmd]?.icon;
      if (icon && icon.startsWith('lucide-')) {
        icon = startCase(icon.replace(/^lucide-/, '')).replace(/\s/g, '');
        if (!(icon in icons)) {
          icon = '';
        }
      } else {
        icon = '';
      }
      if (icon) {
        setIcon(icon);
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
    } as Action);
    new Notice(L.setting.addSuccess());
  }, [plugin, cmd, icon, onChange]);


  const upload = async () => {
    const file = inputReference.current?.files?.[0];
    if (file) {
      setIcon(await fileToBase64(file));
    }
  };

  return <Form>
    <h3>{L.setting.customTitle()}</h3>
    <div
      className='setting-item'
      style={{ padding: '10px 0' }}
    >
      <div className='setting-item-info'>
        <div className='setting-item-name'>{L.setting.plugin()}</div>
        <div className='setting-item-description'>
        </div>
      </div>
      <div className='setting-item-control'>
        <select
          value={plugin}
          onChange={e => {
            setPlugin(e.target.value);
          }}
          className='dropdown'
        >
          {info.map(info => {
            return <option key={info.pluginName} value={info.pluginName}>
              {info.plugin?.manifest.name || info.pluginName}
            </option>
          })}
        </select>
      </div>
    </div>
    <div
      className='setting-item'
      style={{ padding: '10px 0' }}
    >
      <div className='setting-item-info'>
        <div className='setting-item-name'>{L.setting.command()}</div>
        <div className='setting-item-description'>
        </div>
      </div>
      <div className='setting-item-control'>
        <select
          value={cmd}
          onChange={e => {
            setCmd(e.target.value);
          }}
          className='dropdown'
        >
          {info.find(i => i.pluginName === plugin)?.commands.map(command => {
            return <option key={command.id} value={command.id}>
              {command.name}
            </option>
          })}
        </select>
      </div>
    </div>
    <div
      className='setting-item'
      style={{ padding: '10px 0' }}
    >
      <div className='setting-item-info'>
        <div className='setting-item-name'>{L.setting.icon()}</div>
        <div className='setting-item-description'>
        </div>
      </div>
      <div className='setting-item-control'>
        {icon && (Icon
          ? (
            <IconContainer>
              <Icon color="#fff" size={20} />
            </IconContainer>
          ) : (
            <IconContainer>
              <img src={icon} width="20" height="20" />
            </IconContainer>
          )
        )}
        <button onClick={() => inputReference.current?.click()}>
          {L.setting.upload()}
          <input
            style={{ display: 'none' }}
            type='file'
            ref={inputReference}
            onChange={upload}
          />
        </button>
        <select
          value={icon}
          onChange={e => {
            setIcon(e.target.value);
          }}
          className='dropdown'
        >
          {Object.keys(icons).map(name => {
            return <option key={name} value={name}>
              {name}
            </option>
          })}
        </select>
      </div>
    </div>
    <div
      className='setting-item'
      style={{ padding: '10px 0' }}
    >
      <div className='setting-item-info'>

      </div>
      <div className='setting-item-control'>
        <button onClick={add}>{L.setting.add()}</button>
      </div>
    </div>
  </Form >

}

export default NewCustomAction;
