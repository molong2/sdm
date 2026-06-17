// ============================================================
// 엔딩 화면 — 정부 인트라넷 "세션 강제 종료" 스타일
// ============================================================

export type EndingType = 'first' | 'true';

interface Props {
  type: EndingType;
  onRestart: () => void;
}

const ENDING_DATA: Record<EndingType, {
  code: string;
  alert: string;
  heading: string;
  body: string[];
  detail: [string, string][];
  restartLabel: string;
  note: string;
}> = {
  first: {
    code: 'SEC-ERR-0047',
    alert: '보안 위반 — 세션 강제 종료',
    heading: '접속 세션이 비정상 종료되었습니다.',
    body: [
      '귀하의 접속 세션에서 허가되지 않은 기밀 등급 자료 접근이 탐지되었습니다.',
      '보안 관리 규정 제7조 2항에 의거, 본 세션은 즉시 강제 종료되었습니다. 관련 접속 기록 및 열람 이력은 보안 감사팀으로 이관됩니다.',
    ],
    detail: [
      ['계 정', 'taesan@dmgmt.go.kr'],
      ['종료 일시', '2026. 06. 18.'],
      ['종료 사유', '[기밀 — 열람 불가]'],
      ['처 리', '세션 초기화 및 이력 보존'],
    ],
    restartLabel: '세션 재접속',
    note: '재접속 시 해당 접속 세션은 초기화됩니다.\n동일 사안이 반복될 경우 계정 접근 권한이 정지될 수 있습니다.',
  },
  true: {
    code: 'END-FINAL',
    alert: '최종 엔딩',
    heading: '모든 진실이 드러났습니다.',
    body: ['[진짜 엔딩 내용 미구현]'],
    detail: [],
    restartLabel: '처음으로',
    note: '',
  },
};

export function EndingScreen({ type, onRestart }: Props) {
  const d = ENDING_DATA[type];

  return (
    <div className="ending-overlay">
      <div className="ending-panel">

        {/* 정부 헤더 */}
        <div className="ending-gov-header">
          <div className="ending-gov-header__emblem">
            <img src="/emblem.svg" alt="" width={22} height={22}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <div>
            <div className="ending-gov-header__org">초자연재난관리국</div>
            <div className="ending-gov-header__sys">내부 업무망 보안시스템 / DMGMT-INTRA-SEC</div>
          </div>
          <div className="ending-gov-header__code">{d.code}</div>
        </div>

        {/* 경보 배너 */}
        <div className="ending-alert-bar">
          <span className="ending-alert-bar__ico">▶</span>
          {d.alert}
        </div>

        {/* 본문 */}
        <div className="ending-body">
          <div className="ending-sec-title">■ {d.heading}</div>

          {d.body.map((para, i) => (
            <p key={i} className="ending-para">{para}</p>
          ))}

          {d.detail.length > 0 && (
            <div className="ending-detail">
              {d.detail.map(([lbl, val]) => (
                <div key={lbl} className="ending-detail__row">
                  <span className="ending-detail__lbl">{lbl}</span>
                  <span className="ending-detail__sep">:</span>
                  <span className="ending-detail__val">{val}</span>
                </div>
              ))}
            </div>
          )}

          {d.note && (
            <div className="ending-notice">
              {d.note.split('\n').map((line, i) => (
                <span key={i}>{line}{i < d.note.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
          )}
        </div>

        {/* 재시작 버튼 */}
        <div className="ending-footer">
          <button className="ending-restart-btn" onClick={onRestart}>
            {d.restartLabel}
          </button>
        </div>

      </div>
    </div>
  );
}
