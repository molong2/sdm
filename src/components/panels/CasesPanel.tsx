import { useState } from 'react';
import { cases } from '../../data/cases';
import { useGame } from '../../context/GameContext';
import { getDateForDay } from '../../utils/date';
import type { Case, CaseStatus } from '../../types';

// ============================================================
// 초자연재난 패널
// ============================================================

const STATUS_CSS: Record<CaseStatus, string> = {
  '긴급호출': 'emergency',
  '진행중':   'active',
  '봉인':     'pending',
  '종결':     'closed',
};

const CHANGEABLE: CaseStatus[] = ['진행중', '봉인', '종결'];

// 관리등급 앞 두 글자로 배지 색상 결정
function gradeCss(category: string): string {
  if (category.startsWith('침형'))   return 'grade-chim'; // 5등급 — 적흑
  if (category.startsWith('파형'))   return 'grade-pa';   // 4등급 — 적색
  if (category.startsWith('쇄형'))   return 'grade-sae';  // 3등급 — 주황
  if (category.startsWith('뇌형'))   return 'grade-noe';  // 2등급 — 보라
  if (category.startsWith('고형'))   return 'grade-go';   // 1등급 — 청록
  if (category.startsWith('초자연')) return 'grade-ext';  // 등급 외
  return 'grade-unknown';
}

