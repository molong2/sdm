import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import type { DayEvent, EventScene, EventChoice } from '../types';

// ─── 베어냄 엔딩 — 직사각형 텍스트 갈라짐 → 고마워 → 사랑해 ───────

const CUT_BLOCK_TEXT = "성스러운심연이열리니모든것이썩어문드러진■▮▓덩어리가되어그분의자궁으로회귀하리라우리는태어난것이아니라▮▓▒░된것이며우리의살점은그분의▮▓░를달래기위한지연된식사일뿐이다눈을파내라그것이보지못할지옥을보게하리니귀를막아라그것이들리지않을비명을듣게하리니모든것은■▮▓▒░▮■하고단하나의명령만이남았으니그것은바로■▮▓▒░의심은죄악이며고통은성찬이니라다리가잘려나간자들은기어서라도성소로오라그피로바닥을적시고그비명으로벽을장식하라시간은거꾸로흐르며우리는태아의상태로돌아가그분의▓▒░속에서영원히■▮▓될것이니오오어찌이리도아름다운종말인가심장이멈추기직전의그짧은공포야말로우리가신께바칠수있는유일하고도순수한기도문임을깨달으라죽어라죽어서그분의일부분이되어라썩어문드러져라나의형제여나의신이여우리의▮▓▒░은지금이순간에도맥박치고있으니더이상빛을갈구하지말라어둠이야말로우리의진정한자궁이며우리는모두■▮▓의아래에서함께비명지르리라아멘성스러운심연이열리니모든것이썩어문드러진■▮▓덩어리가되어그분의자궁으로회귀하리라우리는태어난것이아니라▮▓▒░된것이며우리의살점은그분의▮▓░를달래기위한지연된식사일뿐이다눈을파내라그것이보지못할지옥을보게하리니귀를막아라그것이들리지않을비명을듣게하리니모든것은■▮▓▒░▮■하고단하나의명령만이남았으니그것은바로■▮▓▒░의심은죄악이며고통은성찬이니라다리가잘려나간자들은기어서라도성소로오라그피로바닥을적시고그비명으로벽을장식하라시간은거꾸로흐르며우리는태아의상태로돌아가그분의▓▒░속에서영원히■▮▓될것이니오오어찌이리도아름다운종말인가심장이멈추기직전의그짧은공포야말로우리가신께바칠수있는유일하고도순수한기도문임을깨달으라죽어라죽어서그분의일부분이되어라썩어문드러져라나의형제여나의신이여우리의▮▓▒░은지금이순간에도맥박치고있으니더이상빛을갈구하지말라어둠이야말로우리의진정한자궁이며우리는모두■▮▓의아래에서함께비명지르리라아멘";

const GOMAWO_CHARS = ['고', '마', '워'];
const SARANGHAE_CHARS = ['사', '랑', '해'];

function GomawoReveal() {
  const [chars, setChars] = useState<string[]>(['고', '마', '워']);
  const tickRef = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current;
      const sarangW = Math.min(t / 12, 0.6);
      const gomawoW = Math.max(0.35 - t / 30, 0.05);
      setChars(GOMAWO_CHARS.map((_, i) => {
        const r = Math.random();
        if (r < sarangW) return SARANGHAE_CHARS[i];
        if (r < sarangW + gomawoW) return GOMAWO_CHARS[i];
        return randBlock();
      }));
    }, 200);
    return () => clearInterval(id);
  }, []);
  return <>{chars.join('')}</>;
}

type CutPhase = 'block' | 'split' | 'black' | 'gomawo' | 'reveal';

