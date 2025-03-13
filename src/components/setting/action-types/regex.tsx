import type { FC } from 'react';
import L from 'src/L';

interface RegexFormProps {
  test: string;
  onChange: (test: string) => void;
}

const RegexForm: FC<RegexFormProps> = ({
  test,
  onChange,
}) => {
  return (
    <div className="setting-item" style={{ padding: '10px 0' }}>
      <div className="setting-item-info">
        <div className="setting-item-name">{L.setting.testRegexLabel()}</div>
        <div className="setting-item-description">
          {L.setting.testRegexDesc()}
          <div className="pk-mt-2">
            <div>
              <code>^[a-z]+$</code>
              {' '}
              -
              {' '}
              {L.setting.testRegexExample1()}
            </div>
            <div>
              <code>\d+</code>
              {' '}
              -
              {' '}
              {L.setting.testRegexExample2()}
            </div>
            <div>
              <code>^#</code>
              {' '}
              -
              {' '}
              {L.setting.testRegexExample3()}
            </div>
          </div>
        </div>
      </div>
      <div className="setting-item-control">
        <input
          type="text"
          className="setting-hotkey-input"
          value={test}
          placeholder={L.setting.testRegexPlaceholder()}
          onChange={e => { onChange(e.target.value); }}
        />
      </div>
    </div>
  );
};

export default RegexForm;
