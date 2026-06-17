import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import type { DayEvent, EventScene, EventChoice } from '../types';

// ─── 블랙아웃 콘텐츠 ─────────────────────────────────────────────
// key={sceneId}로 씬마다 fresh mount.
// 텍스트는 React 상태 없이 직접 DOM 조작 (setTypedCount 제거).
// 외부 ev-blackout 컨테이너는 key 없이 고정 → 씬 전환 중에도 검은 배경 유지.

interface BlackoutContentProps {
  scene: EventScene;
  onChoice: (next: string, setFlags?: Record<string, boolean>) => void;
  onEnd: () => void;
  visibleChoices: EventChoice[];
}

function BlackoutContent({ scene, onChoice, onEnd, visibleChoices }: BlackoutContentProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [done, setDone] = useState(false);
  // 항상 최신 콜백을 ref에 보관 → setTimeout 내부의 stale closure 방지
  const onEndRef    = useRef(onEnd);
  const onChoiceRef = useRef(onChoice);
  onEndRef.current    = onEnd;
  onChoiceRef.current = onChoice;

  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;

    pre.textContent = '';
    setDone(false);

    const text = scene.text;
    if (!text) { setDone(true); return; }

    let i = 0;
    const chars = scene.slowTyping ? 1 : 3;
    const ms    = scene.slowTyping ? 500 : 20;
    const id = setInterval(() => {
      i = Math.min(i + chars, text.length);
      pre.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, ms);

    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 자동 진행: 타이핑 완료 후 autoNextDelay(기본 1000ms) 뒤 첫 choice로 이동
  useEffect(() => {
    if (!done || !scene.autoNext) return;
    const delay = scene.autoNextDelay ?? 1000;
    if (scene.isEnd) {
      const t = setTimeout(() => onEndRef.current(), delay);
      return () => clearTimeout(t);
    }
    const first = scene.choices?.[0];
    if (!first) return;
    const t = setTimeout(() => onChoiceRef.current(first.next, first.setFlags), delay);
    return () => clearTimeout(t);
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const textClass = `ev-blackout__text${
    scene.textStyle === 'title'     ? ' ev-blackout__text--title'     :
    scene.textStyle === 'squeak'    ? ' ev-blackout__text--squeak'    :
    scene.textStyle === 'corrupted' ? ' ev-blackout__text--corrupted' : ''
  }`;
  const textStyle = scene.textAlign ? {
    textAlign: scene.textAlign as React.CSSProperties['textAlign'],
    // justify일 때 dim 모드의 word-break:keep-all을 덮어씀 → 사각형 블록 유지
    ...(scene.textAlign === 'justify' ? { wordBreak: 'break-all' as const } : {}),
  } : undefined;

  return (
    <>
      <pre ref={preRef} className={textClass} style={textStyle} />
      {done && !scene.autoNext && (
        <div className="ev-blackout__choices">
          {scene.isEnd ? (
            <button className="ev-blackout__btn" onClick={onEnd}>
              {scene.endLabel ?? '다음 날로 넘어간다'}
            </button>
          ) : (
            visibleChoices.map((c, i) => (
              <button
                key={i}
                className="ev-blackout__btn"
                onClick={() => onChoice(c.next, c.setFlags)}
              >
                {c.label}
              </button>
            ))
          )}
        </div>
      )}
    </>
  );
}

// ─── 메인 이벤트 화면 ────────────────────────────────────────────

interface Props {
  event: DayEvent;
  onComplete: (flags: Record<string, boolean>) => void;
}

export function EventScreen({ event, onComplete }: Props) {
  const { gameState } = useGame();
  const [sceneId, setSceneId] = useState(event.startScene);
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [walkStep, setWalkStep] = useState(0);
  // autoRoute 씬으로 잠깐 넘어갈 때 블랙아웃 배경이 사라지지 않도록 추적
  const [blackoutActive, setBlackoutActive] = useState(false);
  const [flags, setFlags] = useState<Record<string, boolean>>(
    () => ({ ...(event.scenes[event.startScene]?.arrivalFlags ?? {}) })
  );

  const scene: EventScene = event.scenes[sceneId];

  // autoRoute: 즉시 분기 (화면 표시 없음)
  useEffect(() => {
    if (!scene?.autoRoute) return;
    if (scene.arrivalFlags) {
      setFlags(prev => ({ ...prev, ...scene.arrivalFlags }));
    }
    const { ifHasItems, ifFlagSet, then, else: elsePath } = scene.autoRoute;
    const itemsOk = !ifHasItems || ifHasItems.every(id => gameState.inventory.includes(id));
    const flagOk = !ifFlagSet || !!(flags[ifFlagSet]);
    setSceneId(itemsOk && flagOk ? then : elsePath);
  }, [sceneId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 일반/워크 장면 전환 처리
  useEffect(() => {
    if (!scene || scene.autoRoute || scene.isBlackout) return;
    setBlackoutActive(false);
    setVisible(false);
    setSearchText('');
    setWalkStep(0);
    if (scene.arrivalFlags) {
      setFlags(prev => ({ ...prev, ...scene.arrivalFlags }));
    }
    const t = setTimeout(() => {
      setVisible(true);
      if (scene.textInput) searchInputRef.current?.focus();
    }, 60);
    return () => clearTimeout(t);
  }, [sceneId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 블랙아웃 장면 진입 처리
  useEffect(() => {
    if (!scene?.isBlackout) return;
    setBlackoutActive(true);
    if (scene.arrivalFlags) {
      setFlags(prev => ({ ...prev, ...scene.arrivalFlags }));
    }
  }, [sceneId]); // eslint-disable-line react-hooks/exhaustive-deps

  function goToScene(nextId: string, choiceFlags: Record<string, boolean> = {}) {
    if (Object.keys(choiceFlags).length > 0) {
      setFlags(prev => ({ ...prev, ...choiceFlags }));
    }
    setSceneId(nextId);
  }

  function handleEnd() { onComplete(flags); }

  function handleSearch() {
    if (!scene.textInput || !searchText.trim()) return;
    const lower = searchText.toLowerCase();
    const matched = scene.textInput.keywords.some(kw => lower.includes(kw.toLowerCase()));
    goToScene(matched ? scene.textInput.matchScene : scene.textInput.noMatchScene);
  }

  function filterChoices(choices: EventScene['choices']) {
    return (choices ?? []).filter(c => {
      if (c.requiredItems && !c.requiredItems.every(id => gameState.inventory.includes(id))) return false;
      if (c.excludeFlags && c.excludeFlags.some(f => flags[f])) return false;
      if (c.requiredFlagCount) {
        const met = c.requiredFlagCount.flags.filter(f => flags[f]).length;
        if (met < c.requiredFlagCount.minCount) return false;
      }
      if (c.excludeWhenFlagCount) {
        const met = c.excludeWhenFlagCount.flags.filter(f => flags[f]).length;
        if (met >= c.excludeWhenFlagCount.minCount) return false;
      }
      return true;
    });
  }

  if (!scene) return null;

  // autoRoute 씬: 블랙아웃 체인 중이면 검은 배경 유지, 아니면 null
  if (scene.autoRoute) {
    return blackoutActive ? <div className="ev-blackout" /> : null;
  }

  // ─── 블랙아웃 모드 ──────────────────────────────────────────────
  // ev-blackout 컨테이너: key 없음 → 씬 전환 중에도 검은 배경 유지
  // BlackoutContent: key={sceneId} → 씬마다 fresh mount, 타이핑 재시작
  if (scene.isBlackout) {
    return (
      <div className={`ev-blackout${scene.blackoutDim ? ' ev-blackout--dim' : ''}${scene.screenFlicker ? ' ev-blackout--flicker' : ''}`}>
        <BlackoutContent
          key={sceneId}
          scene={scene}
          onChoice={(next, sf) => goToScene(next, sf ?? {})}
          onEnd={handleEnd}
          visibleChoices={filterChoices(scene.choices)}
        />
      </div>
    );
  }

  // ─── 걷기 연출 모드 ─────────────────────────────────────────────
  if (scene.walkMode) {
    const { steps, next, accumulate } = scene.walkMode;
    const step = steps[walkStep];
    if (!step) return null;
    const isLastStep = walkStep >= steps.length - 1;

    function advanceWalk() {
      if (isLastStep) goToScene(next);
      else setWalkStep(prev => prev + 1);
    }

    // accumulate: 이전 step의 non-action 단어들이 사라지지 않고 누적됨
    const displayWords = accumulate
      ? [
          ...steps.slice(0, walkStep).flatMap(s => s.words.filter(w => w.style !== 'action')),
          ...step.words,
        ]
      : step.words;

    return (
      <div className="ev-walk">
        <div className="ev-walk__strip">
          {displayWords.map((w, i) => {
            if (w.style === 'action') {
              return (
                <button key={i} className="ev-walk__word ev-walk__word--action" onClick={advanceWalk}>
                  {w.text}
                </button>
              );
            }
            return (
              <span key={i} className={`ev-walk__word${w.style === 'location' ? ' ev-walk__word--location' : ''}`}>
                {w.text}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── 일반 모드 ──────────────────────────────────────────────────
  const paragraphs = scene.text.split('\n\n').filter(Boolean);

  return (
    <div className="ev-bg">
      <div className={`ev-panel${visible ? ' ev-panel--visible' : ''}`}>

        <div className="ev-locbar">
          <span className="ev-locbar__arrow">▸</span>
          <span className="ev-locbar__loc">{scene.location}</span>
          {scene.time && <span className="ev-locbar__time">{scene.time}</span>}
        </div>

        <div className="ev-body">
          {paragraphs.map((p, i) => <p key={i} className="ev-p">{p}</p>)}
        </div>

        <div className="ev-choices">
          {scene.isEnd ? (
            <button className="ev-choice ev-choice--end" onClick={handleEnd}>
              › {scene.endLabel ?? '다음 날로 넘어간다'}
            </button>
          ) : scene.textInput ? (
            <div className="ev-search">
              <input
                ref={searchInputRef}
                className="ev-search__input"
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                placeholder={scene.textInput.placeholder ?? '검색어를 입력하십시오'}
              />
              <button className="ev-choice" onClick={handleSearch} disabled={!searchText.trim()}>
                › 검색
              </button>
            </div>
          ) : (
            filterChoices(scene.choices).map((c, i) => (
              <button
                key={i}
                className="ev-choice"
                onClick={() => goToScene(c.next, c.setFlags ?? {})}
              >
                › {c.label}
              </button>
            ))
          )}
        </div>

        <div className="ev-footer">{event.title}</div>
      </div>
    </div>
  );
}
