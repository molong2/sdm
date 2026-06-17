import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { BASE_DATE } from '../data/config';

// ============================================================
// 비밀번호 변경 경고 모달
// 최종 변경일은 고정값이며, 게임 내 현재 날짜와의 차이를 계산해 표시한다.
// ============================================================

interface Props {
  onChangeLater: () => void;
}

/** 비밀번호 최종 변경일 (고정값) */
const LAST_CHANGED_DATE = new Date(2022, 2, 7); // 2022. 03. 07.

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}. ${m}. ${dd}.`;
}

export function PasswordWarningModal({ onChangeLater }: Props) {
  const { gameState } = useGame();
  const [showError, setShowError] = useState(false);

  // 게임 내 현재 날짜 = BASE_DATE + (currentDay - 1)일
  const currentDate = new Date(BASE_DATE.getTime());
  currentDate.setDate(currentDate.getDate() + (gameState.currentDay - 1));

  const daysElapsed = Math.max(
    0,
    Math.round((currentDate.getTime() - LAST_CHANGED_DATE.getTime()) / 86400000)
  );

  return (
    <div className="pwwarn-overlay">
      <div className="pwwarn-dialog">
        {/* 타이틀 바 */}
        <div className="pwwarn-titlebar">
          <span className="pwwarn-titlebar__icon">🔒</span>
          <span className="pwwarn-titlebar__text">보안 알림 — 비밀번호 변경 안내</span>
        </div>

        {/* 본문 */}
        <div className="pwwarn-body">
          <div className="pwwarn-warn-row">
            <span className="pwwarn-warn-ico">⚠</span>
            <div>
              <div className="pwwarn-main-msg">
                귀하의 비밀번호가 변경된 지 <strong>{daysElapsed}일</strong>이 경과하였습니다.
              </div>
              <div className="pwwarn-sub-msg">
                개인정보 보호 및 정보보안 지침(행안부 고시 제2021-35호)에 따라
                주기적인 비밀번호 변경이 권고됩니다.
              </div>
            </div>
          </div>

          <table className="pwwarn-info-tbl">
            <tbody>
              <tr>
                <th>최종 변경일</th>
                <td>{formatDate(LAST_CHANGED_DATE)}</td>
              </tr>
              <tr>
                <th>경과 일수</th>
                <td className="pwwarn-days">{daysElapsed}일 경과</td>
              </tr>
              <tr>
                <th>권고 변경 주기</th>
                <td>60일</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 버튼 */}
        <div className="pwwarn-footer">
          <button className="pwwarn-btn pwwarn-btn--primary" onClick={() => setShowError(true)}>
            지금 변경
          </button>
          <button className="pwwarn-btn pwwarn-btn--secondary" onClick={onChangeLater}>
            다음에 변경
          </button>
        </div>
      </div>

      {/* 변경 불가 오류 팝업 */}
      {showError && (
        <div className="pwwarn-error-overlay">
          <div className="pwwarn-error-dialog">
            <div className="pwwarn-error-titlebar">
              <span className="pwwarn-error-titlebar__icon">⚠</span>
              <span>오류</span>
            </div>
            <div className="pwwarn-error-body">
              현재는 비밀번호를 변경할 수 없습니다.
            </div>
            <div className="pwwarn-error-footer">
              <button className="pwwarn-btn pwwarn-btn--primary" onClick={() => setShowError(false)}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
