import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { HomePanel }            from './components/panels/HomePanel';
import { MailPanel }            from './components/panels/MailPanel';
import { CasesPanel }           from './components/panels/CasesPanel';
import { NoticesPanel }         from './components/panels/NoticesPanel';
import { FormsPanel }           from './components/panels/FormsPanel';
import { ArchivePanel }         from './components/panels/ArchivePanel';
import { PersonnelPanel }       from './components/panels/PersonnelPanel';
import { ApprovalPanel }        from './components/panels/ApprovalPanel';
import { EquipmentPanel }       from './components/panels/EquipmentPanel';
import { AdminPanel }           from './components/admin/AdminPanel';
import { LoginScreen }          from './components/LoginScreen';
import { PasswordWarningModal }  from './components/PasswordWarningModal';
import { EventScreen }           from './components/EventScreen';
import { OutingRequestModal }    from './components/OutingRequestModal';
import { MessengerToast }        from './components/messenger/MessengerToast';
import { ArchiveToast }          from './components/panels/ArchiveToast';
import { MessengerWindow }       from './components/messenger/MessengerWindow';
import { TeamChatToast }         from './components/messenger/TeamChatToast';
import { TeamChatWindow }        from './components/messenger/TeamChatWindow';
import { EndingScreen }          from './components/EndingScreen';
import type { EndingType }       from './components/EndingScreen';
import { MemoryWipeMinigame }    from './components/MemoryWipeMinigame';
import { GlitchCursorNav }      from './components/GlitchCursorNav';
import { cases }                from './data/cases';
import { DAY_EVENTS, DAY_ARRIVAL_EVENTS, DAY_OUTING_EVENTS, NG_DAY1_DIRECTOR_EVENT, NG_DAY1_OUTING_EVENT, NG_DAY2_OUTING_EVENT, NG_DAY2_BAEKHO_INTRO_EVENT, NG_DAY2_BAEKHO_MEMORIES_EVENT, NG_DAY4_INTRO_EVENT, NG_DAY4_OUTING_EVENT } from './data/events';
import { groupChats }           from './data/groupChats';
import { useGame } from './context/GameContext';
import { getDateForDay } from './utils/date';
import type { MenuSection, DayEvent } from './types';

const SECTION_PATHS: Record<MenuSection, string> = {
  home:      'index',
  mail:      'mail',
  cases:     'cases',
  notices:   'board',
  forms:     'forms',
  archive:   'archive',
  personnel: 'organization',
  approval:  'approval',
  equipment: 'equipment',
};

const SECTION_LABELS: Record<MenuSection, string> = {
  home:      '홈 (대시보드)',
  mail:      '메일함',
  cases:     '초자연재난',
  notices:   '공지사항',
  forms:     '서류제출',
  archive:   '자료 보관소',
  personnel: '조직 현황',
  approval:  '결재 서류',
  equipment: '장비신청',
};

type LoginMode = 'out' | 'initial' | 'in';

