import { useEffect, useState } from 'react';
import { documents } from '../../data/documents';
import { useGame } from '../../context/GameContext';
import type { Document, ClassificationLevel } from '../../types';

interface ArchivePanelProps {
  /** 메신저 문서 링크 등으로 특정 문서를 바로 열어야 할 때 지정 */
  targetDocId?: string;
}

// ============================================================
// 자료 보관소 패널
// ============================================================

const CLASS_LABEL: Record<ClassificationLevel, string> = {
  public:       '일반',
  internal:     '내부',
  confidential: '대외비',
  secret:       '비밀',
};

// 규정·매뉴얼·지침은 보고서류보다 위에 정렬
const REGULATORY_CATEGORIES = ['규정', '매뉴얼', '지침'];
function docSortKey(doc: Document): string {
  const tier = REGULATORY_CATEGORIES.includes(doc.category) ? '0' : '1';
  // 날짜 내림차순 (최신 위) — 접두사 tier로 1차 정렬
  const invertedDate = (99999999 - parseInt(doc.date.replace(/-/g, ''), 10)).toString().padStart(8, '0');
  return tier + invertedDate;
}

export function ArchivePanel({ targetDocId }: ArchivePanelProps) {
  const { gameState, isVisible, markDocumentRead, reportDocument, setFlag } = useGame();
  const [selected, setSelected] = useState<Document | null>(null);
  const [filterCat, setFilterCat] = useState('전체');

  const visible = documents.filter(isVisible);
  const categories = ['전체', ...Array.from(new Set(visible.map(d => d.category)))];
  const filtered = (filterCat === '전체' ? visible : visible.filter(d => d.category === filterCat))
    .slice()
    .sort((a, b) => docSortKey(a).localeCompare(docSortKey(b)));
  const unread = visible.filter(d => !gameState.readDocuments.includes(d.id)).length;

  function handleSelect(doc: Document) {
    const isFirstRead = !gameState.readDocuments.includes(doc.id);
    setSelected(doc);
    markDocumentRead(doc.id);
    if (isFirstRead && doc.onReadFlags) {
      Object.entries(doc.onReadFlags).forEach(([k, v]) => setFlag(k, v));
    }
  }

  // 신고 후 문서를 닫고 나가는 시점에 onReportFlags를 적용한다.
  // (신고 버튼을 누른 직후가 아니라, 신고하고 문서를 빠져나가는 순간을 트리거로 삼는다.)
  function handleBack() {
    if (selected?.onReportFlags && gameState.reportedDocuments.includes(selected.id)) {
      Object.entries(selected.onReportFlags).forEach(([k, v]) => setFlag(k, v));
    }
    setSelected(null);
  }

  // 메신저 등에서 문서 링크로 진입한 경우 자동으로 해당 문서를 연다.
  useEffect(() => {
    if (!targetDocId) return;
    const doc = documents.find(d => d.id === targetDocId);
    if (doc) handleSelect(doc);
  }, [targetDocId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── 상세 뷰 ─────────────────────────────────────────────── */
  if (selected) {
    return (
      <div className="panel">
        <div className="sec-hd">
          <span className="sec-hd__mark">■</span>
          <span className="sec-hd__title">자료 보관소 — 문서 열람</span>
          <span className="sec-hd__info">
            <span className={`badge badge--${selected.classification}`}>
              {CLASS_LABEL[selected.classification]}
            </span>
          </span>
        </div>
        <div className="back-bar">
          <button className="back-btn" onClick={handleBack}>◀ 목록으로</button>
        </div>
        <div className="detail-body">
          <div className="det-subtitle">{selected.docNumber}</div>
          <div className="det-title">{selected.title}</div>
          <div className="det-meta">
            <span className="det-meta__lbl">보안 등급</span>
            <span className="det-meta__val">
              <span className={`badge badge--${selected.classification}`}>
                {CLASS_LABEL[selected.classification]}
              </span>
            </span>
            <span className="det-meta__lbl">문서 분류</span>
            <span className="det-meta__val">{selected.category}</span>
            <span className="det-meta__lbl">작성자</span>
            <span className="det-meta__val">{selected.author}</span>
            <span className="det-meta__lbl">작성일</span>
            <span className="det-meta__val" style={{ fontFamily: 'var(--mono)' }}>
              {selected.date.replace(/-/g, '.')}
            </span>
          </div>
          <div className="det-section-title">문서 내용</div>
          <div className="det-content">{selected.content}</div>
          {selected.corruptedLines && selected.corruptedLines.length > 0 && (
            <div className="doc-corrupted-block">
              {selected.corruptedLines.map((line, i) => (
                <div key={i} className="doc-corrupted-line">{line}</div>
              ))}
            </div>
          )}
          {selected.tags && selected.tags.length > 0 && (
            <div className="doc-tags">
              {selected.tags.map(tag => (
                <span key={tag} className="doc-tag">#{tag}</span>
              ))}
            </div>
          )}
          {selected.reportable && (
            gameState.reportedDocuments.includes(selected.id) ? (
              <div className="doc-report-notice">⚠ 오염 문서로 신고 완료 — 주작1팀에 통보되었습니다.</div>
            ) : (
              <button className="doc-report-btn" onClick={() => reportDocument(selected.id)}>
                ⚠ 오염 문서 신고
              </button>
            )
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
        <span className="sec-hd__title">자료 보관소</span>
        <span className="sec-hd__info">
          {filtered.length}건
          {unread > 0 && (
            <span style={{ marginLeft: 8, color: 'var(--blue)', fontWeight: 700 }}>
              미열람 {unread}건
            </span>
          )}
        </span>
      </div>

      {/* 분류 필터 */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-sechd)', padding: '0 12px', flexShrink: 0 }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px 12px', fontSize: 11, fontFamily: 'var(--font)',
              color: filterCat === cat ? 'var(--blue)' : 'var(--text-3)',
              borderBottom: filterCat === cat ? '2px solid var(--blue)' : '2px solid transparent',
              marginBottom: -1, fontWeight: filterCat === cat ? 700 : 400,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="tbl-wrap">
        {filtered.length === 0 ? (
          <div className="panel-empty">
            <div className="panel-empty__ico">≡</div>
            <div className="panel-empty__text">문서 없음</div>
          </div>
        ) : (
          <table className="tbl">
            <colgroup>
              <col style={{ width: 42 }} />
              <col style={{ width: 24 }} />
              <col style={{ width: 160 }} />
              <col />
              <col style={{ width: 72 }} />
              <col style={{ width: 70 }} />
              <col style={{ width: 80 }} />
            </colgroup>
            <thead>
              <tr>
                <th>번호</th>
                <th>●</th>
                <th>문서번호</th>
                <th style={{ textAlign: 'left', paddingLeft: 10 }}>제목</th>
                <th>분류</th>
                <th>등급</th>
                <th>작성일</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc, i) => {
                const isRead = gameState.readDocuments.includes(doc.id);
                return (
                  <tr
                    key={doc.id}
                    className={!isRead ? 'tbl-row--unread' : ''}
                    onClick={() => handleSelect(doc)}
                  >
                    <td className="tbl-col-num">{i + 1}</td>
                    <td className="tbl-col-dot">{!isRead && <span className="unread-dot" />}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>
                      {doc.docNumber}
                    </td>
                    <td style={{ paddingLeft: 10 }}>{doc.title}</td>
                    <td className="tbl-col-cat">{doc.category}</td>
                    <td className="tbl-col-class">
                      <span className={`badge badge--${doc.classification}`}>
                        {CLASS_LABEL[doc.classification]}
                      </span>
                    </td>
                    <td className="tbl-col-date">{doc.date.replace(/-/g, '.').slice(2)}</td>
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
