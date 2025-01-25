import type { FC } from 'react';
import { useState, useCallback, useRef } from 'react';
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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    keysPressed.current.add(e.key);
    updateHotkey();
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    keysPressed.current.delete(e.key);

    // 当所有按键都释放时，结束录制
    if (keysPressed.current.size === 0 && currentHotkey) {
      onChange(currentHotkey);
      stopRecording();
    }
  }, [currentHotkey, onChange]);

  const stopRecording = useCallback(() => {
    setRecording(false);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    keysPressed.current.clear();
  }, [handleKeyDown, handleKeyUp]);

  const updateHotkey = useCallback(() => {
    const keys: string[] = [];
    keysPressed.current.forEach(key => {
      switch (key) {
        case 'Meta':
          keys.push('⌘');
          break;
        case 'Control':
          keys.push('Ctrl');
          break;
        case 'Alt':
          keys.push('⌥');
          break;
        case 'Shift':
          keys.push('⇧');
          break;
        default:
          keys.push(key.length === 1 ? key.toUpperCase() : key);
      }
    });

    if (keys.length > 0) {
      const newHotkey = keys.join(' ');
      setCurrentHotkey(newHotkey);
    }
  }, []);

  const startRecording = useCallback(() => {
    setRecording(true);
    setCurrentHotkey('');
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  }, [handleKeyDown, handleKeyUp]);

  const cancelRecording = useCallback(() => {
    stopRecording();
    setCurrentHotkey('');
  }, [stopRecording]);

  return (
    <div className="setting-item" style={{ padding: '10px 0' }}>
      <div className="setting-item-info">
        <div className="setting-item-name">Hotkey</div>
        <div className="setting-item-description">
          Press the combination of keys you want to use
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
                    aria-label="删除快捷键"
                    onClick={() => { onChange(''); }}
                  >
                    <X className="svg-icon" />
                  </span>
                </span>
              )
              : (
                <span className="setting-hotkey mod-empty">
                  未设置
                </span>
              )}
        </div>
        {!recording && !hotkey && (
          <span
            className="clickable-icon setting-add-hotkey-button"
            aria-label="自定义快捷键"
            onClick={startRecording}
          >
            <PlusCircle className="svg-icon" />
          </span>
        )}
        {recording && (
          <span
            className="clickable-icon setting-add-hotkey-button"
            aria-label="取消设置"
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
