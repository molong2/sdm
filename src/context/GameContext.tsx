import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { GameState, Flags, VisibilityCondition, CaseStatus, CaseNote, ApprovalStatus, Mail } from '../types';
import { CLOCKOUT_REQUIREMENTS, DAY_RESET_FLAGS, DAY_RESET_CASES, DAY_RESET_MAILS } from '../data/config';
import { mails } from '../data/mails';
import { approvals } from '../data/approvals';
import { submittableForms } from '../data/forms';
import { cases } from '../data/cases';
import { documents } from '../data/documents';
import { messengerChats } from '../data/messenger';
import { groupChats } from '../data/groupChats';

// ============================================================
// 게임 상태 관리 컨텍스트
// localStorage 자동 저장 포함
// ============================================================

const SAVE_KEY = 'dmgmt_save_v1';

/**
 * 초기(기본) 게임 상태.
 * 새 플래그를 추가할 때 여기에도 추가해야 관리자 패널에 표시됩니다.
 */
const DEFAULT_STATE: GameState = {
  currentAccountId: 'acc-player',
  currentDay: 1,
  readMails: [],
  readCases: [],
  readDocuments: [],
  unlockedItems: [],
  flags: {
    // ── 여기에 플래그를 추가하세요 ──────────────────────────
    discoveredBroadcast: false,
    foundArchiveKey: false,
    '청룡1팀장열람': false,
    readWelcomeMail: false,
    readDay2Mail: false,
    // 장비신청 탭 — 추후 트리거로 해금 예정
    equipmentAccessGranted: false,
    // 기억소거 미니게임 (2일차, 황운 메신저)
    agreedMemoryWipeHelp: false,
    memoryWipeMinigameDone: false,
    // 기억소거 결과에 따른 황운의 후속 메신저 (상호 배타적)
    mwOutcomePerfect: false,
    mwOutcomePerfectBreakdown: false,
    mwOutcomePartial: false,
    mwOutcomeAllFail: false,
    // 기억소거 완료 + 결과 메시지 발송 → 라디오 차단장비 외근 결재서류 등장 조건
    mwResultMessageSent: false,
    deniedWomanBreakdown: false,
    promisedReportOnBreakdown: false,
    // 라디오 차단장비 외근 결재서류 열람 → 전체 단톡방 트리거
    triggeredTeamChat: false,
    // 단톡방에서 한 번이라도 답하면 true (2일차 퇴근 조건)
    respondedTeamChat: false,
    // 3일차 — GBS 심야상담실 사건 파일 열람 시 창파의 교통사고 메신저 트리거
    viewedSuicideBroadcastCase: false,
    // 3일차 — 블랙박스 녹취록을 오염 문서로 신고 시 위험등급 상향조정 결재서류 등장
    reportedTrafficBroadcastDoc: false,
    // 3일차 — 위험등급 상향조정 결재 승인 시 국장실 종합분석 메일 등장
    approvedRiskUpgrade: false,
    // 엔딩 관련
    ending1Triggered:    false,  // 1회차 엔딩 트리거 (이벤트에서 설정)
    completedFirstEnding: false, // 1회차 엔딩 클리어 여부 (NG+ 언락 조건)
    day6GlitchMode: false,
    // ──────────────────────────────────────────────────────
  },
  caseStatuses: {},
  caseNotes: {},
  acknowledgedAlerts: [],
  submittedForms: [],
  chatProgress: {},
  chatChoices: {},
  approvalStatuses: {},
  approvalNotes: {},
  mailReplies: {},
  reportedDocuments: [],
  inventory: [],
  dynamicMails: [],
};

// ─── 컨텍스트 타입 ────────────────────────────────────────────