// 목록에 표시할 등급 약자 (괄호 제거, 등급외는 "관찰")
function gradeShort(category: string): string {
  if (category === '초자연현상') return '관찰';
  const m = category.match(/^([가-힣]+)\(/);
  return m ? m[1] : category;
}

// 관리등급 필터 — 위험도 낮은 순 → 높은 순
const GRADE_FILTERS = ['전체', '초자연현상', '고형', '뇌형', '쇄형', '파형', '침형'] as const;
type GradeFilter = typeof GRADE_FILTERS[number];

const GRADE_LABELS: Record<GradeFilter, string> = {
  '전체': '전체',
  '초자연현상': '등급 외',
  '고형': '고형',
  '뇌형': '뇌형',
  '쇄형': '쇄형',
  '파형': '파형',
  '침형': '침형',
};

// description 첫 줄의 최종개정일(YYYY.MM.DD) 추출 — 정렬에 사용
function getLastModified(description: string): string {
  const m = description.match(/최종개정일:\s*(\d{4}\.\d{2}\.\d{2})/);
  return m ? m[1] : '0000.00.00';
}

export function CasesPanel() {
  const { gameState, isVisible, markCaseRead, setFlag, getEffectiveStatus, updateCaseStatus } = useGame();
  const [selected, setSelected]     = useState<Case | null>(null);
  const [newStatus, setNewStatus]   = useState<CaseStatus>('진행중');
  const [noteText, setNoteText]     = useState('');
  const [noteSaved, setNoteSaved]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('전체');

  const visible = cases.filter(isVisible);
  const unread  = visible.filter(c => !gameState.readCases.includes(c.id)).length;

  const filtered = visible.filter(c => {
    if (gradeFilter !== '전체') {
      if (gradeFilter === '초자연현상') {
        if (!c.category.startsWith('초자연')) return false;
      } else {
        if (!c.category.startsWith(gradeFilter)) return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return c.title.toLowerCase().includes(q) || c.caseNumber.toLowerCase().includes(q);
    }
    return true;
  });

  // 최종개정일 내림차순 정렬 (최근 수정 → 상단)
  const sorted = [...filtered].sort((a, b) =>
    getLastModified(b.description).localeCompare(getLastModified(a.description))
  );

  function handleSelect(c: Case) {
    setSelected(c);
    markCaseRead(c.id);
    if (c.onReadFlags) {
      Object.entries(c.onReadFlags).forEach(([k, v]) => setFlag(k, v));
    }
    const eff = getEffectiveStatus(c.id, c.status);
    setNewStatus(eff === '긴급호출' ? '진행중' : eff);
    setNoteText('');
    setNoteSaved(false);
  }

  function handleUpdateSubmit() {
    if (!selected || !noteText.trim()) return;
    updateCaseStatus(selected.id, newStatus, noteText.trim());
    setNoteText('');
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  }

  /* ── 상세 뷰 ─────────────────────────────────────────────── */
  if (selected) {
    const eff      = getEffectiveStatus(selected.id, selected.status);
    const history  = gameState.caseNotes[selected.id] ?? [];
    const canChange = eff !== '긴급호출';

    return (
      <div className="panel">
        <div className="sec-hd">
          <span className="sec-hd__mark">■</span>
          <span className="sec-hd__title">초자연재난 — 사건 상세</span>
        </div>
        <div className="back-bar">
          <button className="back-btn" onClick={() => setSelected(null)}>◀ 목록으로</button>
        </div>
        <div className="detail-body">
          <div className="det-subtitle">{selected.caseNumber}</div>
          <div className="det-title">{selected.title}</div>
          <div className="det-meta">
            <span className="det-meta__lbl">상태</span>
            <span className="det-meta__val">
              <span className={`badge badge--${STATUS_CSS[eff]}`}>{eff}</span>
            </span>
            <span className="det-meta__lbl">관리등급</span>
            <span className="det-meta__val">
              <span className={`badge badge--${gradeCss(selected.category)}`}>{selected.category}</span>
            </span>
            <span className="det-meta__lbl">접수일</span>
            <span className="det-meta__val" style={{ fontFamily: 'var(--mono)' }}>
              {selected.reportedDate.replace(/-/g, '.')}
            </span>
            {selected.assignedTo && (
              <>
                <span className="det-meta__lbl">담당자</span>
                <span className="det-meta__val">{selected.assignedTo}</span>
              </>
            )}
          </div>

          <div className="det-section-title">사건 개요</div>
          <div className="det-content">{selected.description}</div>

          {selected.notes && (
            <>
              <div className="det-section-title">비고</div>
              <div className="det-notes">{selected.notes}</div>
            </>
          )}

          {history.length > 0 && (
            <>
              <div className="det-section-title">경과 기록</div>
              <div className="case-history">
                {history.map((entry, i) => (
                  <div key={i} className="case-history__entry">
                    <div className="case-history__meta">
                      {getDateForDay(entry.day)}
                      <span className="case-history__arrow">
                        <span className={`badge badge--${STATUS_CSS[entry.oldStatus]}`}>{entry.oldStatus}</span>
                        {' → '}
                        <span className={`badge badge--${STATUS_CSS[entry.newStatus]}`}>{entry.newStatus}</span>
                      </span>
                    </div>
                    <div className="case-history__text">{entry.text}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {canChange && (
            <div className="case-update-form">
              <div className="det-section-title">상태 변경 / 경과 기록</div>
              <div className="case-update-form__row">
                <label className="case-update-form__label">변경할 상태</label>
                <div className="case-update-form__status-btns">
                  {CHANGEABLE.map(s => (
                    <button
                      key={s}
                      className={`case-status-btn${newStatus === s ? ' case-status-btn--active' : ''}`}
                      onClick={() => setNewStatus(s)}
                    >
                      <span className={`badge badge--${STATUS_CSS[s]}`}>{s}</span>
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                className="case-update-form__textarea"
                value={noteText}
                onChange={e => { setNoteText(e.target.value); setNoteSaved(false); }}
                placeholder="경과 내용, 변경 사유 등을 입력하십시오."
                rows={4}
              />
              <div className="case-update-form__footer">
                {noteSaved && <span className="case-update-form__saved">저장되었습니다.</span>}
                <button
                  className="case-update-form__submit"
                  onClick={handleUpdateSubmit}
                  disabled={!noteText.trim()}
                >
                  기록 저장
                </button>
              </div>
            </div>
          )}

          {eff === '긴급호출' && (
            <div className="case-emergency-notice">
              ⚠ 긴급호출 상태의 사건은 담당 부서 승인 없이 상태를 변경할 수 없습니다.
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
        <span className="sec-hd__title">초자연재난</span>
        <span className="sec-hd__info">
          총 {visible.length}건
          {unread > 0 && (
            <span className="sec-hd__info--alert" style={{ marginLeft: 8 }}>/ 미확인 {unread}건</span>
          )}
        </span>
      </div>

      {/* 검색 + 관리등급 필터 툴바 */}
      <div className="cases-toolbar">
        <input
          className="cases-search"
          type="text"
          placeholder="제목 또는 사건번호 검색..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="cases-filter">
          <span className="cases-filter__label">관리등급</span>
          {GRADE_FILTERS.map(f => (
            <button
              key={f}
              className={`cases-filter__btn${gradeFilter === f ? ' cases-filter__btn--active' : ''}`}
              onClick={() => setGradeFilter(f)}
            >
              {f === '전체' ? '전체' : (
                <span className={`badge badge--${gradeCss(f === '초자연현상' ? '초자연' : f + '형(')}`}>
                  {GRADE_LABELS[f]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="tbl-wrap">
        {filtered.length === 0 ? (
          <div className="panel-empty">
            <div className="panel-empty__ico">◎</div>
            <div className="panel-empty__text">
              {visible.length === 0 ? '사건 없음' : '검색 결과 없음'}
            </div>
          </div>
        ) : (
          <table className="tbl">
            <colgroup>
              <col style={{ width: 38 }} />
              <col style={{ width: 20 }} />
              <col style={{ width: 112 }} />
              <col style={{ width: 64 }} />
              <col />
              <col style={{ width: 68 }} />
              <col style={{ width: 76 }} />
            </colgroup>
            <thead>
              <tr>
                <th>번호</th>
                <th>●</th>
                <th>사건번호</th>
                <th>관리등급</th>
                <th style={{ textAlign: 'left', paddingLeft: 10 }}>제목</th>
                <th>상태</th>
                <th>접수일</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => {
                const isRead = gameState.readCases.includes(c.id);
                const eff    = getEffectiveStatus(c.id, c.status);
                return (
                  <tr
                    key={c.id}
                    className={[
                      !isRead ? 'tbl-row--unread' : '',
                      eff === '긴급호출' ? 'tbl-row--emergency' : '',
                    ].join(' ').trim()}
                    onClick={() => handleSelect(c)}
                  >
                    <td className="tbl-col-num">{sorted.length - i}</td>
                    <td className="tbl-col-dot">{!isRead && <span className="unread-dot" />}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)' }}>
                      {c.caseNumber}
                    </td>
                    <td className="tbl-col-stat">
                      <span className={`badge badge--${gradeCss(c.category)}`}>{gradeShort(c.category)}</span>
                    </td>
                    <td style={{ paddingLeft: 10 }}>{c.title}</td>
                    <td className="tbl-col-stat">
                      <span className={`badge badge--${STATUS_CSS[eff]}`}>{eff}</span>
                    </td>
                    <td className="tbl-col-date">{c.reportedDate.replace(/-/g, '.').slice(2)}</td>
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