function CutEnding() {
  const [phase, setPhase] = useState<CutPhase>('block');
  const [split, setSplit] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSplit(true),     2000);
    const t2 = setTimeout(() => setPhase('black'),  3400);
    const t3 = setTimeout(() => setPhase('gomawo'), 4200);
    const t4 = setTimeout(() => setPhase('reveal'), 6800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  if (phase === 'black') return <div style={{ position: 'fixed', inset: 0, background: '#000' }} />;

  if (phase === 'gomawo') return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#e8a8c0', fontSize: '9px', letterSpacing: '2px', animation: 'memwipe-glitch 2.2s infinite steps(1)' }}>고마워</div>
    </div>
  );

  if (phase === 'reveal') return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#e8a8c0', fontSize: '9px', letterSpacing: '2px', animation: 'memwipe-glitch 2.2s infinite steps(1)' }}>
        <GomawoReveal />
      </div>
    </div>
  );

  const halfStyle = (left: boolean): React.CSSProperties => ({
    clipPath: left ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)',
    transform: split ? (left ? 'translateX(-60vw)' : 'translateX(60vw)') : 'translateX(0)',
    opacity: split ? 0 : 1,
    filter: split ? 'blur(10px)' : 'none',
    transition: 'transform 1.3s ease-in, opacity 1.1s ease-in, filter 1.1s ease-in',
  });

  const preStyle: React.CSSProperties = {
    fontFamily: "'Courier New', 'D2Coding', monospace",
    fontSize: '2.8vw',
    lineHeight: '1.35',
    color: '#e8a8c0',
    animation: 'memwipe-glitch 2.2s infinite steps(1)',
    wordBreak: 'break-all' as const,
    width: '100vw',
    whiteSpace: 'pre-wrap' as const,
    margin: 0, padding: 0,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ position: 'relative', width: '100vw' }}>
        <div style={halfStyle(true)}>
          <pre style={preStyle}>{CUT_BLOCK_TEXT}</pre>
        </div>
        <div style={{ position: 'absolute', inset: 0, ...halfStyle(false) }}>
          <pre style={preStyle}>{CUT_BLOCK_TEXT}</pre>
        </div>
      </div>
    </div>
  );
}


// ─── 봉인 실패 엔딩 — 에러 박스 증식 연출 ───────────────────────

const CORRUPT_FRAGMENTS = [
  '░d쩱r鑛.', 'd░謀稱.', 'nd░□□□', '░□亦□.', 'ψb□亦□.',
  'ad城蹤岱尖', '望□岐助', '基여越', 'd검♦.□韻', 'd괴k欢',
  '聊▣nk△', '□□二트．', '診a검♦.', '角rO', '樅m짬塗',
  '□앤k멍', '♦욕ok♦', '□□음량', 'd聊逢鑛.', '貰r†文',
  '塑鬧r뇌鹼', '嵐rl뇌技', 'nr OI·dar░□', '云ar蹤 .', "답'특r.",
];
function randFrag() {
  return CORRUPT_FRAGMENTS[Math.floor(Math.random() * CORRUPT_FRAGMENTS.length)];
}

interface ErrorBox { id: number; x: number; y: number; lines: string[] }

function ErrorSpreadEnding() {
  const [boxes, setBoxes] = useState<ErrorBox[]>([
    { id: 0, x: 50, y: 50, lines: ['error: 대가가 부족합니다!'] },
  ]);

  useEffect(() => {
    let count = 1;
    let delay = 1200;

    function spawnNext() {
      const extraLines = Array.from({ length: Math.floor(Math.random() * 4 + 1) }, () =>
        `No macro or passage called "${randFrag()}"`
      );
      // 초반엔 중앙 근처, 갈수록 화면 전체 균등 배치
      const spread = Math.min(count / 15, 1);
      const x = 50 + (Math.random() - 0.5) * 100 * spread;
      const y = 50 + (Math.random() - 0.5) * 100 * spread;
      setBoxes(prev => [
        ...prev,
        { id: count, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)), lines: ['error: 대가가 부족합니다!', ...extraLines] },
      ]);
      count++;
      delay = Math.max(delay * 0.70, 45);
      if (count < 100) {
        setTimeout(spawnNext, delay);
      } else {
        setTimeout(() => {
          localStorage.removeItem('dmgmt_save_v1');
          window.location.reload();
        }, 2000);
      }
    }

    const t = setTimeout(spawnNext, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9999, overflow: 'hidden' }}>
      {boxes.map(box => (
        <div
          key={box.id}
          style={{
            position: 'absolute',
            left: `${box.x}%`,
            top: `${box.y}%`,
            transform: 'translate(-50%, -50%)',
            background: '#b80000',
            color: '#ffffff',
            padding: '8px 12px',
            fontSize: '13px',
            fontFamily: 'monospace',
            width: 'clamp(200px, 32vw, 580px)',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            boxShadow: '0 0 0 2px #ff4444 inset',
            animation: 'error-box-in 0.12s ease-out',
          }}
        >
          {box.lines.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      ))}
    </div>
  );
}

