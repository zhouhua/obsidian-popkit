import { Undo2 } from 'lucide-react';
import { useCallback, useRef, type FC } from 'react';

const Back: FC<{ onClick: () => void; }> = ({ onClick }) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const click = useCallback(() => {
    onClick();
  }, [onClick]);
  return (
    <div
      ref={itemRef}
      className="popkit-item"
      onClick={click}
    >
      <Undo2 size={20} color="#fff" />
    </div>
  );
};

export default Back;
