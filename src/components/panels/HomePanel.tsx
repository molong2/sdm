import { useState } from 'react';
import { notices } from '../../data/notices';
import { mails } from '../../data/mails';
import { submittableForms } from '../../data/forms';
import { approvals } from '../../data/approvals';
import { messengerChats } from '../../data/messenger';
import { useGame } from '../../context/GameContext';
import { getDateForDay } from '../../utils/date';
import type { Notice } from '../../types';

// ============================================================
// 홈 (대시보드) 패널
// ============================================================

interface DynamicAlert {
  id: string;
  type: 'info' | 'warning' | 'system';
  message: string;
}

export function HomePanel() {
  const { gameState, isVisible, getApprovalStatus } = useGame();
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const visibleNotices  = [...notices.filter(isVisible)].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const rank = (p: string) => p === 'urgent' ? 2 : p === 'important' ? 1 : 0;
    if (rank(a.priority) !== rank(b.priority)) return rank(b.priority) - rank(a.priority);
    return b.date.localeCompare(a.date);
  });

  // 신규 알림 — 고정된 문구가 아니라 실제 상태(읍지 않은 메일, 결재, 메신저 등)를 그대로 반영
  const unreadMailCount = mails.filter(
    m => isVisible(m) && !gameState.readMails.includes(m.id)
  ).length;
  const pendingFormCount = submittableForms.filter(
    f => isVisible(f) && !gameState.submittedForms.includes(f.id)
  ).length;
  const pendingApprovalCount = approvals.filter(
    a => isVisible(a) && getApprovalStatus(a.id) === 'pending'
  ).length;
  const newChatCount = messengerChats.filter(c => {
    if (!isVisible(c)) return false;
    const progress = gameState.chatProgress[c.id] ?? 0;
    return progress === 0; // 한 번도 열어보지 않은 대화
  }).length;

  const dynamicAlerts: DynamicAlert[] = [
    { id: 'alert-login', type: 'system', message: '내부망에 성공적으로 접속하였습니다.' },
  ];
  if (unreadMailCount > 0) {
    dynamicAlerts.push({
      id: 'alert-mail', type: 'info',
      message: `읽지 않은 메일이 ${unreadMailCount}건 있습니다.`,
    });
  }
  if (newChatCount > 0) {
    dynamicAlerts.push({
      id: 'alert-chat', type: 'info',
      message: `메신저로 새 연락이 ${newChatCount}건 도착했습니다.`,
    });
  }
  if (pendingApprovalCount > 0) {
    dynamicAlerts.push({
      id: 'alert-approval', type: 'warning',
      message: `결재 대기 중인 서류가 ${pendingApprovalCount}건 있습니다.`,
    });
  }
  if (pendingFormCount > 0) {
    dynamicAlerts.push({
      id: 'alert-form', type: 'warning',
      message: `제출하지 않은 서류가 ${pendingFormCount}건 있습니다.`,
    });
  }

  const dotClass: Record<string, string> = {
    info: 'alert-row__dot', warning: 'alert-row__dot alert-row__dot--warning',
    system: 'alert-row__dot alert-row__dot--system',
  };

  /* ── 공지 상세 모달 ──────────────────────────────────────── */
  if (selectedNotice) {
    return (
      <div className="panel">
        <div className="sec-hd">
          <span className="sec-hd__mark">■</span>
          <span className="sec-hd__title">홈 — 공지사항 상세</span>
        </div>
        <div className="back-bar">
          <button className="back-btn" onClick={() => setSelectedNotice(null)}>◀ 대시보드로</button>
        </div>
        <div className="detail-body">
          <div className="det-title">{selectedNotice.title}</div>
          <div className="det-meta">
            <span className="det-meta__lbl">구분</span>
            <span className="det-meta__val">
              <span className={`badge badge--${selectedNotice.priority}`}>
                {selectedNotice.priority === 'urgent' ? '긴급' : selectedNotice.priority === 'important' ? '중요' : '일반'}
              </span>
            </span>
            <span className="det-meta__lbl">작성자</span>
            <span className="det-meta__val">{selectedNotice.author}</span>
            <span className="det-meta__lbl">작성일</span>
            <span className="det-meta__val" style={{ fontFamily: 'var(--mono)' }}>
              {selectedNotice.date.replace(/-/g, '.')}
            </span>
          </div>
          <div className="det-section-title">내용</div>
          <div className="det-content">{selectedNotice.content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="sec-hd">
        <span className="sec-hd__mark">■</span>
        <span className="sec-hd__title">홈 — 대시보드</span>
        <span className="sec-hd__info">{getDateForDay(gameState.currentDay)}</span>
      </div>

      <div className="home-body">
        {/* 공지사항 */}
        <div className="hw">
          <div className="hw__hd">
            <span className="hw__hd-mark">■</span>
            <span className="hw__hd-title">공지사항</span>
            <span className="hw__hd-cnt">총 {visibleNotices.length}건</span>
          </div>
          <div className="hw__body">
            <div className="notice-row" style={{ background: 'var(--bg-th)', fontWeight: 700, fontSize: 11, color: 'var(--text-2)' }}>
              <div className="notice-row__num">번호</div>
              <div className="notice-row__badge">구분</div>
              <div className="notice-row__title" style={{ cursor: 'default' }}>제목</div>
              <div className="notice-row__author">작성자</div>
              <div className="notice-row__date">날짜</div>
            </div>
            {visibleNotices.length === 0 ? (
              <div className="home-empty">공지사항이 없습니다.</div>
            ) : (
              visibleNotices.map((n, i) => (
                <div key={n.id} className="notice-row" onClick={() => setSelectedNotice(n)}>
                  <div className="notice-row__num">{visibleNotices.length - i}</div>
                  <div className="notice-row__badge">
                    <span className={`badge badge--${n.priority}`}>
                      {n.priority === 'urgent' ? '긴급' : n.priority === 'important' ? '중요' : '일반'}
                    </span>
                  </div>
                  <div className="notice-row__title">
                    {n.pinned && <span style={{ color: 'var(--blue)', marginRight: 4 }}>▶</span>}
                    {n.title}
                  </div>
                  <div className="notice-row__author">{n.author}</div>
                  <div className="notice-row__date">{n.date.replace(/-/g, '.')}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 신규 알림 */}
        <div className="hw">
          <div className="hw__hd">
            <span className="hw__hd-mark">■</span>
            <span className="hw__hd-title">신규 알림</span>
            <span className="hw__hd-cnt">{dynamicAlerts.length}건</span>
          </div>
          <div className="hw__body">
            {dynamicAlerts.length === 0 ? (
              <div className="home-empty">새 알림이 없습니다.</div>
            ) : (
              dynamicAlerts.map(a => (
                <div key={a.id} className="alert-row">
                  <span className={dotClass[a.type] ?? 'alert-row__dot'} />
                  <span className="alert-row__msg">{a.message}</span>
                  <span className="badge badge--system" style={{ flexShrink: 0 }}>{a.type.toUpperCase()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