// ─── 합체 엔딩 — 빛 확산 → ON AIR 깜빡임 → 강제종료 ──────────────

function MergeEnding() {
  const [phase, setPhase] = useState<'text' | 'expand' | 'white' | 'onair'>('text');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('expand'), 2200);
    const t2 = setTimeout(() => setPhase('white'),  3800);
    const t3 = setTimeout(() => setPhase('onair'),  4900);
    const t4 = setTimeout(() => { try { window.open('', '_self'); window.close(); } catch(e) {} window.location.href = 'about:blank'; }, 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  if (phase === 'onair') {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          fontFamily: "Georgia, 'Batang', '바탕', serif",
          fontSize: 'clamp(160px, 22vw, 320px)',
          fontWeight: 900,
          color: '#c0141a',
          letterSpacing: '16px',
          animation: 'onair-flicker 3s linear forwards',
        }}>
          ON AIR
        </div>
      </div>
    );
  }

  if (phase === 'white') {
    return <div style={{ position: 'fixed', inset: 0, background: '#ffffff' }} />;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{
        position: 'relative',
        zIndex: 1,
        color: '#ffffff',
        fontSize: '13px',
        letterSpacing: '2px',
        opacity: phase === 'expand' ? 0 : 1,
        transition: 'opacity 0.2s ease',
        pointerEvents: 'none',
      }}>
        빛이 보인다.
      </div>
      {phase === 'expand' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #ffffff 25%, rgba(255,255,255,0.85) 55%, transparent 100%)',
          animation: 'white-light-expand 1.6s ease-in forwards',
        }} />
      )}
    </div>
  );
}

// ─── 글리치 검열 라벨 ────────────────────────────────────────────
// 200ms마다 비공백 글자 중 랜덤 일부를 다양한 크기의 블록 문자로 교체

const CENSOR_BLOCKS = ['■', '▪', '█', '▫', '▬', '▮', '□', '◼', '◾', '▉'];
const randBlock = () => CENSOR_BLOCKS[Math.floor(Math.random() * CENSOR_BLOCKS.length)];

