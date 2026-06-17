// ============================================================
// 게임 설정 — 비밀번호, 날짜, 퇴근 조건 등 주요 상수
// ============================================================

/** 내부망 접속 비밀번호 */
export const INTRANET_PASSWORD = 'daosfuqwi1#26';

/** 요원 호칭 (로그인 화면 인사말에 사용) */
export const AGENT_CALLSIGN = '태산';

/** 1일차에 해당하는 실제 날짜 */
export const BASE_DATE = new Date(2026, 5, 18); // 2026-06-18

// ============================================================
// 일차별 퇴근 활성화 조건
// 해당 일차의 항목이 없으면 즉시 퇴근 가능.
// 항목이 있으면 지정된 메일/사건/문서를 모두 열람해야 퇴근 버튼이 활성화됩니다.
// ============================================================

export interface DayRequirements {
  mails?:     string[];   // 읽어야 할 메일 ID 목록
  cases?:     string[];   // 읽어야 할 사건 ID 목록
  documents?: string[];   // 읽어야 할 문서 ID 목록
  /** true면 해당 일차에 보이는 메일을 전부 읽어야 함 (mails 배열과 별개로 추가 적용) */
  allMails?: boolean;
  /** true면 해당 일차에 보이는 결재서류 중 미결재(pending)가 하나도 없어야 함 (보류는 허용) */
  allApprovalsResolved?: boolean;
  /** true면 해당 일차에 보이는 제출서류를 전부 제출해야 함 */
  allForms?: boolean;
  /** 이 플래그들이 모두 true여야 퇴근 가능 (예: 단톡방에 한 번이라도 답해야 함) */
  requiredFlags?: string[];
}

/**
 * 일차별 퇴근 조건.
 * 예시:
 *   1: { mails: ['mail-001'], documents: ['doc-001'] }
 *   → 1일차에 mail-001과 doc-001을 모두 읽어야 퇴근 가능
 */
export const CLOCKOUT_REQUIREMENTS: Record<number, DayRequirements> = {
  1: { allMails: true, allApprovalsResolved: true, allForms: true },
  2: { requiredFlags: ['respondedTeamChat'] },
  3: { allMails: true, allApprovalsResolved: true },
  4: { requiredFlags: ['equipmentMailRead'] },
};

// ============================================================
// 일차별 초기화 대상 플래그
// 관리자패널의 "해당 일차 초기화"가 어떤 플래그를 끌지 결정합니다.
// (메일/사건/문서/메신저/단톡/결재서류/제출서류는 unlockDay로 자동 판별되므로
//  여기엔 day와 직접 연관되지 않는 플래그만 수동으로 등록하면 됩니다.)
// 새 일차 콘텐츠를 추가할 때 여기도 함께 갱신하세요.
// ============================================================

export const DAY_RESET_FLAGS: Record<number, string[]> = {
  1: ['readWelcomeMail'],
  2: [
    'readDay2Mail',
    'agreedMemoryWipeHelp',
    'memoryWipeMinigameDone',
    'mwOutcomePerfect',
    'mwOutcomePerfectBreakdown',
    'mwOutcomePartial',
    'mwOutcomeAllFail',
    'mwResultMessageSent',
    'deniedWomanBreakdown',
    'promisedReportOnBreakdown',
    'triggeredTeamChat',
    'respondedTeamChat',
  ],
  3: ['viewedSuicideBroadcastCase', 'reportedTrafficBroadcastDoc', 'approvedRiskUpgrade'],
  4: ['day4ArrivalDone', 'equipmentAccessGranted', 'day4_dobaegiGranted', 'equipmentMailRead', 'day4NightDone', 'foundConspiracySite'],
  5: ['readYuriLab', 'day5OutingEnabled', 'day5OutingDone', 'day5OutingReveal', 'day5_protoGranted'],
  6: ['readDay6Case', 'day6OutingEnabled', 'day6OutingDone'],
};

// ============================================================
// 외근신청 관련 설정
// ============================================================

/**
 * 일차별 활성 긴급호출 목록.
 * '초자연재난' 사유 외근신청은 해당 일차에 긴급호출이 있을 때만 승인됩니다.
 * 빈 배열이거나 해당 일차 키가 없으면 반려됩니다.
 */
export const ACTIVE_EMERGENCY_CALLS: Record<number, string[]> = {
  // 예시: 1: ['사건 제2026-001호 긴급출동'],
};

/**
 * 기타사유 외근신청 시 승인 가능한 문구 목록.
 * 입력한 사유가 이 목록에 완전 일치해야 승인됩니다.
 * 현재 비어있음 → 기타사유는 항상 반려.
 */
export const APPROVED_OUTING_REASONS: string[] = [];

/**
 * 일차별 기타사유 외근 승인 문구 (띄어쓰기 제거 후 비교).
 * 해당 일차 한정으로 승인되며, 승인 시 외근 이벤트 플래그가 설정됩니다.
 */
export const APPROVED_OUTING_REASONS_BY_DAY: Record<number, string[]> = {
  5: ['청룡1팀조사보조'],
};

/**
 * 일차별 외근 승인 조건.
 * - requiredFlag: 이 플래그가 true일 때만 외근 승인 가능
 * - doneFlag: 이 플래그가 true면 이미 수행한 외근 → 재승인 불가
 * - reason: 어떤 사유 유형에 적용되는지 ('supernatural' = 초자연재난, 'other' = 기타사유)
 */
export interface OutingCondition {
  requiredFlag: string;
  doneFlag: string;
  reason: 'supernatural' | 'other';
}

export const OUTING_CONDITIONS: Record<number, OutingCondition> = {
  5: { reason: 'other',        requiredFlag: 'day5OutingEnabled', doneFlag: 'day5OutingDone' },
  6: { reason: 'supernatural', requiredFlag: 'day6OutingEnabled', doneFlag: 'day6OutingDone' },
};
