import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  onNavClick: () => void;
  onFormClick: () => void;
  onDone: () => void;
}

// 글리치 모드 진입 시 네비게이션 커서 애니메이션:
// 서류제출 → 외근결과보고서 행 → 보고내용 textarea 순서로 커서가 이동·클릭한다.
export function GlitchCursorNav({ onNavClick, onFormClick, onDone }: Props) {
  const [pos, setPos] = useState({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.4 });
  const [visible, setVisible] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const onNavRef  = useRef(onNavClick);
  const onFormRef = useRef(onFormClick);
  const onDoneRef = useRef(onDone);
  onNavRef.current  = onNavClick;
  onFormRef.current = onFormClick;
  onDoneRef.current = onDone;

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers = timersRef.current;

    function after(ms: number, fn: () => void) {
      const t = setTimeout(fn, ms);
      timers.push(t);
    }

    function moveTo(selector: string, duration: number, onArrival: () => void) {
      const el = document.querySelector(selector);
      if (!el) { onArrival(); return; }
      const rect = el.getBoundingClientRect();
      setPos({ x: rect.left + rect.width / 2 - 4, y: rect.top + rect.height / 2 - 7 });
      setTransitioning(true);
      after(duration, () => {
        setTransitioning(false);
        onArrival();
      });
    }

    setVisible(true);

    // 1. 서류제출 사이드바 항목으로 이동
    after(350, () => {
      moveTo('[data-glitch-target="forms"]', 950, () => {
        onNavRef.current();

        // 2. 폼 목록이 렌더된 후 외근결과보고서 행으로 이동
        after(550, () => {
          moveTo('[data-glitch-target="form-r6d"]', 850, () => {
            onFormRef.current();

            // 3. 폼 상세가 렌더된 후 보고내용 textarea로 이동
            after(650, () => {
              const textEl = document.querySelector('[data-glitch-target="forced-textarea"]');
              if (textEl) {
                const rect = textEl.getBoundingClientRect();
                setPos({ x: rect.left + 60, y: rect.top + 28 });
                setTransitioning(true);
                after(820, () => {
                  setTransitioning(false);
                  setVisible(false);
                  // textarea에 포커스를 줘서 캐럿(커서 깜빡이) 표시
                  (textEl as HTMLElement).focus();
                  onDoneRef.current();
                });
              } else {
                setVisible(false);
                onDoneRef.current();
              }
            });
          });
        });
      });
    });

    return () => {
      timers.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return createPortal(
    <div
      className="fake-cursor"
      style={{
        left: pos.x,
        top: pos.y,
        transition: transitioning ? 'left 0.9s ease, top 0.9s ease' : 'none',
      }}
    />,
    document.body
  );
}