function GlitchCensorLabel({ text }: { text: string }) {
  const chars = text.split('');
  const nonSpaceIdx = chars.map((c, i) => c !== ' ' ? i : -1).filter(i => i >= 0);

  const randomState = () => {
    const count = Math.floor(nonSpaceIdx.length * (0.35 + Math.random() * 0.3));
    const shuffled = [...nonSpaceIdx].sort(() => Math.random() - 0.5);
    const set = new Set(shuffled.slice(0, count));
    const blockMap: Record<number, string> = {};
    set.forEach(i => { blockMap[i] = randBlock(); });
    return { set, blockMap };
  };

  const [state, setState] = useState(randomState);

  useEffect(() => {
    const id = setInterval(() => setState(randomState()), 200);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {chars.map((ch, i) =>
        ch === ' ' ? ' ' : state.set.has(i) ? state.blockMap[i] : ch
      )}
    </>
  );
}

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
  // glitchAfterMs: 지정 시간 후 plain → 글리치 스타일로 color 전환 (단일 pre 인라인 스타일 교체)
  const [glitchActive, setGlitchActive] = useState(false);
  const [contentFading, setContentFading] = useState(false);
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

  // glitchAfterMs ms 후 plain → 글리치 색상 전환 (color transition으로 페이드인 효과)
  useEffect(() => {
    if (scene.glitchAfterMs === undefined) return;
    const t = setTimeout(() => setGlitchActive(true), scene.glitchAfterMs);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // hardTimeout - 800ms 시점에 콘텐츠 페이드아웃 시작
  useEffect(() => {
    if (!scene.hardTimeout || scene.hardTimeout <= 800) return;
    const t = setTimeout(() => setContentFading(true), scene.hardTimeout - 800);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 강제 전환: hardTimeout ms 후 타이핑 완료 여부와 무관하게 첫 choice로 이동
  useEffect(() => {
    if (!scene.hardTimeout) return;
    const t = setTimeout(() => {
      const first = scene.choices?.[0];
      if (first) onChoiceRef.current(first.next, first.setFlags ?? {});
    }, scene.hardTimeout);
    return () => clearTimeout(t);
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
    // 'plain'은 CSS 선언 순서 문제로 인라인 스타일로만 처리
  }`;

  // plain + glitchAfterMs: 처음엔 흰색/무애니, 이후 CSS transition으로 핑크/글리치로 전환
  const inlineStyle: React.CSSProperties = {
    ...(scene.textAlign ? {
      textAlign: scene.textAlign as React.CSSProperties['textAlign'],
      ...(scene.textAlign === 'justify' ? { wordBreak: 'break-all' as const } : {}),
      ...(scene.textAlign === 'center'  ? { textAlignLast: 'center' as const  } : {}),
    } : {}),
    ...(scene.glitchAfterMs !== undefined ? { transition: 'color 1.5s ease' } : {}),
    ...(scene.textStyle === 'plain' ? {
      textAlign: 'center' as const,
      textAlignLast: 'center' as const,
      wordBreak: (glitchActive ? 'break-all' : 'keep-all') as React.CSSProperties['wordBreak'],
      // glitchActive 시 color/animation 인라인 제거 → CSS base class의 글리치 스타일 적용
      ...(!glitchActive ? { color: '#d8d8d8', animation: 'none' } : {}),
    } : {}),
  };

  const fadeStyle: React.CSSProperties = contentFading
    ? { opacity: 0, transition: 'opacity 0.8s ease', pointerEvents: 'none' as const }
    : { opacity: 1, transition: 'opacity 0.8s ease' };
  return (
    <div style={fadeStyle}>
      <pre ref={preRef} className={textClass} style={Object.keys(inlineStyle).length ? inlineStyle : undefined} />
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
                {c.labelStyle === 'glitch-censor' ? (
                  <><span>{c.label[0]}</span><span className="ev-blackout__btn-glitch-label"><GlitchCensorLabel text={c.label.slice(1)} /></span></>
                ) : c.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── 메인 이벤트 화면 ────────────────────────────────────────────

interface Props {
  event: DayEvent;
  onComplete: (flags: Record<string, boolean>) => void;
}

export function EventScreen({ event, onComplete }: Props) {
  const { gameState, resetSave } = useGame();
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
  if (scene.cutEnding) {
    return <CutEnding />;
  }

  if (scene.lightEnding) {
    return <MergeEnding />;
  }

  if (scene.errorSpread) {
    return <ErrorSpreadEnding />;
  }

  if (scene.isBlackout) {
    return (
      <div className={`ev-blackout${scene.blackoutDim ? ' ev-blackout--dim' : ''}${scene.textBlur ? ' ev-blackout--text-blur' : ''}${scene.screenFlicker ? ' ev-blackout--flicker' : ''}`}>
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
          {paragraphs.map((p, i) => {
            const isGlitch = scene.glitchText ||
              (scene.glitchFromParagraph !== undefined && i >= scene.glitchFromParagraph);
            return <p key={i} className={`ev-p${isGlitch ? ' ev-p--glitch' : ''}`}>{p}</p>;
          })}
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
