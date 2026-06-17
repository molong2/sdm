import { Bell, LogOut } from 'lucide-react';
import { employees } from '../../data/employees';
import { mails } from '../../data/mails';
import { accounts } from '../../data/accounts';
import { useGame } from '../../context/GameContext';
import { getDateForDay } from '../../utils/date';

interface HeaderProps {
  onClockOut: () => void;
  onLogout: () => void;
}

export function Header({ onClockOut, onLogout }: HeaderProps) {
  const { gameState, isVisible, canClockOut } = useGame();

  const unreadCount = mails.filter(
    m => isVisible(m) && !gameState.readMails.includes(m.id)
  ).length;

  const dateStr = getDateForDay(gameState.currentDay);

  // 현재 로그인 계정 정보
  const currentAccount = accounts.find(a => a.id === gameState.currentAccountId);
  const player = employees.find(e => e.id === (currentAccount?.employeeRef ?? 'emp-000'))!;
  const isPlayerAccount = gameState.currentAccountId === 'acc-player';

  return (
    <header className="header">
      {/* 기관 정보 */}
      <div className="header__org">
        <div className="header__emblem">
          <img src="/logo.png" alt="로고" className="header__logo-img" />
        </div>
        <div>
          <div className="header__name-ko">초자연재난관리국</div>
          <div className="header__name-en">Supernatural Disaster Management Bureau — Intranet</div>
        </div>
      </div>

      {/* 우측 영역 */}
      <div className="header__userbox">

        {/* 외근신청 / 퇴근 버튼 (플레이어 계정일 때만) */}
        {isPlayerAccount && (
          <button
            className={`clockout-btn${canClockOut ? ' clockout-btn--ready' : ''}`}
            onClick={onClockOut}
            title={canClockOut ? '오늘 업무를 마치고 퇴근합니다.' : '외근신청서를 제출합니다.'}
          >
            {canClockOut ? '퇴 근' : '외근신청'}
          </button>
        )}

        {/* 미읽음 알림 */}
        {unreadCount > 0 && (
          <span className="header__unread">
            <Bell size={12} strokeWidth={2} />
            {unreadCount}
          </span>
        )}

        {/* 직원 정보 */}
        <div className="header__userinfo">
          {!isPlayerAccount && (
            <div className="header__uinfo-cell header__uinfo-cell--alert">
              <span className="header__uinfo-label">접속 계정</span>
              <span className="header__uinfo-value" style={{ color: '#ffb060' }}>
                {currentAccount?.username}
              </span>
            </div>
          )}
          <div className="header__uinfo-cell">
            <span className="header__uinfo-label">요원명</span>
            <span className="header__uinfo-value">{player.name}</span>
          </div>
          <div className="header__uinfo-cell">
            <span className="header__uinfo-label">소속</span>
            <span className="header__uinfo-value">{player.department}</span>
          </div>
          <div className="header__uinfo-cell header__day-cell">
            <span className="header__uinfo-label">접속일</span>
            <span className="header__day-val">{dateStr}</span>
          </div>
        </div>

        {/* 로그아웃 */}
        <button className="logout-btn" onClick={onLogout} title="로그아웃">
          <LogOut size={14} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
