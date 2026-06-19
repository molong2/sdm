// ============================================================
// 게임 전체 타입 정의
// 데이터 파일에서 이 타입들을 import하여 사용합니다.
// ============================================================

/** 항목 가시성 조건 — 모든 데이터 타입이 상속 */
export interface VisibilityCondition {
  /** 이 일차 이상이어야 표시됨 (미설정 시 항상 표시) */
  unlockDay?: number;
  /** 이 플래그들이 모두 true여야 표시됨 */
  requiredFlags?: string[];
  /** 이 플래그들 중 하나라도 true면 표시됨 (OR 조건) */
  requiredAnyFlags?: string[];
  /** 이 플래그들 중 하나라도 true면 숨김 */
  excludeFlags?: string[];
  /**
   * 설정 시 해당 계정으로 로그인되어 있을 때만 표시됨.
   * 예: ownerAccount: 'acc-kim' → acc-kim 계정 접속 중에만 보임.
   */
  ownerAccount?: string;
}

// ─── 메일 ────────────────────────────────────────────────────

/** 메일 첨부파일 — formId: 서류제출 탭으로 이동 / docId: 자료보관소 탭으로 이동 */
export interface MailAttachment {
  name: string;
  formId?: string;
  docId?: string;
}

export interface Mail extends VisibilityCondition {
  id: string;
  from: string;
  fromDept?: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  attachments?: MailAttachment[];
  /** 중요 메일 표시 */
  important?: boolean;
  /** 시스템 자동 발신 메일 */
  system?: boolean;
  /** 이 메일을 최초로 열람했을 때 설정할 플래그 */
  onReadFlags?: Record<string, boolean>;
  /** 답장 텍스트에 키워드가 포함될 때 설정할 플래그 */
  replyKeywords?: { words: string[]; setFlags: Record<string, boolean> }[];
}

// ─── 서류제출 양식 ─────────────────────────────────────────────

export type FormFieldType = 'readonly' | 'text' | 'date' | 'checkbox' | 'textarea' | 'clause';

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  /** readonly / checkbox 의 고정 값 또는 체크박스 옆 안내문 */
  value?: string;
  placeholder?: string;
  required?: boolean;
}

export interface SubmittableForm extends VisibilityCondition {
  id: string;
  /** 양식 번호 (예: SC-02) */
  formNumber: string;
  title: string;
  description?: string;
  /** 이 ID의 필드를 forcedContent로 강제 타이핑 */
  forcedFieldId?: string;
  /** 강제 타이핑 내용 */
  forcedContent?: string;
  fields: FormField[];
}

// ─── 사건 ────────────────────────────────────────────────────

/** 사건 진행 상태 */
export type CaseStatus = '긴급호출' | '진행중' | '봉인' | '종결';

/** 사건 상태 변경 기록 */
export interface CaseNote {
  day: number;
  oldStatus: CaseStatus;
  newStatus: CaseStatus;
  text: string;
}

export interface Case extends VisibilityCondition {
  id: string;
  /** 공식 사건 번호 (예: 제2024-001호) */
  caseNumber: string;
  title: string;
  status: CaseStatus;
  /** 관리등급 — 고형(告刑)/뇌형(櫴刑)/쇄형(鎖刑)/파형(破刑)/침형(沈刑) */
  category: string;
  assignedTo?: string;
  reportedDate: string;
  description: string;
  notes?: string;
  /** 이 사건 파일을 열람했을 때 설정할 플래그 */
  onReadFlags?: Record<string, boolean>;
}

// ─── 직원 ────────────────────────────────────────────────────

/** 직원 재직 상태 */
export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'suspended' | 'unknown';

export interface Employee extends VisibilityCondition {
  id: string;
  /** 사번 */
  employeeId: string;
  name: string;
  department: string;
  position: string;
  /** 직급 (예: 6급, 주무관 등) */
  rank: string;
  status: EmployeeStatus;
  phone?: string;
  email?: string;
  joinDate?: string;
  /** 특이사항 */
  notes?: string;
}

// ─── 문서 ────────────────────────────────────────────────────

/** 문서 보안 등급 */
export type ClassificationLevel = 'public' | 'internal' | 'confidential' | 'secret';

