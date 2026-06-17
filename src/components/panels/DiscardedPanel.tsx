import { useState } from 'react';
import { discardedItems } from '../../data/discarded';
import { useGame } from '../../context/GameContext';
import type { DiscardedItem, DiscardedItemType } from '../../types';

// ============================================================
// 폐기 자료 패널
// ============================================================

const TYPE_LABEL: Record<DiscardedItemType, string> = {
  mail:      '메일',
  document:  '문서',
  case_file: '사건파일',
  media:     '미디어',
  other:     '기타',
};

export function DiscardedPanel() {
  const { isVisible } = useGame();
  const [selected, setSelected] = useState<DiscardedItem | null>(null);

  // ownerAccount / requiredFlags / unlockDay 조건을 모두 통과한 항목만 표시
  const listItems = discardedItems.filter(isVisible);
  const unlockedCount = listItems.length;

  function handleSelect(item: DiscardedItem) {
    // 잠긴 항목은 상세 불가
    if (!isVisible(item)) return;
    setSelected(item);
  }

  /* ── 상세 뷰 ─────────────────────────────────────────────── */
  if (selected && isVisible(selected)) {
    return (
      <div className="panel">
        <div className="sec-hd">
          <span className="sec-hd__mark">■</span>
          <span className="sec-hd__title">폐기 자료 — 자료 열람</span>
          <span className="sec-hd__info">
            <span className="badge badge--archived">{TYPE_LABEL[selected.type]}</span>
          </span>
        </div>
        <div className="back-bar">
          <button className="back-btn" onClick={() => setSelected(null)}>◀ 목록으로</button>
        </div>
        <div className="detail-body">
          <div className="det-title">{selected.title}</div>
          <div className="det-meta">
            <span className="det-meta__lbl">유형</span>
            <span className="det-meta__val">
              <span className="badge badge--archived">{TYPE_LABEL[selected.type]}</span>
            </span>
            <span className="det-meta__lbl">원본 일자</span>
            <span className="det-meta__val" style={{ fontFamily: 'var(--mono)' }}>
              {selected.originalDate.replace(/-/g, '.')}
            </span>
            <span className="det-meta__lbl">폐기 일자</span>
            <span className="det-meta__val" style={{ fontFamily: 'var(--mono)' }}>
              {selected.destroyedDate.replace(/-/g, '.')}
            </span>
            {selected.reason && (
              <>
                <span className="det-meta__lbl">폐기 사유</span>
                <span className="det-meta__val">{selected.reason}</span>
              </>
            )}
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
        <span className="sec-hd__title">폐기 자료</span>
        <span className="sec-hd__info">
          목록 {listItems.length}건 · 열람 가능 {unlockedCount}건
        </span>
      </div>

      <div className="tbl-wrap">
        {listItems.length === 0 ? (
          <div className="panel-empty">
            <div className="panel-empty__ico">⊗</div>
            <div className="panel-empty__text">폐기 자료 없음</div>
          </div>
        ) : (
          <table className="tbl">
            <colgroup>
              <col style={{ width: 42 }} />
              <col style={{ width: 66 }} />
              <col />
              <col style={{ width: 80 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 66 }} />
            </colgroup>
            <thead>
              <tr>
                <th>번호</th>
                <th>유형</th>
                <th style={{ textAlign: 'left', paddingLeft: 10 }}>제목</th>
                <th>원본 일자</th>
                <th>폐기 일자</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {listItems.map((item, i) => (
                <tr key={item.id} onClick={() => handleSelect(item)}>
                  <td className="tbl-col-num">{listItems.length - i}</td>
                  <td className="tbl-col-stat">
                    <span className="badge badge--archived">{TYPE_LABEL[item.type]}</span>
                  </td>
                  <td style={{ paddingLeft: 10 }}>{item.title}</td>
                  <td className="tbl-col-date">
                    {item.originalDate.replace(/-/g, '.').slice(2)}
                  </td>
                  <td className="tbl-col-date">
                    {item.destroyedDate.replace(/-/g, '.').slice(2)}
                  </td>
                  <td className="tbl-col-stat">
                    <span className="badge badge--internal">열람가능</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
