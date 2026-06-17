import { useEffect, useRef, useState } from 'react';

// ============================================================
// 기억소거 미니게임
// 좌우로 계속 움직이는 표시(마커)가 막대 위 무작위 위치에 생성된
// 노란색 구간 안에 있을 때 [시행] 버튼(또는 스페이스바)을 누르면 성공.
// 진행되는 동안 막대 위쪽에 대상자와의 면담(실시간 타이핑)이 함께 표시된다.
// 성공 시 대상자에게 말을 걸 수 있고, 일부 대상자는 추가 질문 시 정신붕괴 반응을 보인다.
// 총 TOTAL_ROUNDS회 진행 후 onComplete(성공 횟수) 호출.
// ============================================================

interface Props {
  /** successCount: 성공 횟수, womanBreakdownTriggered: 마지막 대상자에게 '여자가 어떻게 생겼나요?'를 물어 정신붕괴를 유발했는지 */
  onComplete: (successCount: number, womanBreakdownTriggered: boolean) => void;
}

const TOTAL_ROUNDS = 3;
const SWEEP_MS = 700;        // 막대 한쪽 끝 → 반대쪽 끝까지 걸리는 시간(ms) — 빠르게
const TARGET_MIN_WIDTH = 6;  // 목표 구간 최소 폭(%) — 좁게
const TARGET_MAX_WIDTH = 10; // 목표 구간 최대 폭(%)

// 대화가 한 글자(유니코드 코드포인트)씩 출력되는 간격(ms). 여기 숫자만 바꾸면 타이핑 속도가 바뀐다.
// 숫자가 작을수록 빠르게, 클수록 느리게 출력된다.
const TYPEWRITER_INTERVAL_MS = 18;
// 한 줄이 다 출력된 뒤 다음 줄이 시작되기 전 잠깐 멈추는 시간(ms)
const TYPEWRITER_LINE_PAUSE_MS = 200;
// 정신붕괴 응답 시작 전, 오류가 난 듯 정지해 있는 시간(ms)
const BREAKDOWN_DELAY_MS = 1800;

// 시행 실패 시 대화 단계 없이 보여주는 오염된 한 줄 (대상자별로 다르게)
const FAIL_LINES = [
  '그여자가저를따라오고있어요' + '살려줘'.repeat(20),
  '그여자가우리를⬛◼하려고하고있어요아아▪◾▮■의때가올거라고그럼우린모두다⬛◼■▪◾▮█▓',
  '그만두고싶어요아니어쩌면돌아가고싶은건지도⬛◼■에게로▪◾▮■⬛◼▓▒░█는■◼⬛에게로',
];

// 응답을 받은 뒤 모든 대상자에게 공통으로 건네는 마무리 멘트
const CLOSING_LINE = '그렇군요. 그럼 이 불빛을 봐 주십시오.';

interface RoundSubject {
  name: string;
  age: number;
  gender: string;
  question: string;
  answer: string;
  /** true면 응답을 글리치 스타일로 표시 (검열된 단어는 ■로 표기) */
  corrupted: boolean;
  /** 기억소거 성공 후 대화에서 '......' 대신 표시되는 특수 선택지 (있는 경우) */
  specialFollowUp?: {
    prompt: string;
    breakdown: string;
  };
}

const ROUND_SUBJECTS: RoundSubject[] = [
  {
    name: '한도진',
    age: 39,
    gender: '남',
    question: '건물 안에서 무엇을 보았습니까?',
    answer: '⬛◼가있었어요▪◾▮■⬛◼하고있었어요',
    corrupted: true,
  },
  {
    name: '오수아',
    age: 17,
    gender: '여',
    question: '당신은 건물에서 무엇을 하고 있었습니까?',
    answer: '안으로들어가려고했는데그순간⬛◼■에서▪◾▮⬛이열리더니■◼⬛▪◾▮█▓▒░■◼⬛▪◾',
    corrupted: true,
  },
  {
    name: '정유나',
    age: 24,
    gender: '여',
    question: '무엇을 보았습니까?',
    answer: '여자... 여자를 봤어요.',
    corrupted: true,
    specialFollowUp: {
      prompt: '여자가 어떻게 생겼나요?',
      breakdown: '⬛◼가나를보고있어■▪◾▮⬛하게될거야너도나도우리모두◼■▮에들어가서■▪◾⬛▮■◼거야그런데너는왜아직도▓■◾⬛하고있지■◼가말했어■▪◾▮⬛■하라고너도이리와서죗값을치루자⬛◼■▪에게로가자....',
    },
  },
];

