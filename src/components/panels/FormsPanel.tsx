import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { submittableForms } from '../../data/forms';
import { useGame } from '../../context/GameContext';
import { getKoreanDateForDay } from '../../utils/date';
import type { SubmittableForm } from '../../types';

// ============================================================
// 서류제출 패널
// ============================================================

interface FormsProps {
  targetFormId?: string;
}

// 검열 문자 랜덤화 — 매번 새로 생성해 패턴이 보이지 않게
const CENSOR_POOL = '■▮▓▒░▪▬▌▍▐';
function randomizeCensor(text: string): string {
  return text.replace(/[■▮▓▒░▪▬▌▍▐]+/g, m =>
    Array.from({ length: m.length }, () =>
      CENSOR_POOL[Math.floor(Math.random() * CENSOR_POOL.length)]
    ).join('')
  );
}

// 검열 문자를 <span class="censor-glitch"> 로 감싸 HTML 문자열 반환
function formatCensorHtml(text: string): string {
  const CENSOR_RE = /[■▮▓▒░▪▬▌▍▐]+/g;
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const parts: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = CENSOR_RE.exec(text)) !== null) {
    if (m.index > last) parts.push(escape(text.slice(last, m.index)));
    parts.push(`<span class="censor-glitch">${escape(m[0])}</span>`);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(escape(text.slice(last)));
  return parts.join('');
}