export interface Document extends VisibilityCondition {
  id: string;
  /** 문서 관리번호 */
  docNumber: string;
  title: string;
  /** 문서 분류 (예: 규정, 보고서, 지침 등) */
  category: string;
  classification: ClassificationLevel;
  author: string;
  date: string;
  content: string;
  tags?: string[];
  /** 본문 뒤에 표시할 오염 텍스트 라인. string은 기본 스타일, { text, glitch: true }는 글리치 애니메이션 적용. */
  corruptedLines?: (string | { text: string; glitch: true })[];
  /** true면 문서 상세에 "오염 문서 신고" 버튼이 표시됨 */
  reportable?: boolean;
  /** "오염 문서 신고" 버튼을 눌렀을 때 설정할 플래그 */
  onReportFlags?: Record<string, boolean>;
  /** 이 문서를 최초로 열람했을 때 설정할 플래그 */
  onReadFlags?: Record<string, boolean>;
}

// ─── 폐기 자료 ───────────────────────────────────────────────

export type DiscardedItemType = 'mail' | 'document' | 'case_file' | 'media' | 'other';

export interface DiscardedItem extends VisibilityCondition {
  id: string;
  title: string;
  type: DiscardedItemType;
  originalDate: string;
  destroyedDate: string;
  content: string;
  /** 폐기 사유 */
  reason?: string;
  /**
   * true이면 조건 미충족 시 목록에서도 보이지 않음.
   * false이면 제목은 보이되 내용이 [열람 불가]로 표시됨.
   */
  fullyHidden?: boolean;
}

// ─── 결재 서류 ───────────────────────────────────────────────

/** 결재 처리 상태 */
export type ApprovalStatus = 'pending' | 'approved' | 'held' | 'rejected';

export interface ApprovalDocument extends VisibilityCondition {
  id: string;
  /** 문서 관리번호 (예: 현무1팀 내결 제2026-09호) */
  docNumber: string;
  title: string;
  /** 신청자 (이름 + 소속) */
  requester: string;
  requestedDate: string;
  /** 구분 (휴가, 수당, 구매, 시설사용 등) */
  category: string;
  content: string;
  /** 이 서류를 처음 열람했을 때 설정할 플래그 */
  onOpenFlags?: Record<string, boolean>;
  /** 이 서류가 결재(승인) 처리되었을 때 설정할 플래그 */
  onApprovedFlags?: Record<string, boolean>;
}

// ─── 공지사항 ─────────────────────────────────────────────────

export interface Notice extends VisibilityCondition {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: 'normal' | 'important' | 'urgent';
  /** 상단 고정 여부 */
  pinned?: boolean;
}


// ─── 텍스트 어드벤처 이벤트 ──────────────────────────────────────

/** 선택지 하나 */
export interface EventChoice {
  /** 버튼에 표시되는 텍스트 */
  label: string;
  /** 다음 장면 ID */
  next: string;
  /** 선택 시 설정할 플래그 */
  setFlags?: Record<string, boolean>;
  /**
   * 이 선택지를 표시하기 위해 플레이어 인벤토리에 있어야 하는 장비 ID 목록.
   * 하나라도 없으면 선택지가 렌더링되지 않는다.
   */
  requiredItems?: string[];
  /**
   * 나열된 플래그 중 하나라도 이벤트 내부 플래그로 true이면 이 선택지를 숨긴다.
   * 이미 방문한 탐색 지점 선택지를 제거할 때 사용.
   */
  excludeFlags?: string[];
  /**
   * 나열된 플래그 중 minCount 개 이상이 true여야 이 선택지를 표시한다.
   * 예: 5개 지점 중 3개 이상 방문해야 '철수' 선택지 표시.
   */
  requiredFlagCount?: { flags: string[]; minCount: number };
  /**
   * 나열된 플래그 중 minCount 개 이상이 true이면 이 선택지를 숨긴다.
   * 예: 3개 이상 방문 시 추가 탐색 선택지를 모두 숨김.
   */
  excludeWhenFlagCount?: { flags: string[]; minCount: number };
  /** 특수 라벨 렌더링 스타일. 'glitch-censor': 200ms마다 랜덤 검열 패턴 교체 */
  labelStyle?: 'glitch-censor';
}

