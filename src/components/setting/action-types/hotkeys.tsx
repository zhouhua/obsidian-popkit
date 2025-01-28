/* eslint-disable @stylistic/indent */
import type { FC } from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { X, PlusCircle } from 'lucide-react';

interface HotkeysFormProps {
  hotkey: string;
  onChange: (hotkey: string) => void;
}

const HotkeysForm: FC<HotkeysFormProps> = ({
  hotkey,
  onChange,
}) => {
  const [recording, setRecording] = useState(false);
  const [currentHotkey, setCurrentHotkey] = useState('');
  const keysPressed = useRef<Set<string>>(new Set());

  const generateHotkeyString = useCallback((keys: string[]) => {
    const modifiers: string[] = [];
    const mainKeys: string[] = [];

    // 先处理修饰键，按固定顺序
    if (keys.includes('Meta')) modifiers.push('⌘');
    if (keys.includes('Control')) modifiers.push('Ctrl');
    if (keys.includes('Alt')) modifiers.push('⌥');
    if (keys.includes('Shift')) modifiers.push('⇧');

    // 处理其他键
    for (const key of keys) {
      if (!['Meta', 'Control', 'Alt', 'Shift'].includes(key)) {
        mainKeys.push(key.length === 1 ? key.toUpperCase() : key);
      }
    }

    return [...modifiers, ...mainKeys].join(' ');
  }, []);

  const updateHotkey = useCallback(() => {
    const keys = Array.from(keysPressed.current);
    const newHotkey = generateHotkeyString(keys);
    if (newHotkey) {
      setCurrentHotkey(newHotkey);
    }
  }, [generateHotkeyString]);

  useEffect(() => {
    if (!recording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      keysPressed.current.add(e.key);
      updateHotkey();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 在第一个按键释放时结束录制
      const finalHotkey = generateHotkeyString(Array.from(keysPressed.current));
      if (finalHotkey) {
        onChange(finalHotkey);
      }

      setRecording(false);
      keysPressed.current.clear();
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      keysPressed.current.clear();
    };
  }, [recording, onChange, updateHotkey, generateHotkeyString]);

  const startRecording = useCallback(() => {
    setRecording(true);
    setCurrentHotkey('');
    keysPressed.current.clear();
  }, []);

  const cancelRecording = useCallback(() => {
    setRecording(false);
    setCurrentHotkey('');
    keysPressed.current.clear();
  }, []);

  return (
    <div className="setting-item" style={{ padding: '10px 0' }}>
      <div className="setting-item-info">
        <div className="setting-item-name">{L.setting.hotkeysLabel()}</div>
        <div className="setting-item-description">
          {L.setting.hotkeysDesc()}
        </div>
      </div>
      <div className="setting-item-control">
        <div className="setting-command-hotkeys">
          {recording
            ? (
              <span className="setting-hotkey mod-active">
                {currentHotkey || 'Press hotkey...'}
              </span>
            )
            : hotkey
              ? (
                <span className="setting-hotkey">
                  {hotkey}
                  <span
                    className="setting-hotkey-icon setting-delete-hotkey"
                    aria-label={L.setting.deleteHotkey()}
                    onClick={() => { onChange(''); }}
                  >
                    <X className="svg-icon" />
                  </span>
                </span>
              )
              : (
                <span className="setting-hotkey mod-empty">
                  {L.setting.notSet()}
                </span>
              )}
        </div>
        {!recording && !hotkey && (
          <span
            className="clickable-icon setting-add-hotkey-button"
            aria-label={L.setting.customHotkey()}
            onClick={startRecording}
          >
            <PlusCircle className="svg-icon" />
          </span>
        )}
        {recording && (
          <span
            className="clickable-icon setting-add-hotkey-button"
            aria-label={L.setting.cancelSetting()}
            onClick={cancelRecording}
          >
            <X className="svg-icon" />
          </span>
        )}
      </div>
    </div>
  );
};

export default HotkeysForm;
