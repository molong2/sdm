import { useState } from 'react';
import { notices } from '../../data/notices';
import { useGame } from '../../context/GameContext';
import type { Notice } from '../../types';

// ============================================================
// 공지사항 패널
// ============================================================

export function NoticesPanel() {
  const { isVisible } = useGame();
  const [selected, setSelected] = useState<Notice | null>(null);

  const visible = [...notices.filter(isVisible)].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const rank = (p: string) => p === 'urgent' ? 2 : p === 'important' ? 1 : 0;
    if (rank(a.priority) !== rank(b.priority)) return rank(b.priority) - rank(a.priority);
    return b.date.localeCompare(a.date);
  });

  /* ── 상세 뷰 ─────────────────────────────────────────────── */
  if (selected) {
    return (
      <div className="panel">
        <div className="sec-hd">
          <span className="sec-hd__mark">■</span>
          <span className="sec-hd__title">공지사항 — 상세</span>
        </div>
        <div className="back-bar">
          <button className="back-btn" onClick={() => setSelected(null)}>◀ 목록으로</button>
        </div>
        <div className="detail-body">
          <div className="det-title">{selected.title}</div>
          <div className="det-meta">
            <span className="det-meta__lbl">구분</span>
            <span className="det-meta__val">
              <span className={`badge badge--${selected.priority}`}>
                {selected.priority === 'urgent' ? '긴급' : selected.priority === 'important' ? '중요' : '일반'}
              </span>
            </span>
            <span className="det-meta__lbl">작성자</span>
            <span className="det-meta__val">{selected.author}</span>
            <span className="det-meta__lbl">작성일</span>
            <span className="det-meta__val" style={{ fontFamily: 'var(--mono)' }}>
              {selected.date.replace(/-/g, '.')}
            </span>
          </div>
          <div className="det-section-title">내용</div>
          <div className="det-content">{selected.content}</div>
        </div>
      </div>
    );
  }

  /* ── 목록 뷰 ─────────────────────────────────────────────── */
  return (
    <div className="panel">
      <div className="sec-hd">
        <span className="sec-hd__mark">■</span>
        <span className="sec-hd__title">공지사항</span>
        <span className="sec-hd__info">총 {visible.length}건</span>
      </div>

      <div className="tbl-wrap">
        {visible.length === 0 ? (
          <div className="panel-empty">
            <div className="panel-empty__ico">□</div>
            <div className="panel-empty__text">공지사항이 없습니다.</div>
          </div>
        ) : (
          <table className="tbl">
            <colgroup>
              <col style={{ width: 42 }} />
              <col style={{ width: 52 }} />
              <col />
              <col style={{ width: 100 }} />
              <col style={{ width: 90 }} />
            </colgroup>
            <thead>
              <tr>
                <th>번호</th>
                <th>구분</th>
                <th style={{ textAlign: 'left', paddingLeft: 10 }}>제목</th>
                <th>작성자</th>
                <th>날짜</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((n, i) => (
                <tr key={n.id} onClick={() => setSelected(n)} style={{ cursor: 'pointer' }}>
                  <td className="tbl-col-num">{visible.length - i}</td>
                  <td className="tbl-col-stat">
                    <span className={`badge badge--${n.priority}`}>
                      {n.priority === 'urgent' ? '긴급' : n.priority === 'important' ? '중요' : '일반'}
                    </span>
                  </td>
                  <td style={{ paddingLeft: 10 }}>
                    {n.pinned && <span style={{ color: 'var(--blue)', marginRight: 5 }}>▶</span>}
                    {n.title}
                  </td>
                  <td style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)' }}>
                    {n.author}
                  </td>
                  <td className="tbl-col-date">{n.date.replace(/-/g, '.')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