export function App() {
  const [loginMode, setLoginMode]     = useState<LoginMode>('initial');
  const [pwWarning, setPwWarning]     = useState(false);
  const [activeEvent, setActiveEvent] = useState<DayEvent | null>(null);
  const [outingOpen, setOutingOpen]   = useState(false);
  const [activeSection, setActiveSection] = useState<MenuSection>('home');
  const [adminOpen, setAdminOpen]     = useState(false);
  const [activeFormId, setActiveFormId] = useState<string | undefined>(undefined);
  const [activeDocId, setActiveDocId] = useState<string | undefined>(undefined);
  const [openNpcId, setOpenNpcId]     = useState<string | null>(null);
  const [dismissedChats, setDismissedChats] = useState<Set<string>>(new Set());
  const [openGroupChatId, setOpenGroupChatId] = useState<string | null>(null);
  const [dismissedGroupChats, setDismissedGroupChats] = useState<Set<string>>(new Set());
  const [dismissedDocToasts, setDismissedDocToasts] = useState<Set<string>>(new Set());
  const [activeEnding, setActiveEnding] = useState<EndingType | null>(null);
  const [memoryWipeActive, setMemoryWipeActive] = useState(false);
  const [memoryRecoveryActive, setMemoryRecoveryActive] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [glitchNavDone, setGlitchNavDone] = useState(false);
  const [gameOverActive, setGameOverActive] = useState(false);
  const [gameOverFading, setGameOverFading] = useState(false);
  const gameOverTriggeredRef = useRef(false);

  const {
    gameState, clockOut, setFlag, switchAccount, canClockOut,
    isVisible, getEffectiveStatus, updateCaseStatus, acknowledgeAlert, resetToNewGamePlus,
    advanceChatNpcStep, addToInventory, getMailReply,
  } = useGame();

  // 주소창 경로를 정부 인트라넷처럼 표시 (History API — 실제 라우팅 없음)
  useEffect(() => {
    if (loginMode !== 'in') {
      window.history.replaceState({}, '', '/intranet/login');
    } else {
      window.history.replaceState({}, '', `/intranet/${SECTION_PATHS[activeSection]}`);
    }
  }, [loginMode, activeSection]);

  // 엔딩 플래그 감지 (이벤트 외부에서 트리거된 경우 대비)
  useEffect(() => {
    if (!activeEnding && loginMode === 'in') {
      if (gameState.flags['ending1Triggered']) setActiveEnding('first');
      // 진짜 엔딩은 미구현이므로 트리거 조건 추가 시 여기에 추가
    }
  }, [gameState.flags, loginMode, activeEnding]);

  // 기억소거 미니게임 트리거 감지 (황운 메신저에서 지원 수락 시)
  useEffect(() => {
    if (
      loginMode === 'in' && !memoryWipeActive &&
      gameState.flags['agreedMemoryWipeHelp'] && !gameState.flags['memoryWipeMinigameDone']
    ) {
      setMemoryWipeActive(true);
    }
  }, [gameState.flags, loginMode, memoryWipeActive]);

  // 2회차 백호팀 면담 인트로 트리거 (명경 메신저에서 수락 시)
  useEffect(() => {
    if (
      loginMode === 'in' && !activeEvent &&
      gameState.flags['ng2BaekhoCallAccepted'] && !gameState.flags['ng2BaekhoIntroADone']
    ) {
      setActiveEvent(NG_DAY2_BAEKHO_INTRO_EVENT);
    }
  }, [gameState.flags, loginMode, activeEvent]);

  // 2회차 백호팀 인트로 완료 → 기억소거 미니게임 (복원 모드)
  useEffect(() => {
    if (
      loginMode === 'in' && !activeEvent && !memoryRecoveryActive &&
      gameState.flags['ng2BaekhoCallAccepted'] &&
      gameState.flags['ng2BaekhoIntroADone'] && !gameState.flags['ng2RecoveryDone']
    ) {
      setMemoryRecoveryActive(true);
    }
  }, [gameState.flags, loginMode, activeEvent, memoryRecoveryActive]);

  // 2회차 기억소거 미니게임 완료 → 기억 복원 결과 이벤트
  useEffect(() => {
    if (
      loginMode === 'in' && !activeEvent &&
      gameState.flags['ng2BaekhoCallAccepted'] &&
      gameState.flags['ng2RecoveryDone'] && !gameState.flags['ng2BaekhoEventDone']
    ) {
      setActiveEvent(NG_DAY2_BAEKHO_MEMORIES_EVENT);
    }
  }, [gameState.flags, loginMode, activeEvent]);

  // 2회차 Day 4: 금양 메신저 확인 → case-003 긴급호출 상태로 즉시 전환
  useEffect(() => {
    if (
      gameState.flags['ng4GolimMessengerRead'] &&
      getEffectiveStatus('case-003', '진행중') !== '긴급호출'
    ) {
      updateCaseStatus('case-003', '긴급호출', '방송국 부지 인근 대형 추돌사고 발현 확인 (4일차)');
    }
  }, [gameState.flags['ng4GolimMessengerRead']]); // eslint-disable-line react-hooks/exhaustive-deps

  // 일차 전환 또는 이벤트 전환 시 열려있던 메신저·단체채팅창 자동 닫기
  const prevDayRef = useRef(gameState.currentDay);
  useEffect(() => {
    if (gameState.currentDay !== prevDayRef.current) {
      prevDayRef.current = gameState.currentDay;
      setOpenNpcId(null);
      setOpenGroupChatId(null);
    }
  }, [gameState.currentDay]);

  useEffect(() => {
    setOpenNpcId(null);
    setOpenGroupChatId(null);
  }, [activeEvent]);

  // 단체 대화방 자동 진행 — 창을 열어두지 않아도 시간이 지나면 새 메시지가 쌓인다.
  useEffect(() => {
    if (loginMode !== 'in') return;
    const timer = setInterval(() => {
      const gc = groupChats.find(c => {
        if (!isVisible(c)) return false;
        const progress = gameState.chatProgress[c.id] ?? 0;
        return progress < c.script.length && c.script[progress].role === 'npc';
      });
      if (gc) advanceChatNpcStep(gc.id);
    }, 1800);
    return () => clearInterval(timer);
  }, [loginMode, gameState.chatProgress, gameState.flags, isVisible, advanceChatNpcStep]);

  // 글리치 모드: 7일차 이상 && 미제출 → 무조건 활성화
  // 네비게이션은 GlitchCursorNav 커서 애니메이션이 끝난 뒤 콜백으로 처리한다.
  useEffect(() => {
    const shouldGlitch =
      loginMode === 'in' &&
      !activeEvent &&
      gameState.currentDay >= 7 &&
      !gameState.submittedForms.includes('form-r6d');

    setIsGlitching(shouldGlitch);
    if (!shouldGlitch) setGlitchNavDone(false);
  }, [loginMode, activeEvent, gameState.currentDay, gameState.submittedForms]); // eslint-disable-line react-hooks/exhaustive-deps

  // 글리치 중·게임오버 팝업·암전 중 실제 커서 숨기기
  useEffect(() => {
    const hide = isGlitching || gameOverActive || gameOverFading;
    if (hide) document.body.classList.add('cursor-hijacked');
    else      document.body.classList.remove('cursor-hijacked');
    return () => document.body.classList.remove('cursor-hijacked');
  }, [isGlitching, gameOverActive, gameOverFading]);

  // form-r6d 제출 감지 → GAME OVER 팝업 활성화
  useEffect(() => {
    if (
      gameState.currentDay >= 7 &&
      gameState.submittedForms.includes('form-r6d') &&
      !gameOverTriggeredRef.current
    ) {
      gameOverTriggeredRef.current = true;
      setGameOverActive(true);
    }
  }, [gameState.submittedForms, gameState.currentDay]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleMemoryRecoveryComplete() {
    setFlag('ng2RecoveryDone', true);
    setMemoryRecoveryActive(false);
  }

  function handleMemoryWipeComplete(successCount: number, womanBreakdownTriggered: boolean) {
    if (successCount === 3) {
      setFlag(womanBreakdownTriggered ? 'mwOutcomePerfectBreakdown' : 'mwOutcomePerfect', true);
    } else if (successCount === 0) {
      setFlag('mwOutcomeAllFail', true);
    } else {
      setFlag('mwOutcomePartial', true);
    }
    setFlag('memoryWipeMinigameDone', true);
    setFlag('mwResultMessageSent', true);
    setMemoryWipeActive(false);
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      setAdminOpen(prev => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 사건 ID → 연결된 긴급호출 아카이브 문서 ID (배너 클릭 시 바로 열기)
  const EMERGENCY_DOC_MAP: Record<string, string> = {
    'case-003': 'doc-ng-gbs-emergency',
  };

  // 긴급호출 배너 대상: 보이는 사건 중 긴급호출 상태이고 아직 미확인
  const emergencyCases = cases.filter(c => {
    if (!isVisible(c)) return false;
    if (getEffectiveStatus(c.id, c.status) !== '긴급호출') return false;
    if (gameState.acknowledgedAlerts.includes(c.id)) return false;
    return true;
  });

  function triggerClockOut() {
    if (gameState.flags['completedFirstEnding']) {
      // 2회차: 날별 NG 퇴근 이벤트만 사용, 1회차 DAY_EVENTS 절대 사용 안 함
      if (gameState.currentDay === 1 && !gameState.flags['ng1OutingEventDone']) {
        setActiveEvent(NG_DAY1_OUTING_EVENT);
        return;
      }
      if (gameState.currentDay === 2 && !gameState.flags['ng2OutingEventDone']) {
        setActiveEvent(NG_DAY2_OUTING_EVENT);
        return;
      }
      clockOut();
      return;
    }
    const event = DAY_EVENTS[gameState.currentDay];
    if (event) setActiveEvent(event);
    else clockOut();
  }

  function handleClockOut() {
    if (canClockOut) triggerClockOut();
    else setOutingOpen(true);
  }

  function handleEventComplete(flags: Record<string, boolean>) {
    Object.entries(flags).forEach(([k, v]) => setFlag(k, v));

    if (flags['ending1Triggered']) {
      setActiveEvent(null);
      setActiveEnding('first');
      return;
    }

    // 아이템 지급 — 이벤트 플래그에 따라 인벤토리 갱신
    if (flags['day4_dobaegiGranted']) addToInventory('eq-019');
    if (flags['day5_protoGranted']) addToInventory('eq-023');

    // 도착 이벤트(isArrivalEvent)는 원칙적으로 day를 진행하지 않음
    // 단, 방송국 방문(day6GlitchMode) 경로는 예외로 다음 날로 진행
    if (activeEvent?.isArrivalEvent && !flags['day6GlitchMode']) {
      setActiveEvent(null);
      return;
    }

    // 퇴근 이벤트 또는 방송국 방문 종료: 다음 날로 넘어간다
    clockOut();
    setActiveEvent(null);
  }

  // 메일 뒤로가기 시 — 특정 소환 메일이면 도착 이벤트 트리거
  function handleMailBack(mailId: string) {
    if (mailId === 'mail-ng01' && gameState.readMails.includes('mail-ng01') && !gameState.flags['ng1DirectorEventDone']) {
      setActiveEvent(NG_DAY1_DIRECTOR_EVENT);
      return;
    }
    if (mailId === 'mail-009' && !gameState.flags['day4ArrivalDone']) {
      const arrivalEvent = DAY_ARRIVAL_EVENTS[4];
      if (arrivalEvent) setActiveEvent(arrivalEvent);
    }
  }

  // 자료보관소 문서 닫기 시 — doc-ng-001 닫으면 4일차 이벤트 트리거
  function handleDocBack(docId: string) {
    if (
      docId === 'doc-ng-001' &&
      gameState.flags['completedFirstEnding'] &&
      gameState.currentDay === 3 &&
      !gameState.flags['ng3Day4IntroDone']
    ) {
      setActiveEvent(NG_DAY4_INTRO_EVENT);
    }
  }

  function handleEndingRestart() {
    resetToNewGamePlus();
    setActiveEnding(null);
    setLoginMode('initial');
  }

  function handleGameOverYes() {
    setGameOverActive(false);
    setGameOverFading(true);
    setTimeout(() => {
      resetToNewGamePlus();
      setLoginMode('initial');
      setIsGlitching(false);
      setGlitchNavDone(false);
      setActiveSection('home');
      setActiveEvent(null);
      setActiveFormId(undefined);
      gameOverTriggeredRef.current = false;
      setGameOverFading(false);
    }, 2600);
  }

  function handleLogout() {
    switchAccount('acc-player');
    setLoginMode('out');
  }

  // ── 최초 로그인 화면 ───────────────────────────────────────
  if (loginMode === 'initial') {
    return (
      <LoginScreen
        mode="initial"
        onSuccess={acc => {
          switchAccount(acc.id);
          setLoginMode('in');
          setPwWarning(true);
        }}
      />
    );
  }

  // ── 로그아웃 후 계정 전환 화면 ────────────────────────────
  if (loginMode === 'out') {
    return (
      <LoginScreen
        mode="switch"
        onSuccess={acc => {
          switchAccount(acc.id);
          setLoginMode('in');
        }}
      />
    );
  }

  // ── 엔딩 화면 (이벤트 화면보다 우선) ──────────────────────
  if (activeEnding) {
    return <EndingScreen type={activeEnding} onRestart={handleEndingRestart} />;
  }

  // ── 이벤트 화면 ───────────────────────────────────────────
  if (activeEvent) {
    return <EventScreen key={activeEvent.id} event={activeEvent} onComplete={handleEventComplete} />;
  }

  // ── 기억 복원 미니게임 (2회차) ─────────────────────────────
  if (memoryRecoveryActive) {
    return <MemoryWipeMinigame recoveryMode onComplete={() => handleMemoryRecoveryComplete()} />;
  }

  // ── 기억소거 미니게임 ───────────────────────────────────────
  if (memoryWipeActive) {
    return <MemoryWipeMinigame onComplete={handleMemoryWipeComplete} />;
  }

  const dateStr = getDateForDay(gameState.currentDay);

  return (
    <div className={`app${(isGlitching || gameOverActive || gameOverFading) ? ' app--glitch' : ''}`}>
      <Header onClockOut={handleClockOut} onLogout={handleLogout} />

      {/* 글리치 진입 커서 애니메이션 (네비 완료 전에만 렌더) */}
      {isGlitching && !glitchNavDone && (
        <GlitchCursorNav
          onNavClick={() => setActiveSection('forms')}
          onFormClick={() => setActiveFormId('form-r6d')}
          onDone={() => setGlitchNavDone(true)}
        />
      )}

      {/* GAME OVER 팝업 */}
      {gameOverActive && (
        <div className="game-over-overlay">
          <div className="game-over-popup">
            <div className="game-over-popup__title">GAME OVER!</div>
            <div className="game-over-popup__body">다시 시작하시겠습니까?</div>
            <div className="game-over-popup__actions">
              <button className="game-over-popup__btn" onClick={handleGameOverYes}>예</button>
              <button className="game-over-popup__btn" onClick={handleGameOverYes}>예</button>
            </div>
          </div>
        </div>
      )}

      {/* 암전 페이드 */}
      {gameOverFading && (
        <div className="game-over-blackout" />
      )}

      {/* 긴급호출 배너 (항상 DOM에 존재, 비어있으면 grid row 높이 0) */}
      <div className="emergency-banner-zone">
        {emergencyCases.map(c => (
          <div key={c.id} className="emergency-banner">
            <span className="emergency-banner__label">⚠ 긴급호출</span>
            <span className="emergency-banner__title">{c.title}</span>
            <span className="emergency-banner__case">{c.caseNumber}</span>
            <div className="emergency-banner__actions">
              <button
                className="emergency-banner__btn emergency-banner__btn--view"
                onClick={() => {
                  acknowledgeAlert(c.id);
                  const docId = EMERGENCY_DOC_MAP[c.id];
                  if (docId) {
                    setActiveDocId(docId);
                    setActiveSection('archive');
                  } else {
                    setActiveSection('cases');
                  }
                }}
              >
                사건 확인
              </button>
              <button
                className="emergency-banner__btn"
                onClick={() => acknowledgeAlert(c.id)}
              >
                닫기
              </button>
            </div>
          </div>
        ))}
      </div>

      <Sidebar active={activeSection} onSelect={setActiveSection} />

      <main className="content">
        <div className="breadcrumb">
          <span>초자연재난관리국 업무망</span>
          <span className="breadcrumb__sep">›</span>
          <span className="breadcrumb__cur">{SECTION_LABELS[activeSection]}</span>
        </div>
        {(() => {
          switch (activeSection) {
            case 'home':      return <HomePanel />;
            case 'mail':      return (
              <MailPanel
                onOpenForm={formId => { setActiveFormId(formId); setActiveSection('forms'); }}
                onOpenDoc={docId => { setActiveDocId(docId); setActiveSection('archive'); }}
                onMailBack={handleMailBack}
              />
            );
            case 'cases':     return <CasesPanel />;
            case 'notices':   return <NoticesPanel />;
            case 'forms':     return <FormsPanel targetFormId={activeFormId} />;
            case 'archive':   return <ArchivePanel targetDocId={activeDocId} onDocClose={handleDocBack} />;
            case 'personnel': return <PersonnelPanel />;
            case 'approval':  return <ApprovalPanel />;
            case 'equipment': return <EquipmentPanel />;
            default:          return <HomePanel />;
          }
        })()}
      </main>

      <div className="statusbar">
        <div className="statusbar__cell">
          <span className="statusbar__dot" />
          접속 상태: 정상
        </div>
        <div className="statusbar__cell">서버: dmgmt-intra-01</div>
        <div className="statusbar__cell">{dateStr}</div>
        {gameState.currentAccountId !== 'acc-player' && (
          <div className="statusbar__cell" style={{ color: '#e09040', fontWeight: 700 }}>
            ⚠ 외부 계정 접속 중
          </div>
        )}
        <div className="statusbar__spacer" />
        <div className="statusbar__cell" style={{ color: 'var(--text-3)', fontSize: 10 }}>
          [개발자 패널: Ctrl+Shift+A]
        </div>
      </div>

      {/* 자료보관소 신규 문서 알림 토스트 */}
      <ArchiveToast
        dismissed={dismissedDocToasts}
        onOpen={docId => { setActiveDocId(docId); setActiveSection('archive'); }}
        onDismiss={id => setDismissedDocToasts(prev => new Set([...prev, id]))}
      />

      {/* 메신저 알림 토스트 */}
      <MessengerToast
        dismissed={dismissedChats}
        onOpen={id => setOpenNpcId(id)}
        onDismiss={id => setDismissedChats(prev => new Set([...prev, id]))}
      />

      {/* 메신저 채팅창 */}
      {openNpcId && (
        <MessengerWindow
          npcId={openNpcId}
          onClose={() => setOpenNpcId(null)}
          onOpenDoc={docId => { setActiveDocId(docId); setActiveSection('archive'); }}
        />
      )}

      {/* 단체 대화방 알림 토스트 */}
      <TeamChatToast
        dismissed={dismissedGroupChats}
        onOpen={id => setOpenGroupChatId(id)}
        onDismiss={id => setDismissedGroupChats(prev => new Set([...prev, id]))}
      />

      {/* 단체 대화방 창 */}
      {openGroupChatId && (
        <TeamChatWindow
          groupChatId={openGroupChatId}
          onClose={() => setOpenGroupChatId(null)}
        />
      )}

      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}

      {outingOpen && (
        <OutingRequestModal
          currentDay={gameState.currentDay}
          onApproved={(isOutingEvent) => {
            setOutingOpen(false);
            if (isOutingEvent) {
              // 2회차 4일차 초자연재난 외근
              if (gameState.flags['completedFirstEnding'] && gameState.currentDay === 4) {
                setActiveEvent(NG_DAY4_OUTING_EVENT);
                return;
              }
              const outingEvent = DAY_OUTING_EVENTS[gameState.currentDay];
              if (outingEvent) { setActiveEvent(outingEvent); return; }
            }
            triggerClockOut();
          }}
          onClose={() => setOutingOpen(false)}
        />
      )}

      {pwWarning && (
        <PasswordWarningModal
          onChangeLater={() => setPwWarning(false)}
        />
      )}
    </div>
  );
}
