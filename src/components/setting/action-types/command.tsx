import { CheckIcon } from 'lucide-react';
import type { App, Command } from 'obsidian';
import type { FC } from 'react';
import type { OrderItemProps } from 'src/utils';
import L from 'src/L';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem } from '../../ui/combobox';

interface CommandWithPluginInfo extends Command {
  pluginId: string;
}

interface CommandFormProps {
  app: App;
  cmd: string;
  cmdInput: string;
  orderedCmdList: OrderItemProps<CommandWithPluginInfo>[];
  setCmd: (value: string) => void;
  setCmdInput: (value: string) => void;
}

const CommandForm: FC<CommandFormProps> = ({
  cmd,
  cmdInput,
  orderedCmdList,
  setCmd,
  setCmdInput,
}) => {
  return (
    <div className="setting-item" style={{ padding: '10px 0' }}>
      <div className="setting-item-info">
        <div className="setting-item-name">{L.setting.command()}</div>
        <div className="setting-item-description">
          {L.setting.pickItem()}
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
                <ComboboxItem
                  key={command.origin.id}
                  label={`${command.origin.name} (${command.origin.pluginId})`}
                  value={command.origin.id}
                >
                  <div>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: command.markString,
                      }}
                      className="pk-text-xs pk-pl-5 pk-truncate"
                    >
                    </span>
                  </div>
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
  );
};

export default CommandForm;
