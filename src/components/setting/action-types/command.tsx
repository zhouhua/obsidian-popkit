import { CheckIcon } from 'lucide-react';
import type { App, Command } from 'obsidian';
import type { FC } from 'react';
import type { OrderItemProps } from 'src/utils';
import L from 'src/L';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem } from '../../ui/combobox';

interface CommandFormProps {
  app: App;
  plugin: string;
  cmd: string;
  pluginInput: string;
  cmdInput: string;
  orderedPluginList: OrderItemProps<{
    pluginName: string;
    isEnabled: boolean;
    commands: Command[];
  }>[];
  orderedCmdList: OrderItemProps<Command>[];
  setPlugin: (value: string) => void;
  setPluginInput: (value: string) => void;
  setCmd: (value: string) => void;
  setCmdInput: (value: string) => void;
}

const CommandForm: FC<CommandFormProps> = ({
  plugin,
  cmd,
  pluginInput,
  cmdInput,
  orderedPluginList,
  orderedCmdList,
  setPlugin,
  setPluginInput,
  setCmd,
  setCmdInput,
}) => {
  return (
    <>
      <div className="setting-item" style={{ padding: '10px 0' }}>
        <div className="setting-item-info">
          <div className="setting-item-name">{L.setting.plugin()}</div>
        </div>
        <div className="setting-item-control">
          <Combobox
            value={plugin}
            filterItems={(inputValue, list) => list}
            onValueChange={value => {
              setPlugin(value || '');
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

      <div className="setting-item" style={{ padding: '10px 0' }}>
        <div className="setting-item-info">
          <div className="setting-item-name">{L.setting.command()}</div>
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
    </>
  );
};

export default CommandForm;
