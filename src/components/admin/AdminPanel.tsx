import { useGame } from '../../context/GameContext';

// ============================================================
// 관리자 패널 (개발용)
// 단축키: Ctrl + Shift + A 로 열기/닫기
// ============================================================

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const { gameState, setCurrentDay, setFlag, resetSave, resetDayData } = useGame();

  function handleReset() {
    if (window.confirm('저장 데이터를 전체 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      resetSave();
    }
  }

  function handleResetDay() {
    const day = gameState.currentDay;
    if (window.confirm(`${day}일차 데이터만 초기화하시겠습니까?\n(해당 일차에 새로 등장하는 메일/사건/문서/메신저/단톡/결재서류/제출서류 및 관련 플래그만 초기화되며, 이전 일차 진행 상황은 유지됩니다.)`)) {
      resetDayData(day);
    }
  }

  return (
    <div className="admin-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-panel">
        {/* 헤더 */}
        <div className="admin-panel__head">
          <span className="admin-panel__title">◈ 관리자 패널 [개발용]</span>
          <button className="admin-panel__close" onClick={onClose}>✕</button>
        </div>

        <div className="admin-panel__body">
          {/* 일차 제어 */}
          <div>
            <div className="admin-sec__title">현재 일차</div>
            <div className="admin-day">
              <button
                className="admin-btn"
                onClick={() => setCurrentDay(gameState.currentDay - 1)}
                disabled={gameState.currentDay <= 1}
              >
                ─
              </button>
              <span className="admin-day__val">Day {gameState.currentDay}</span>
              <button
                className="admin-btn"
                onClick={() => setCurrentDay(gameState.currentDay + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* 플래그 제어 */}
          <div>
            <div className="admin-sec__title">플래그 상태</div>
            {Object.entries(gameState.flags).map(([key, value]) => (
              <div key={key} className="admin-flag-row">
                <span className="admin-flag-name">{key}</span>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setFlag(key, e.target.checked)}
                  />
                  <span className="toggle__track" />
                  <span className="toggle__thumb" />
                </label>
              </div>
            ))}
          </div>

          {/* 읽음 상태 요약 */}
          <div>
            <div className="admin-sec__title">읽음 상태</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>읽은 메일: {gameState.readMails.length}건</span>
              <span>읽은 사건: {gameState.readCases.length}건</span>
              <span>읽은 문서: {gameState.readDocuments.length}건</span>
            </div>
          </div>

          {/* 저장 초기화 */}
          <div>
            <div className="admin-sec__title">저장 관리</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button className="admin-btn" onClick={handleResetDay}>
                {gameState.currentDay}일차 데이터만 초기화
              </button>
              <button className="admin-btn admin-btn--danger" onClick={handleReset}>
                전체 초기화
              </button>
            </div>
          </div>

          <div className="admin-warn">
            이 패널은 개발/테스트 전용입니다.<br />
            단축키: Ctrl + Shift + A
          </div>
        </div>
      </div>
    </div>
  );
}