type Phase = 'intro' | 'playing' | 'result' | 'talk' | 'breakdown' | 'fail' | 'done';

export function MemoryWipeMinigame({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState(0); // 0-based
  const [target, setTarget] = useState({ start: 0, width: 0 });
  const [markerPos, setMarkerPos] = useState(0);
  const [roundHit, setRoundHit] = useState<boolean | null>(null);

  // 면담 오버레이(막대 진행 중 위쪽에 표시) 타이핑 진행 상태: 0=질문, 1=응답, 2=전부 끝
  const [overlayLineIndex, setOverlayLineIndex] = useState(0);
  const [overlayText, setOverlayText] = useState('');

  // 정신붕괴 텍스트 타이핑 상태
  const [breakdownText, setBreakdownText] = useState('');
  const [breakdownDone, setBreakdownDone] = useState(false);

  // 실패 시 오염된 한 줄 타이핑 상태
  const [failText, setFailText] = useState('');
  const [failDone, setFailDone] = useState(false);

  const posRef = useRef(0);
  const dirRef = useRef<1 | -1>(1);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const lockedRef = useRef(false);
  const targetRef = useRef({ start: 0, width: 0 });
  const resultsRef = useRef<boolean[]>([]);
  const womanBreakdownRef = useRef(false);

  const subject = ROUND_SUBJECTS[round];

  function startRound() {
    const width = TARGET_MIN_WIDTH + Math.random() * (TARGET_MAX_WIDTH - TARGET_MIN_WIDTH);
    const start = Math.random() * (100 - width);
    targetRef.current = { start, width };
    setTarget({ start, width });
    setRoundHit(null);
    posRef.current = 0;
    dirRef.current = 1;
    lockedRef.current = false;
    lastTsRef.current = null;
    setMarkerPos(0);
    setOverlayLineIndex(0);
    setOverlayText('');
    setPhase('playing');
  }

  function handleStrike() {
    if (phase !== 'playing' || lockedRef.current) return;
    lockedRef.current = true;
    if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    const t = targetRef.current;
    const success = posRef.current >= t.start && posRef.current <= t.start + t.width;
    resultsRef.current = [...resultsRef.current, success];
    setRoundHit(success);
    setPhase('result');
  }

  function handleAfterResult() {
    if (roundHit) {
      setPhase('talk');
    } else {
      setFailText('');
      setFailDone(false);
      setPhase('fail');
    }
  }

  function advanceRound() {
    if (round + 1 >= TOTAL_ROUNDS) {
      setPhase('done');
    } else {
      setRound(r => r + 1);
      startRound();
    }
  }

  function handleTalkChoice(isSpecial: boolean) {
    if (isSpecial) {
      womanBreakdownRef.current = true;
      setBreakdownText('');
      setBreakdownDone(false);
      setPhase('breakdown');
    } else {
      advanceRound();
    }
  }

  // 막대 진행 중 — 면담 오버레이 타이핑 (질문 → 응답 → 공통 마무리 멘트 순서로 한 글자씩)
  useEffect(() => {
    if (phase !== 'playing') return;
    if (overlayLineIndex >= 3) return;

    const line = overlayLineIndex === 0 ? subject.question
      : overlayLineIndex === 1 ? subject.answer
      : CLOSING_LINE;
    const chars = Array.from(line);
    let i = 0;
    setOverlayText('');
    const timer = setInterval(() => {
      i++;
      setOverlayText(chars.slice(0, i).join(''));
      if (i >= chars.length) {
        clearInterval(timer);
        setTimeout(() => setOverlayLineIndex(li => li + 1), TYPEWRITER_LINE_PAUSE_MS);
      }
    }, TYPEWRITER_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [phase, round, overlayLineIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // 정신붕괴 텍스트 타이핑 — 답이 바로 나오지 않고, 오류가 난 듯 잠깐 멈춰 있다가 시작된다.
  useEffect(() => {
    if (phase !== 'breakdown') return;
    const text = subject.specialFollowUp?.breakdown ?? '';
    const chars = Array.from(text);
    let i = 0;
    let timer: ReturnType<typeof setInterval> | undefined;
    setBreakdownText('');
    setBreakdownDone(false);
    const delayTimer = setTimeout(() => {
      timer = setInterval(() => {
        i++;
        setBreakdownText(chars.slice(0, i).join(''));
        if (i >= chars.length) {
          clearInterval(timer);
          setBreakdownDone(true);
        }
      }, TYPEWRITER_INTERVAL_MS);
    }, BREAKDOWN_DELAY_MS);
    return () => {
      clearTimeout(delayTimer);
      if (timer !== undefined) clearInterval(timer);
    };
  }, [phase, round]); // eslint-disable-line react-hooks/exhaustive-deps

  // 실패 시 오염된 한 줄 타이핑
  useEffect(() => {
    if (phase !== 'fail') return;
    const chars = Array.from(FAIL_LINES[round] ?? FAIL_LINES[0]);
    let i = 0;
    setFailText('');
    setFailDone(false);
    const timer = setInterval(() => {
      i++;
      setFailText(chars.slice(0, i).join(''));
      if (i >= chars.length) {
        clearInterval(timer);
        setFailDone(true);
      }
    }, TYPEWRITER_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [phase, round]); // eslint-disable-line react-hooks/exhaustive-deps

  // 막대 애니메이션 (좌우 반복 이동)
  useEffect(() => {
    if (phase !== 'playing') return;

    function tick(ts: number) {
      if (lockedRef.current) return;
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      const speed = 100 / SWEEP_MS; // %/ms
      let next = posRef.current + speed * dt * dirRef.current;
      if (next >= 100) { next = 100; dirRef.current = -1; }
      if (next <= 0) { next = 0; dirRef.current = 1; }
      posRef.current = next;
      setMarkerPos(next);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current); };
  }, [phase, round]);

  // 스페이스바로도 시행 가능
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space' && phase === 'playing') {
        e.preventDefault();
        handleStrike();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── 인트로 ───────────────────────────────────────────────── */
  if (phase === 'intro') {
    return (
      <div className="memwipe-bg">
        <div className="memwipe-card">
          <div className="memwipe-card__title">기억소거 지원</div>
          <div className="memwipe-card__text">
            오늘 맡으실 분들은 회색 건물에 노출되어 인지오염 증상을 보이는 민간인 {TOTAL_ROUNDS}명입니다. 방치하면 불안감과 환청, 반복적인 환각이 점점 심해질 수 있어 기억소거가 필요합니다.
            <br /><br />
            간단히 면담을 마치고 불빛을 보여드리면, 박자에 맞춰 시행해 주세요. 박자가 어긋나면 소거가 제대로 들어가지 않을 수 있습니다.
          </div>
          <button className="memwipe-btn" onClick={startRound}>시작</button>
        </div>
      </div>
    );
  }

  /* ── 완료 ─────────────────────────────────────────────────── */
  if (phase === 'done') {
    const successCount = resultsRef.current.filter(Boolean).length;
    return (
      <div className="memwipe-bg">
        <div className="memwipe-card">
          <div className="memwipe-card__title">기억소거 완료</div>
          <div className="memwipe-card__text">
            총 {TOTAL_ROUNDS}명 중 {successCount}명 성공적으로 처리되었습니다.
          </div>
          <button className="memwipe-btn" onClick={() => onComplete(successCount, womanBreakdownRef.current)}>확인</button>
        </div>
      </div>
    );
  }

  /* ── 대상자와의 대화 (성공 후) ───────────────────────────────── */
  if (phase === 'talk') {
    const secondChoiceLabel = subject.specialFollowUp ? subject.specialFollowUp.prompt : '......';
    return (
      <div className="memwipe-bg">
        <div className="memwipe-card">
          <div className="memwipe-card__title">
            {subject.name} ({subject.age}세, {subject.gender})
          </div>
          <div className="memwipe-card__text">기억소거가 완료되었습니다. 말을 걸어보시겠습니까?</div>
          <div className="memwipe-talk-choices">
            <button className="memwipe-btn memwipe-btn--secondary" onClick={() => handleTalkChoice(false)}>
              수고하셨습니다.
            </button>
            <button
              className="memwipe-btn memwipe-btn--secondary"
              onClick={() => handleTalkChoice(!!subject.specialFollowUp)}
            >
              {secondChoiceLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 정신붕괴 ─────────────────────────────────────────────── */
  if (phase === 'breakdown') {
    return (
      <div className="memwipe-bg">
        <div className="memwipe-card">
          <div className="memwipe-card__title">
            {subject.name} ({subject.age}세, {subject.gender})
          </div>
          <div className="memwipe-dialogue">
            <div className="memwipe-dialogue__line memwipe-dialogue__line--corrupted">
              {breakdownText}
              {!breakdownDone && <span className="memwipe-typing-cursor">▌</span>}
            </div>
          </div>
          {breakdownDone && (
            <button className="memwipe-btn" onClick={advanceRound}>
              {round + 1 >= TOTAL_ROUNDS ? '결과 확인' : '다음 대상자'}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── 실패 (대화 단계 없이 오염된 한 줄만 표시) ───────────────── */
  if (phase === 'fail') {
    return (
      <div className="memwipe-bg">
        <div className="memwipe-card">
          <div className="memwipe-card__title">
            {subject.name} ({subject.age}세, {subject.gender})
          </div>
          <div className="memwipe-dialogue">
            <div className="memwipe-dialogue__line memwipe-dialogue__line--corrupted memwipe-dialogue__line--fail">
              {failText}
              {!failDone && <span className="memwipe-typing-cursor">▌</span>}
            </div>
          </div>
          {failDone && (
            <button className="memwipe-btn" onClick={advanceRound}>
              {round + 1 >= TOTAL_ROUNDS ? '결과 확인' : '다음 대상자'}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── 진행 중 / 결과 ───────────────────────────────────────── */
  return (
    <div className="memwipe-bg">
      <div className="memwipe-card memwipe-card--game">
        <div className="memwipe-card__title">
          기억소거 — {subject.name} ({subject.age}세, {subject.gender})
        </div>

        {/* 진행 중 머리 위로 지나가는 면담 텍스트 */}
        {phase === 'playing' && (
          <div className="memwipe-overlay-dialogue">
            {overlayLineIndex >= 1 && (
              <div className="memwipe-dialogue__line">
                {subject.question}
              </div>
            )}
            {overlayLineIndex >= 1 && (
              <div className={`memwipe-dialogue__line${subject.corrupted ? ' memwipe-dialogue__line--corrupted' : ''}`}>
                {overlayLineIndex === 1 ? overlayText : subject.answer}
                {overlayLineIndex === 1 && <span className="memwipe-typing-cursor">▌</span>}
              </div>
            )}
            {overlayLineIndex >= 2 && (
              <div className="memwipe-dialogue__line">
                {overlayLineIndex === 2 ? overlayText : CLOSING_LINE}
                {overlayLineIndex === 2 && <span className="memwipe-typing-cursor">▌</span>}
              </div>
            )}
            {overlayLineIndex === 0 && (
              <div className="memwipe-dialogue__line">
                {overlayText}
                <span className="memwipe-typing-cursor">▌</span>
              </div>
            )}
          </div>
        )}

        <div className="memwipe-bar">
          <div
            className="memwipe-bar__target"
            style={{ left: `${target.start}%`, width: `${target.width}%` }}
          />
          <div
            className="memwipe-bar__marker"
            style={{ left: `${markerPos}%` }}
          />
        </div>

        {phase === 'playing' && (
          <button className="memwipe-btn" onClick={handleStrike}>시행</button>
        )}

        {phase === 'result' && (
          <>
            <div className={`memwipe-result memwipe-result--${roundHit ? 'hit' : 'miss'}`}>
              {roundHit ? '성공' : '실패'}
            </div>
            <button className="memwipe-btn" onClick={handleAfterResult}>
              {roundHit ? '대화하기' : '확인'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
