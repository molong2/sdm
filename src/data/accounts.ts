// ============================================================
// 내부망 로그인 계정 목록
// 게임 내에서 다른 요원의 아이디/비밀번호를 입수하면
// 해당 계정으로 접속해 ownerAccount 가 지정된 자료를 열람할 수 있습니다.
// ============================================================

export interface AgentAccount {
  /** 계정 고유 ID */
  id: string;
  /** 로그인 아이디 (사번 형식) */
  username: string;
  /** 로그인 비밀번호 */
  password: string;
  /** employees.ts 의 id 참조 */
  employeeRef: string;
  /** 화면 표시 이름 */
  displayName: string;
  department: string;
  rank: string;
}

export const accounts: AgentAccount[] = [
  {
    id: 'acc-player',
    username: 'A-2019-0047',
    password: 'daosfuqwi1#26',
    employeeRef: 'emp-000',
    displayName: '본인 (플레이어)',
    department: '현무1팀',
    rank: '6급',
  },
  // ── 게임 진행 중 입수한 계정을 여기에 추가하세요 ─────────────
  // {
  //   id: 'acc-example',
  //   username: 'B-2021-0089',
  //   password: '스토리에서 입수한 비밀번호',
  //   employeeRef: 'emp-???',
  //   displayName: '○○○',
  //   department: '조사1팀',
  //   rank: '5급',
  // },
];

/** 아이디 + 비밀번호로 계정을 찾아 반환. 실패 시 null. */
export function findAccount(username: string, password: string): AgentAccount | null {
  return accounts.find(a => a.username === username && a.password === password) ?? null;
}
