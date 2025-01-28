import { CheckIcon, icons } from 'lucide-react';
import type { FC } from 'react';
import type { OrderItemProps } from 'src/utils';
import L from 'src/L';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem } from '../../ui/combobox';

interface IconFormProps {
  icon: string;
  iconInput: string;
  orderedIconList: OrderItemProps<string>[];
  setIcon: (value: string) => void;
  setIconInput: (value: string) => void;
  onUpload: () => Promise<void>;
  inputReference: React.RefObject<HTMLInputElement | null>;
}

const IconForm: FC<IconFormProps> = ({
  icon,
  iconInput,
  orderedIconList,
  setIcon,
  setIconInput,
  onUpload,
  inputReference,
}) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const Icon = icon in icons ? icons[icon as keyof typeof icons] : undefined;
  return (
    <div className="setting-item" style={{ padding: '10px 0' }}>
      <div className="setting-item-info">
        <div className="setting-item-name">{L.setting.icon()}</div>
      </div>
      <div className="setting-item-control">
        {icon && (
          <div className="popkit-setting-form-icon-container">
            {Icon && <Icon color="#fff" size={20} />}
            {!Icon && <img src={icon} width="20" height="20" />}
          </div>
        )}
        <button onClick={() => { inputReference.current?.click(); }}>
          {L.setting.upload()}
          <input
            ref={inputReference}
            style={{ display: 'none' }}
            type="file"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onChange={onUpload}
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
  );
};

export default IconForm;
