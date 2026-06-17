import { useState } from 'react';
import { approvals } from '../../data/approvals';
import { useGame } from '../../context/GameContext';
import type { ApprovalDocument, ApprovalStatus } from '../../types';

// ============================================================
// 결재 서류 패널 — 팀장(플레이어) 결재 대기함
// ============================================================

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending:  '미결재',
  approved: '결재',
  held:     '보류',
  rejected: '반려',
};

const STATUS_CSS: Record<ApprovalStatus, string> = {
  pending:  'appr-pending',
  approved: 'appr-approved',
  held:     'appr-held',
  rejected: 'appr-rejected',
};

export function ApprovalPanel() {
  const { gameState, isVisible, getApprovalStatus, setApprovalDecision, setFlag } = useGame();
  const [selected, setSelected] = useState<ApprovalDocument | null>(null);
  const [note, setNote] = useState('');

  const visible = approvals.filter(isVisible);
  const pendingCount = visible.filter(a => getApprovalStatus(a.id) === 'pending').length;

  function handleSelect(doc: ApprovalDocument) {
    setSelected(doc);
    setNote('');
    if (doc.onOpenFlags) {
      Object.entries(doc.onOpenFlags).forEach(([k, v]) => setFlag(k, v));
    }
  }

  function handleDecision(status: ApprovalStatus) {
    if (!selected) return;
    setApprovalDecision(selected.id, status, note.trim() || undefined);
    if (status === 'approved' && selected.onApprovedFlags) {
      Object.entries(selected.onApprovedFlags).forEach(([k, v]) => setFlag(k, v));
    }
    setSelected(null);
  }

  /* ── 상세 뷰 ─────────────────────────────────────────────── */
  if (selected) {
    const status = getApprovalStatus(selected.id);
    // 결재/반려는 확정 — 더 이상 상태 변경 불가. 보류는 추후 결재/반려로 확정 가능.
    const isFinal = status === 'approved' || status === 'rejected';
    const savedNote = gameState.approvalNotes[selected.id];

    return (
      <div className="panel">
        <div className="sec-hd">
          <span className="sec-hd__mark">■</span>
          <span className="sec-hd__title">결재 서류 — 상세</span>
        </div>
        <div className="back-bar">
          <button className="back-btn" onClick={() => setSelected(null)}>◀ 목록으로</button>
        </div>
        <div className="detail-body">
          <div className="det-subtitle">{selected.docNumber}</div>
          <div className="det-title">{selected.title}</div>
          <div className="det-meta">
            <span className="det-meta__lbl">신청자</span>
            <span className="det-meta__val">{selected.requester}</span>
            <span className="det-meta__lbl">구분</span>
            <span className="det-meta__val">{selected.category}</span>
            <span className="det-meta__lbl">신청일</span>
            <span className="det-meta__val" style={{ fontFamily: 'var(--mono)' }}>
              {selected.requestedDate.replace(/-/g, '.')}
            </span>
            <span className="det-meta__lbl">현재 상태</span>
            <span className="det-meta__val">
              <span className={`badge badge--${STATUS_CSS[status]}`}>{STATUS_LABEL[status]}</span>
            </span>
          </div>

          <div className="det-section-title">신청 내용</div>
          <div className="det-content">{selected.content}</div>

          {!isFinal ? (
            <div className="approval-action">
              <div className="det-section-title">
                {status === 'held' ? '결재 확정 (보류 해제)' : '결재 의견 (선택)'}
              </div>
              <textarea
                className="approval-action__textarea"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="필요 시 결재 의견 또는 보류·반려 사유를 입력하십시오."
                rows={3}
              />
              <div className="approval-action__btns">
                <button className="approval-btn approval-btn--approve" onClick={() => handleDecision('approved')}>
                  결재
                </button>
                {status !== 'held' && (
                  <button className="approval-btn approval-btn--hold" onClick={() => handleDecision('held')}>
                    보류
                  </button>
                )}
                <button className="approval-btn approval-btn--reject" onClick={() => handleDecision('rejected')}>
                  반려
                </button>
              </div>
            </div>
          ) : (
            <div className="approval-done-notice">
              이미 처리된 서류입니다. (<span className={`badge badge--${STATUS_CSS[status]}`}>{STATUS_LABEL[status]}</span>) 더 이상 상태를 변경할 수 없습니다.
              {savedNote && <div className="approval-done-notice__note">의견: {savedNote}</div>}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── 목록 뷰 ─────────────────────────────────────────────── */
  return (
    <div className="panel">
      <div className="sec-hd">
        <span className="sec-hd__mark">■</span>
        <span className="sec-hd__title">결재 서류</span>
        <span className="sec-hd__info">
          총 {visible.length}건
          {pendingCount > 0 && (
            <span className="sec-hd__info--alert" style={{ marginLeft: 8 }}>/ 미결재 {pendingCount}건</span>
          )}
        </span>
      </div>

      <div className="tbl-wrap">
        {visible.length === 0 ? (
          <div className="panel-empty">
            <div className="panel-empty__ico">▣</div>
            <div className="panel-empty__text">결재할 서류가 없습니다.</div>
          </div>
        ) : (
          <table className="tbl">
            <colgroup>
              <col style={{ width: 42 }} />
              <col style={{ width: 24 }} />
              <col style={{ width: 90 }} />
              <col />
              <col style={{ width: 130 }} />
              <col style={{ width: 70 }} />
              <col style={{ width: 76 }} />
            </colgroup>
            <thead>
              <tr>
                <th>번호</th>
                <th>●</th>
                <th>구분</th>
                <th style={{ textAlign: 'left', paddingLeft: 10 }}>제목</th>
                <th>신청자</th>
                <th>상태</th>
                <th>신청일</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((doc, i) => {
                const status = getApprovalStatus(doc.id);
                const needsAction = status === 'pending';
                return (
                  <tr
                    key={doc.id}
                    className={needsAction ? 'tbl-row--unread' : ''}
                    onClick={() => handleSelect(doc)}
                  >
                    <td className="tbl-col-num">{visible.length - i}</td>
                    <td className="tbl-col-dot">{needsAction && <span className="unread-dot" />}</td>
                    <td className="tbl-col-cat">{doc.category}</td>
                    <td style={{ paddingLeft: 10 }}>{doc.title}</td>
                    <td style={{ textAlign: 'center', color: 'var(--text-2)' }}>{doc.requester}</td>
                    <td className="tbl-col-stat">
                      <span className={`badge badge--${STATUS_CSS[status]}`}>{STATUS_LABEL[status]}</span>
                    </td>
                    <td className="tbl-col-date">{doc.requestedDate.replace(/-/g, '.').slice(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
