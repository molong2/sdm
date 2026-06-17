import { useGame } from '../../context/GameContext';

// ============================================================
// 환경설정 패널
// ============================================================

export function SettingsPanel() {
  const { gameState, resetSave } = useGame();

  function handleReset() {
    if (window.confirm('저장 데이터를 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      resetSave();
    }
  }

  return (
    <div className="panel">
      <div className="sec-hd">
        <span className="sec-hd__mark">■</span>
        <span className="sec-hd__title">환경설정</span>
      </div>

      <div className="settings-body">
        {/* 플레이 현황 */}
        <div className="settings-block">
          <div className="settings-block__hd">플레이 현황</div>
          <div className="settings-row">
            <span className="settings-row__lbl">현재 일차</span>
            <span className="settings-row__val">Day {gameState.currentDay}</span>
          </div>
          <div className="settings-row">
            <span className="settings-row__lbl">읽은 메일</span>
            <span className="settings-row__val">{gameState.readMails.length}건</span>
          </div>
          <div className="settings-row">
            <span className="settings-row__lbl">확인한 사건</span>
            <span className="settings-row__val">{gameState.readCases.length}건</span>
          </div>
          <div className="settings-row">
            <span className="settings-row__lbl">열람한 문서</span>
            <span className="settings-row__val">{gameState.readDocuments.length}건</span>
          </div>
        </div>

        {/* 플래그 상태 */}
        <div className="settings-block">
          <div className="settings-block__hd">플래그 상태</div>
          {Object.entries(gameState.flags).map(([key, value]) => (
            <div key={key} className="settings-row">
              <div>
                <div className="settings-row__lbl" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{key}</div>
              </div>
              <span className="settings-row__val" style={{ color: value ? 'var(--green)' : 'var(--text-3)' }}>
                {value ? 'TRUE' : 'FALSE'}
              </span>
            </div>
          ))}
        </div>

        {/* 시스템 정보 */}
        <div className="settings-block">
          <div className="settings-block__hd">시스템 정보</div>
          <div className="settings-row">
            <span className="settings-row__lbl">저장 방식</span>
            <span className="settings-row__val">localStorage (자동)</span>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row__lbl">관리자 패널</div>
              <div className="settings-row__desc">개발용 — 일차 조정, 플래그 제어, 데이터 초기화</div>
            </div>
            <span className="settings-row__val" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>Ctrl+Shift+A</span>
          </div>
        </div>

        {/* 저장 관리 */}
        <div className="settings-block">
          <div className="settings-block__hd">저장 관리</div>
          <div className="settings-row">
            <div>
              <div className="settings-row__lbl">저장 데이터 초기화</div>
              <div className="settings-row__desc">일차, 읽음 상태, 플래그가 모두 초기화됩니다.</div>
            </div>
            <button className="danger-btn" onClick={handleReset}>초기화</button>
          </div>
          <div className="settings-note">
            ※ 저장 데이터는 이 브라우저에만 존재합니다. 브라우저 데이터 삭제 시 함께 제거됩니다.
          </div>
        </div>
      </div>
    </div>
  );
}