export function FormsPanel({ targetFormId }: FormsProps) {
  const { isVisible, isFormSubmitted, submitForm, gameState } = useGame();

  const visible = submittableForms.filter(isVisible);

  const [selected, setSelected] = useState<SubmittableForm | null>(
    targetFormId ? (visible.find(f => f.id === targetFormId) ?? null) : null
  );
  const [values, setValues]   = useState<Record<string, string>>({});
  const [errors, setErrors]   = useState<Record<string, boolean>>({});
  const [done, setDone]       = useState(false);

  // ── 강제 타이핑 상태 ──────────────────────────────────────
  const [forcedValue, setForcedValue]     = useState('');
  const [forcedStarted, setForcedStarted] = useState(false);
  const [forcedDone, setForcedDone]       = useState(false);
  const [cursorPos, setCursorPos]         = useState<{ x: number; y: number } | null>(null);
  // 강제 타이핑 내용 표시용 div ref (textarea 대신 사용)
  const displayRef        = useRef<HTMLDivElement>(null);
  const submitRef         = useRef<HTMLButtonElement>(null);
  const forcedIdxRef      = useRef(0);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pressedKeysRef    = useRef<Set<string>>(new Set());
  // 랜덤화된 최종 content (한 번만 생성)
  const resolvedContentRef = useRef('');

  const alreadyDone  = done || (selected ? isFormSubmitted(selected.id) : false);
  const isForcedForm = !!selected?.forcedFieldId && !!selected?.forcedContent && !alreadyDone;

  // 폼 변경 시 강제 타이핑 상태 초기화
  useEffect(() => {
    setForcedValue('');
    setForcedStarted(false);
    setForcedDone(false);
    setCursorPos(null);
    forcedIdxRef.current = 0;
    resolvedContentRef.current = '';
    pressedKeysRef.current.clear();
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 강제 폼: 키다운으로 타이핑 진행, 키업으로 일시정지
  useEffect(() => {
    if (!isForcedForm || forcedDone) return;

    // content를 처음 한 번만 생성 (날짜 치환 + 검열 랜덤화)
    if (!resolvedContentRef.current) {
      resolvedContentRef.current = randomizeCensor(
        selected!.forcedContent!.replace('{{date}}', getKoreanDateForDay(gameState.currentDay))
      );
    }
    const content = resolvedContentRef.current;
    const fieldId = selected!.forcedFieldId!;

    function startInterval() {
      if (typingIntervalRef.current) return;
      typingIntervalRef.current = setInterval(() => {
        forcedIdxRef.current = Math.min(forcedIdxRef.current + 1, content.length);
        const partial = content.slice(0, forcedIdxRef.current);
        setForcedValue(partial);
        setValues(prev => ({ ...prev, [fieldId]: partial }));
        if (forcedIdxRef.current >= content.length) {
          clearInterval(typingIntervalRef.current!);
          typingIntervalRef.current = null;
          setForcedDone(true);
        }
      }, 55);
    }

    function stopInterval() {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      pressedKeysRef.current.add(e.key);
      setForcedStarted(true);
      startInterval();
    }

    function onKeyUp(e: KeyboardEvent) {
      pressedKeysRef.current.delete(e.key);
      if (pressedKeysRef.current.size === 0) stopInterval();
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      stopInterval();
    };
  }, [isForcedForm, forcedDone, selected]); // eslint-disable-line react-hooks/exhaustive-deps

  // 강제 타이핑 중 div 자동 스크롤 (항상 마지막 줄 보이도록)
  useEffect(() => {
    const el = displayRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [forcedValue]);

  // 타이핑 완료 → 가짜 커서가 div 하단에서 제출 버튼으로 이동 후 자동 제출
  useEffect(() => {
    if (!forcedDone) return;
    const submitEl = submitRef.current;
    const displayEl = displayRef.current;
    if (!submitEl) return;

    const submitRect = submitEl.getBoundingClientRect();
    const startX = displayEl ? displayEl.getBoundingClientRect().left + 40 : submitRect.left;
    const startY = displayEl ? displayEl.getBoundingClientRect().bottom - 20 : submitRect.top;

    setCursorPos({ x: startX, y: startY });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCursorPos({
          x: submitRect.left + submitRect.width / 2 - 4,
          y: submitRect.top  + submitRect.height / 2 - 7,
        });
      });
    });

    const t = setTimeout(() => {
      submitEl.click();
      setCursorPos(null);
    }, 1300);
    return () => clearTimeout(t);
  }, [forcedDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // 언마운트 시 인터벌 정리
  useEffect(() => () => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
  }, []);

  // 메일 첨부 클릭으로 열리면 자동 선택
  useEffect(() => {
    if (!targetFormId) return;
    const form = visible.find(f => f.id === targetFormId);
    if (form) openForm(form);
  }, [targetFormId]); // eslint-disable-line react-hooks/exhaustive-deps

  const openForm = useCallback((form: SubmittableForm) => {
    setSelected(form);
    setValues({});
    setErrors({});
    setDone(isFormSubmitted(form.id));
  }, [isFormSubmitted]);

  function handleChange(fieldId: string, val: string) {
    setValues(prev => ({ ...prev, [fieldId]: val }));
    if (errors[fieldId]) setErrors(prev => ({ ...prev, [fieldId]: false }));
  }

  function handleSubmit() {
    if (!selected) return;
    const newErrors: Record<string, boolean> = {};
    for (const f of selected.fields) {
      if (!f.required) continue;
      if (f.type === 'checkbox') {
        if (values[f.id] !== 'true') newErrors[f.id] = true;
      } else if (f.type !== 'readonly') {
        if (!values[f.id]?.trim()) newErrors[f.id] = true;
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    submitForm(selected.id);
    setDone(true);
  }

  // ── 상세 (작성) 뷰 ─────────────────────────────────────────
  if (selected) {
    return (
      <div className="panel">
        <div className="sec-hd">
          <span className="sec-hd__mark">■</span>
          <span className="sec-hd__title">서류제출 — {selected.title}</span>
          <span className="sec-hd__info">서식 제{selected.formNumber}호</span>
        </div>
        <div className="back-bar">
          <button className="back-btn" onClick={() => { setSelected(null); setDone(false); }}>
            ◀ 목록으로
          </button>
        </div>

        <div className="detail-body">
          {selected.description && (
            <div className="form-desc">{selected.description}</div>
          )}

          {alreadyDone ? (
            <div className="form-submitted-notice">
              <span className="form-submitted-notice__ico">✔</span>
              <span>제출 완료 — 처리되었습니다.</span>
            </div>
          ) : (
            <div className="form-fields">
              {selected.fields.map(field => {
                if (field.type === 'clause') {
                  return (
                    <div
                      key={field.id}
                      className={`form-clause${errors[field.id] ? ' form-clause--error' : ''}`}
                    >
                      <div className="form-clause__title">{field.label}</div>
                      <div className="form-clause__body">{field.value}</div>
                      <label className="form-clause__check">
                        <input
                          type="checkbox"
                          checked={values[field.id] === 'true'}
                          onChange={e => handleChange(field.id, e.target.checked ? 'true' : 'false')}
                        />
                        <span>위 조항의 내용을 확인하고 이에 서약합니다.</span>
                      </label>
                      {errors[field.id] && (
                        <span className="form-clause__err">필수 항목입니다.</span>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={field.id}
                    className={`form-row${errors[field.id] ? ' form-row--error' : ''}`}
                  >
                    <label className="form-row__label">
                      {field.label}
                      {field.required && field.type !== 'readonly' && (
                        <span className="form-row__req">*</span>
                      )}
                    </label>

                    {field.type === 'readonly' && (
                      <span className="form-row__readonly">{field.value}</span>
                    )}

                    {field.type === 'text' && (
                      <input
                        className="form-row__input"
                        type="text"
                        placeholder={field.placeholder}
                        value={values[field.id] ?? ''}
                        onChange={e => handleChange(field.id, e.target.value)}
                      />
                    )}

                    {field.type === 'date' && (
                      <input
                        className="form-row__input form-row__input--date"
                        type="date"
                        value={values[field.id] ?? ''}
                        onChange={e => handleChange(field.id, e.target.value)}
                      />
                    )}

                    {field.type === 'textarea' && isForcedForm && field.id === selected.forcedFieldId ? (
                      // 강제 타이핑 표시 div — 검열 부분에 글리치 효과 적용
                      <div
                        ref={displayRef}
                        data-glitch-target="forced-textarea"
                        className={`form-row__textarea form-row__textarea--forced form-row__textarea--display${forcedStarted ? ' form-row__textarea--started' : ''}`}
                        tabIndex={0}
                        dangerouslySetInnerHTML={{ __html: formatCensorHtml(forcedValue) }}
                      />
                    ) : field.type === 'textarea' ? (
                      <textarea
                        className="form-row__textarea"
                        placeholder={field.placeholder}
                        rows={3}
                        value={values[field.id] ?? ''}
                        onChange={e => handleChange(field.id, e.target.value)}
                      />
                    ) : null}

                    {field.type === 'checkbox' && (
                      <label className="form-row__check-wrap">
                        <input
                          type="checkbox"
                          checked={values[field.id] === 'true'}
                          onChange={e => handleChange(field.id, e.target.checked ? 'true' : 'false')}
                        />
                        <span className="form-row__check-label">{field.value}</span>
                      </label>
                    )}

                    {errors[field.id] && (
                      <span className="form-row__err-msg">필수 항목입니다.</span>
                    )}
                  </div>
                );
              })}

              <div className="form-actions">
                <button
                  ref={isForcedForm ? submitRef : undefined}
                  className="form-submit-btn"
                  onClick={handleSubmit}
                >
                  제출
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 가짜 커서 — 타이핑 완료 후 제출 버튼으로 이동할 때만 표시 */}
        {isForcedForm && !alreadyDone && createPortal(
          <div
            className="fake-cursor"
            style={forcedDone && cursorPos ? {
              left: cursorPos.x,
              top:  cursorPos.y,
              transition: 'left 0.9s ease, top 0.9s ease',
              display: 'block',
            } : {
              display: 'none',
            }}
          />,
          document.body
        )}
      </div>
    );
  }

  // ── 목록 뷰 ────────────────────────────────────────────────
  return (
    <div className="panel">
      <div className="sec-hd">
        <span className="sec-hd__mark">■</span>
        <span className="sec-hd__title">서류제출</span>
        <span className="sec-hd__info">총 {visible.length}건</span>
      </div>

      <div className="tbl-wrap">
        {visible.length === 0 ? (
          <div className="panel-empty">
            <div className="panel-empty__ico">□</div>
            <div className="panel-empty__text">제출할 서류가 없습니다.</div>
          </div>
        ) : (
          <table className="tbl">
            <colgroup>
              <col style={{ width: 80 }} />
              <col />
              <col style={{ width: 90 }} />
            </colgroup>
            <thead>
              <tr>
                <th>서식 번호</th>
                <th style={{ textAlign: 'left', paddingLeft: 10 }}>서류명</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(form => {
                const submitted = isFormSubmitted(form.id);
                return (
                  <tr
                    key={form.id}
                    data-glitch-target={form.id}
                    onClick={() => openForm(form)}
                  >
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>
                      제{form.formNumber}호
                    </td>
                    <td style={{ paddingLeft: 10 }}>{form.title}</td>
                    <td>
                      {submitted ? (
                        <span className="badge badge--done">제출완료</span>
                      ) : (
                        <span className="badge badge--pending">미제출</span>
                      )}
                    </td>
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