interface GameContextType {
  gameState: GameState;
  setCurrentDay: (day: number) => void;
  markMailRead: (id: string) => void;
  markCaseRead: (id: string) => void;
  markDocumentRead: (id: string) => void;
  /** 문서를 오염 문서로 신고 처리 */
  reportDocument: (id: string) => void;
  setFlag: (key: string, value: boolean) => void;
  resetSave: () => void;
  /** 특정 일차에 새로 등장하는 데이터와 해당 일차 전용 플래그만 초기화 (다른 일차 진행 상황은 유지) */
  resetDayData: (day: number) => void;
  isVisible: (item: VisibilityCondition) => boolean;
  canClockOut: boolean;
  clockOut: () => void;
  switchAccount: (accountId: string) => void;
  /** 사건의 실제 status 반환 (플레이어 변경 우선 적용) */
  getEffectiveStatus: (caseId: string, defaultStatus: CaseStatus) => CaseStatus;
  /** 사건 상태 변경 + 경과 기록 저장 */
  updateCaseStatus: (caseId: string, newStatus: CaseStatus, note: string) => void;
  /** 긴급호출 배너 확인(닫기) */
  acknowledgeAlert: (caseId: string) => void;
  /** 서류 제출 처리 */
  submitForm: (formId: string) => void;
  /** 특정 서류 제출 여부 확인 */
  isFormSubmitted: (formId: string) => boolean;
  /**
   * 1회차 엔딩 후 뉴게임+ 재시작.
   * completedFirstEnding 플래그만 유지하고 나머지는 초기화.
   */
  resetToNewGamePlus: () => void;
  /** NPC 메신저 스텝 하나 진행 (NPC 발화) */
  advanceChatNpcStep: (chatId: string) => void;
  /** 플레이어 선택지 선택 후 진행 */
  chooseChatOption: (chatId: string, stepIndex: number, choiceIndex: number) => void;
  /** 결재 서류의 현재 상태 반환 (미처리 시 'pending') */
  getApprovalStatus: (id: string) => ApprovalStatus;
  /** 결재 처리 (결재/보류/반려) + 선택적 의견 기록 */
  setApprovalDecision: (id: string, status: ApprovalStatus, note?: string) => void;
  /** 메일에 보낸 답장 텍스트 반환 (미발송 시 undefined) */
  getMailReply: (mailId: string) => string | undefined;
  /** 메일 답장 발송 */
  sendMailReply: (mailId: string, text: string) => void;
  /** 장비 아이템을 인벤토리에 추가 */
  addToInventory: (itemId: string) => void;
  /** 동적 메일 생성 (장비 지급 알림 등) */
  addDynamicMail: (mail: Mail) => void;
}

const GameContext = createContext<GameContextType | null>(null);

// ─── localStorage 유틸 ────────────────────────────────────────