/** 이벤트 장면 하나 */
export interface EventScene {
  id: string;
  /** 상단 위치 표시 */
  location: string;
  /** 시각 표시 (예: "18:42") */
  time?: string;
  /** 본문 텍스트 — \n\n 으로 단락 구분 */
  text: string;
  /** 선택지 목록. isEnd가 true면 없어도 됨 */
  choices?: EventChoice[];
  /** true이면 이 장면이 마지막 — 종료 버튼이 표시됨 */
  isEnd?: boolean;
  /** isEnd: true 일 때 종료 버튼의 텍스트 (기본: '다음 날로 넘어간다') */
  endLabel?: string;
  /** 이 장면 도달 시 설정할 플래그 (선택지 없이 자동 적용) */
  arrivalFlags?: Record<string, boolean>;
  /**
   * 자유 텍스트 입력 필드. 설정 시 choices 대신 입력창이 표시됨.
   * 입력값에 keywords 중 하나라도 포함되면 matchScene으로, 아니면 noMatchScene으로 분기.
   */
  textInput?: {
    placeholder?: string;
    keywords: string[];
    matchScene: string;
    noMatchScene: string;
  };
  /**
   * 화면 전체를 검은 오버레이로 덮고 텍스트만 타이핑 효과로 표시.
   * choices는 타이핑 완료 후에 나타남.
   */
  isBlackout?: boolean;
  /**
   * isBlackout: true 와 함께 사용. 텍스트를 흐리게 표시 (구조 장면 등).
   */
  blackoutDim?: boolean;
  /** isBlackout 씬에서 텍스트를 서서히 흐릿하게 blur-out시키는 연출 */
  textBlur?: boolean;
  /** isBlackout 씬에서 타이핑 완료 후 자동으로 첫 번째 choice로 이동. ms 단위 (기본 1000). */
  autoNext?: boolean;
  autoNextDelay?: number;
  /** 타이핑을 느리게 (1자/500ms). 발소리 등 연출용. */
  slowTyping?: boolean;
  /** 타이틀 스타일 텍스트 (큰 폰트, 볼드). */
  textStyle?: 'title' | 'squeak' | 'corrupted' | 'normal' | 'plain';
  /** 일반(비블랙아웃) 씬에서 텍스트에 memwipe-glitch 색상+애니메이션 적용 (특정 대사 검열 연출용) */
  glitchText?: boolean;
  /** 일반 씬에서 이 인덱스 이상인 단락부터 글리치 클래스 적용 (하단으로 갈수록 오염되는 연출용) */
  glitchFromParagraph?: number;
  /** 블랙아웃 씬에서 타이핑 완료와 무관하게 N ms 후 강제 다음 씬으로 전환 (오염 텍스트 페이드아웃 연출용) */
  hardTimeout?: number;
  /** N ms 후 글리치 오버레이를 페이드인 (plain 텍스트 위에 오염 레이어가 덮이는 연출용) */
  glitchAfterMs?: number;
  screenFlicker?: boolean;
  /** 봉인 실패 연출: 빨간 에러 박스가 화면을 뒤덮은 뒤 게임 전체 초기화 */
  errorSpread?: boolean;
  /** 합체 엔딩: 빛 확산 → ON AIR 깜빡임 → 브라우저 강제종료 */
  lightEnding?: boolean;
  /** 베어냄 엔딩: 직사각형 텍스트 갈라짐 → 고마워 → 사랑해 reveal */
  cutEnding?: boolean;
  /** ev-blackout__text에 인라인으로 덮어쓸 text-align. dim 씬 기본값(center) 재정의용. */
  textAlign?: 'justify' | 'center' | 'left';
  /**
   * 화면을 표시하지 않고 조건에 따라 즉시 다음 장면으로 이동.
   * ifHasItems: 인벤토리에 아이템이 모두 있어야 then, 아니면 else.
   * ifFlagSet: 이벤트 내부 플래그가 true이면 then, 아니면 else.
   * 두 조건이 모두 있으면 AND 조건 (둘 다 충족해야 then).
   */
  autoRoute?: { ifHasItems?: string[]; ifFlagSet?: string; chance?: number; then: string; else: string };
  /**
   * 귀가 걷기 연출 모드. 기존 UI를 모두 숨기고 단어 스트립+배경 텍스트를 표시.
   * 각 step의 마지막 단어(style:'action')가 점멸하며 클릭 시 다음 step으로 진행.
   * 모든 step 완료 후 next 장면으로 이동.
   */
  walkMode?: {
    steps: Array<{
      words: Array<{ text: string; style?: 'location' | 'action' }>;
      scenery?: string;
    }>;
    next: string;
    /** 각 step을 자동으로 진행할 간격 (ms). 설정 시 클릭 불필요. */
    autoStepDelay?: number;
    /** true이면 step이 지날수록 이전 단어가 사라지지 않고 누적됨. */
    accumulate?: boolean;
  };
}

/** 하나의 일일 이벤트 */
export interface DayEvent {
  id: string;
  title: string;
  scenes: Record<string, EventScene>;
  startScene: string;
  /**
   * true이면 "아침 도착" 이벤트로 취급됨.
   * 이벤트 완료 시 퇴근(day 진행)하지 않고 그 날 업무로 돌아간다.
   */
  isArrivalEvent?: boolean;
}

// ─── 메신저 ──────────────────────────────────────────────────

export interface NpcChatStep {
  role: 'npc';
  content: string;
  /** 이 메시지가 표시될 때 설정할 플래그 */
  setFlags?: Record<string, boolean>;
  /** 클릭 시 자료보관소에서 해당 문서를 바로 여는 링크 */
  docLink?: { docId: string; label: string };
  /** 설정 시, 지정한 step에서 지정한 choice를 선택했을 때만 표시. 조건 미충족 시 자동 건너뜀. */
  showIfChoice?: { step: number; choice: number };
  /** 설정 시, 목록 중 하나라도 충족해야 표시. 조건 미충족 시 자동 건너뜀. */
  showIfAnyChoice?: Array<{ step: number; choice: number }>;
}

export interface PlayerChatStep {
  role: 'player';
  choices: Array<{
    text: string;
    setFlags?: Record<string, boolean>;
  }>;
  /**
   * 설정 시, 목록 중 하나라도 충족해야 이 선택지를 표시.
   * 조건 미충족 시 자동으로 건너뜀.
   */
  showIfAnyChoice?: Array<{ step: number; choice: number }>;
}

export type ChatScriptStep = NpcChatStep | PlayerChatStep;

export interface MessengerChat extends VisibilityCondition {
  id: string;
  /** 연결된 직원 ID */
  npcId: string;
  npcName: string;
  script: ChatScriptStep[];
}

// ─── 단체 대화방 (단톡) ──────────────────────────────────────────
// 1:1 메신저와 달리 여러 발신자가 등장하며, 창을 열지 않아도
// 시간에 따라 자동으로 새 메시지가 쌓인다 (App.tsx의 전역 타이머로 진행).

export interface GroupChatNpcStep {
  role: 'npc';
  /** 발신자 이름 (메시지마다 다를 수 있음) */
  speaker: string;
  content: string;
}

export interface GroupChatPlayerStep {
  role: 'player';
  choices: Array<{
    text: string;
    setFlags?: Record<string, boolean>;
  }>;
}

export type GroupChatStep = GroupChatNpcStep | GroupChatPlayerStep;

export interface GroupChat extends VisibilityCondition {
  id: string;
  /** 대화방 이름 (예: 전체 요원 단체 대화방) */
  title: string;
  script: GroupChatStep[];
}

// ─── 앱 상태 ──────────────────────────────────────────────────

/** 현재 선택된 사이드바 메뉴 */
export type MenuSection =
  | 'home'
  | 'mail'
  | 'cases'
  | 'notices'
  | 'forms'
  | 'archive'
  | 'personnel'
  | 'approval'
  | 'equipment';

/** 플래그 맵 — 키: 플래그명, 값: 활성 여부 */
export type Flags = Record<string, boolean>;

/** localStorage에 저장되는 게임 상태 */
export interface GameState {
  /** 현재 로그인된 계정 ID (기본값: 'acc-player') */
  currentAccountId: string;
  currentDay: number;
  /** 읽은 메일 ID 목록 */
  readMails: string[];
  /** 읽은 사건 ID 목록 */
  readCases: string[];
  /** 읽은 문서 ID 목록 */
  readDocuments: string[];
  /** 해금된 항목 ID 목록 (폐기 자료 등에서 사용) */
  unlockedItems: string[];
  /** 게임 플래그 상태 */
  flags: Flags;
  /** 플레이어가 변경한 사건 상태 (caseId → 현재 상태) */
  caseStatuses: Record<string, CaseStatus>;
  /** 사건별 경과 기록 */
  caseNotes: Record<string, CaseNote[]>;
  /** 확인한 긴급호출 알림 (배너 닫기) */
  acknowledgedAlerts: string[];
  /** 제출 완료된 양식 ID 목록 */
  submittedForms: string[];
  /** 메신저 대화 진행 단계 (chatId → 처리된 스텝 수) */
  chatProgress: Record<string, number>;
  /** 플레이어가 선택한 선택지 (chatId → {스텝인덱스: 선택지인덱스}) */
  chatChoices: Record<string, Record<number, number>>;
  /** 결재 서류 처리 상태 (문서 ID → 상태, 미존재 시 미결재) */
  approvalStatuses: Record<string, ApprovalStatus>;
  /** 결재 시 남긴 의견 (문서 ID → 의견 텍스트) */
  approvalNotes: Record<string, string>;
  /** 메일 답장 (메일 ID → 발송한 답장 텍스트) */
  mailReplies: Record<string, string>;
  /** 오염 문서로 신고 처리한 문서 ID 목록 */
  reportedDocuments: string[];
  /** 플레이어 보유 장비 ID 목록 (인트라넷 장비신청 및 이벤트 지급 포함) */
  inventory: string[];
  /** 게임 중 동적으로 생성된 메일 (장비 지급 알림 등) */
  dynamicMails: Mail[];
}