function loadSave(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    // 새 필드/플래그가 추가된 경우에도 기본값과 병합
    return {
      ...DEFAULT_STATE,
      ...parsed,
      flags:             { ...DEFAULT_STATE.flags,             ...(parsed.flags             ?? {}) },
      caseStatuses:      parsed.caseStatuses      ?? DEFAULT_STATE.caseStatuses,
      caseNotes:         parsed.caseNotes         ?? DEFAULT_STATE.caseNotes,
      acknowledgedAlerts: parsed.acknowledgedAlerts ?? DEFAULT_STATE.acknowledgedAlerts,
      submittedForms:     parsed.submittedForms     ?? DEFAULT_STATE.submittedForms,
      chatProgress:       parsed.chatProgress       ?? DEFAULT_STATE.chatProgress,
      chatChoices:        parsed.chatChoices        ?? DEFAULT_STATE.chatChoices,
      approvalStatuses:   parsed.approvalStatuses    ?? DEFAULT_STATE.approvalStatuses,
      approvalNotes:      parsed.approvalNotes       ?? DEFAULT_STATE.approvalNotes,
      mailReplies:        parsed.mailReplies         ?? DEFAULT_STATE.mailReplies,
      reportedDocuments:  parsed.reportedDocuments   ?? DEFAULT_STATE.reportedDocuments,
      inventory:          parsed.inventory          ?? DEFAULT_STATE.inventory,
      dynamicMails:       parsed.dynamicMails       ?? DEFAULT_STATE.dynamicMails,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeSave(state: GameState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

// ─── Provider ────────────────────────────────────────────────

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(loadSave);

  // 상태 변경 시 자동 저장
  useEffect(() => {
    writeSave(gameState);
  }, [gameState]);

  const setCurrentDay = useCallback((day: number) => {
    setGameState(prev => ({ ...prev, currentDay: Math.max(1, day) }));
  }, []);

  const markMailRead = useCallback((id: string) => {
    setGameState(prev =>
      prev.readMails.includes(id)
        ? prev
        : { ...prev, readMails: [...prev.readMails, id] }
    );
  }, []);

  const markCaseRead = useCallback((id: string) => {
    setGameState(prev =>
      prev.readCases.includes(id)
        ? prev
        : { ...prev, readCases: [...prev.readCases, id] }
    );
  }, []);

  const markDocumentRead = useCallback((id: string) => {
    setGameState(prev =>
      prev.readDocuments.includes(id)
        ? prev
        : { ...prev, readDocuments: [...prev.readDocuments, id] }
    );
  }, []);

  const reportDocument = useCallback((id: string) => {
    setGameState(prev =>
      prev.reportedDocuments.includes(id)
        ? prev
        : { ...prev, reportedDocuments: [...prev.reportedDocuments, id] }
    );
  }, []);


  const setFlag = useCallback((key: string, value: boolean) => {
    setGameState(prev => ({
      ...prev,
      flags: { ...prev.flags, [key]: value },
    }));
  }, []);

  const resetSave = useCallback(() => {
    setGameState(DEFAULT_STATE);
  }, []);

  /**
   * 특정 일차에 새로 등장하는 데이터(unlockDay 기준 메일/사건/문서/메신저/단톡/
   * 결재서류/제출서류)와, 그 일차 전용 플래그(DAY_RESET_FLAGS)만 초기 상태로
   * 되돌린다. 이전 일차의 진행 상황과 currentDay는 그대로 유지된다.
   */
  const resetDayData = useCallback((day: number) => {
    const mailIds      = mails.filter(m => m.unlockDay === day).map(m => m.id);
    const caseIds       = cases.filter(c => c.unlockDay === day).map(c => c.id);
    const docIds        = documents.filter(d => d.unlockDay === day).map(d => d.id);
    const approvalIds   = approvals.filter(a => a.unlockDay === day).map(a => a.id);
    const formIds       = submittableForms.filter(f => f.unlockDay === day).map(f => f.id);
    const chatIds       = messengerChats.filter(c => c.unlockDay === day).map(c => c.id);
    const groupChatIds  = groupChats.filter(g => g.unlockDay === day).map(g => g.id);
    const dayFlags        = DAY_RESET_FLAGS[day] ?? [];
    const resetCaseIds    = DAY_RESET_CASES[day] ?? [];
    const allResetCaseIds = [...caseIds, ...resetCaseIds];
    const extraMailIds    = DAY_RESET_MAILS[day] ?? [];

    setGameState(prev => {
      const flags = { ...prev.flags };
      dayFlags.forEach(f => { flags[f] = false; });

      const approvalStatuses = { ...prev.approvalStatuses };
      const approvalNotes    = { ...prev.approvalNotes };
      approvalIds.forEach(id => { delete approvalStatuses[id]; delete approvalNotes[id]; });

      const chatProgress = { ...prev.chatProgress };
      const chatChoices  = { ...prev.chatChoices };
      [...chatIds, ...groupChatIds].forEach(id => { delete chatProgress[id]; delete chatChoices[id]; });

      const caseStatuses = { ...prev.caseStatuses };
      const caseNotes    = { ...prev.caseNotes };
      allResetCaseIds.forEach(id => { delete caseStatuses[id]; delete caseNotes[id]; });

      return {
        ...prev,
        readMails:     prev.readMails.filter(id => !mailIds.includes(id) && !extraMailIds.includes(id)),
        readCases:     prev.readCases.filter(id => !caseIds.includes(id)),
        readDocuments: prev.readDocuments.filter(id => !docIds.includes(id)),
        reportedDocuments: prev.reportedDocuments.filter(id => !docIds.includes(id)),
        submittedForms: prev.submittedForms.filter(id => !formIds.includes(id)),
        acknowledgedAlerts: prev.acknowledgedAlerts.filter(id => !allResetCaseIds.includes(id)),
        flags,
        approvalStatuses,
        approvalNotes,
        chatProgress,
        chatChoices,
        caseStatuses,
        caseNotes,
      };
    });
  }, []);

  const resetToNewGamePlus = useCallback(() => {
    setGameState({
      ...DEFAULT_STATE,
      flags: {
        ...DEFAULT_STATE.flags,
        completedFirstEnding: true,
      },
    });
  }, []);

  const isVisible = useCallback(
    (item: VisibilityCondition): boolean => {
      if (item.unlockDay !== undefined && item.unlockDay > gameState.currentDay) {
        return false;
      }
      if (item.requiredFlags && item.requiredFlags.length > 0) {
        if (!item.requiredFlags.every(flag => gameState.flags[flag] === true)) return false;
      }
      if (item.requiredAnyFlags && item.requiredAnyFlags.length > 0) {
        if (!item.requiredAnyFlags.some(flag => gameState.flags[flag] === true)) return false;
      }
      if (item.excludeFlags && item.excludeFlags.some(flag => gameState.flags[flag] === true)) {
        return false;
      }
      if (item.ownerAccount && item.ownerAccount !== gameState.currentAccountId) {
        return false;
      }
      return true;
    },
    [gameState.currentDay, gameState.flags, gameState.currentAccountId]
  );

  const switchAccount = useCallback((accountId: string) => {
    setGameState(prev => ({ ...prev, currentAccountId: accountId }));
  }, []);

  const canClockOut = useMemo(() => {
    // 2회차 3일차: 백호팀 면담 시퀀스 완료 전 퇴근 불가
    // (명경 채팅에서 '지금은 어렵다' 선택 시 respondedTeamChat만 세팅되어
    //  ng2BaekhoEventDone 없이 2일차 퇴근이 가능하고, 이 경우 3일차 콘텐츠가
    //  4일차까지 밀리는 문제를 방지)
    if (
      gameState.flags['completedFirstEnding'] &&
      gameState.currentDay === 3 &&
      !gameState.flags['ng2BaekhoEventDone']
    ) return false;

    // 2회차 3일차: doc-ng-001(금강 녹취록) 열람 전 퇴근 불가
    // 이 문서를 닫을 때 NG_DAY4_INTRO_EVENT가 발동해 자동으로 4일차로 넘어가므로,
    // 열람 없이 퇴근하면 4일차에서 해당 이벤트가 영구 차단된다.
    if (
      gameState.flags['completedFirstEnding'] &&
      gameState.currentDay === 3 &&
      !gameState.flags['ng3RecordRead']
    ) return false;

    const req = CLOCKOUT_REQUIREMENTS[gameState.currentDay];
    // 해당 일차에 항목이 없으면 외근신청만 가능 (퇴근 버튼 비활성)
    // 빈 객체 {}를 명시하면 조건 없이 퇴근 가능
    if (req === undefined) return false;
    const mailsDone  = (req.mails     ?? []).every(id => gameState.readMails.includes(id));
    const casesDone  = (req.cases     ?? []).every(id => gameState.readCases.includes(id));
    const docsDone   = (req.documents ?? []).every(id => gameState.readDocuments.includes(id));

    const allMailsDone = !req.allMails || mails
      .filter(isVisible)
      .every(m => gameState.readMails.includes(m.id));

    const allApprovalsDone = !req.allApprovalsResolved || approvals
      .filter(isVisible)
      .every(a => (gameState.approvalStatuses[a.id] ?? 'pending') !== 'pending');

    const allFormsDone = !req.allForms || submittableForms
      .filter(isVisible)
      .every(f => gameState.submittedForms.includes(f.id));

    const requiredFlagsDone = (req.requiredFlags ?? []).every(f => gameState.flags[f] === true);

    return mailsDone && casesDone && docsDone && allMailsDone && allApprovalsDone && allFormsDone && requiredFlagsDone;
  }, [
    gameState.currentDay, gameState.readMails, gameState.readCases, gameState.readDocuments,
    gameState.approvalStatuses, gameState.submittedForms, gameState.flags, isVisible,
  ]);

  const clockOut = useCallback(() => {
    setGameState(prev => ({ ...prev, currentDay: prev.currentDay + 1 }));
  }, []);

  const getEffectiveStatus = useCallback((caseId: string, defaultStatus: CaseStatus): CaseStatus => {
    return (gameState.caseStatuses[caseId] as CaseStatus) ?? defaultStatus;
  }, [gameState.caseStatuses]);

  const updateCaseStatus = useCallback((caseId: string, newStatus: CaseStatus, note: string) => {
    setGameState(prev => {
      const oldStatus: CaseStatus = (prev.caseStatuses[caseId] as CaseStatus | undefined) ?? newStatus;
      const entry: CaseNote = {
        day: prev.currentDay,
        oldStatus,
        newStatus,
        text: note,
      };
      return {
        ...prev,
        caseStatuses: { ...prev.caseStatuses, [caseId]: newStatus },
        caseNotes: {
          ...prev.caseNotes,
          [caseId]: [...(prev.caseNotes[caseId] ?? []), entry],
        },
      };
    });
  }, []);

  const acknowledgeAlert = useCallback((caseId: string) => {
    setGameState(prev =>
      prev.acknowledgedAlerts.includes(caseId)
        ? prev
        : { ...prev, acknowledgedAlerts: [...prev.acknowledgedAlerts, caseId] }
    );
  }, []);

  const submitForm = useCallback((formId: string) => {
    setGameState(prev =>
      prev.submittedForms.includes(formId)
        ? prev
        : { ...prev, submittedForms: [...prev.submittedForms, formId] }
    );
  }, []);

  const isFormSubmitted = useCallback((formId: string): boolean => {
    return gameState.submittedForms.includes(formId);
  }, [gameState.submittedForms]);

  // showIfChoice / showIfAnyChoice 조건 미충족 시 스텝을 건너뜀
  function skipConditionalSteps(
    script: Array<{ role: string; showIfChoice?: { step: number; choice: number }; showIfAnyChoice?: Array<{ step: number; choice: number }> }>,
    from: number,
    choices: Record<number, number>
  ): number {
    let idx = from;
    while (idx < script.length) {
      const s = script[idx];
      if (s.showIfChoice) {
        if ((choices[s.showIfChoice.step] ?? -1) !== s.showIfChoice.choice) { idx++; continue; }
      }
      if (s.showIfAnyChoice) {
        if (!s.showIfAnyChoice.some(({ step: st, choice: c }) => (choices[st] ?? -1) === c)) { idx++; continue; }
      }
      break;
    }
    return idx;
  }

  const advanceChatNpcStep = useCallback((chatId: string) => {
    setGameState(prev => {
      const allChats = [...messengerChats, ...groupChats];
      const chat = allChats.find(c => c.id === chatId);
      const choices = prev.chatChoices[chatId] ?? {};
      const raw = (prev.chatProgress[chatId] ?? 0) + 1;
      const next = chat ? skipConditionalSteps(chat.script as never[], raw, choices) : raw;
      return { ...prev, chatProgress: { ...prev.chatProgress, [chatId]: next } };
    });
  }, []);

  const chooseChatOption = useCallback(
    (chatId: string, stepIndex: number, choiceIndex: number) => {
      setGameState(prev => {
        const allChats = [...messengerChats, ...groupChats];
        const chat = allChats.find(c => c.id === chatId);
        const choices = { ...(prev.chatChoices[chatId] ?? {}), [stepIndex]: choiceIndex };
        const raw = stepIndex + 1;
        const next = chat ? skipConditionalSteps(chat.script as never[], raw, choices) : raw;
        return {
          ...prev,
          chatProgress: { ...prev.chatProgress, [chatId]: next },
          chatChoices: { ...prev.chatChoices, [chatId]: choices },
        };
      });
    },
    []
  );

  const getApprovalStatus = useCallback((id: string): ApprovalStatus => {
    return gameState.approvalStatuses[id] ?? 'pending';
  }, [gameState.approvalStatuses]);

  const setApprovalDecision = useCallback((id: string, status: ApprovalStatus, note?: string) => {
    setGameState(prev => ({
      ...prev,
      approvalStatuses: { ...prev.approvalStatuses, [id]: status },
      approvalNotes: note
        ? { ...prev.approvalNotes, [id]: note }
        : prev.approvalNotes,
    }));
  }, []);

  const getMailReply = useCallback((mailId: string): string | undefined => {
    return gameState.mailReplies[mailId];
  }, [gameState.mailReplies]);

  const sendMailReply = useCallback((mailId: string, text: string) => {
    setGameState(prev => ({
      ...prev,
      mailReplies: { ...prev.mailReplies, [mailId]: text },
    }));
  }, []);

  const addToInventory = useCallback((itemId: string) => {
    setGameState(prev => ({
      ...prev,
      inventory: [...prev.inventory, itemId],
    }));
  }, []);

  const addDynamicMail = useCallback((mail: Mail) => {
    setGameState(prev => ({
      ...prev,
      dynamicMails: [...prev.dynamicMails, mail],
    }));
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        setCurrentDay,
        markMailRead,
        markCaseRead,
        markDocumentRead,
        reportDocument,
        setFlag,
        resetSave,
        resetDayData,
        resetToNewGamePlus,
        isVisible,
        canClockOut,
        clockOut,
        switchAccount,
        getEffectiveStatus,
        updateCaseStatus,
        acknowledgeAlert,
        submitForm,
        isFormSubmitted,
        advanceChatNpcStep,
        chooseChatOption,
        getApprovalStatus,
        setApprovalDecision,
        getMailReply,
        sendMailReply,
        addToInventory,
        addDynamicMail,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────

export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}
