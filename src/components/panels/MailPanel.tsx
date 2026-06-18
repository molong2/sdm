import { useState, useEffect, useRef } from 'react';
import { mails } from '../../data/mails';
import { useGame } from '../../context/GameContext';
import type { Mail } from '../../types';

// ============================================================
// 메일함 패널
// 목록 → 클릭 → 상세 보기 (한국 인트라넷 게시판 방식)
// ============================================================

interface MailPanelProps {
  onOpenForm: (formId: string) => void;
  onOpenDoc: (docId: string) => void;
  /** 메일 상세에서 목록으로 돌아올 때 호출됨 — 특정 메일 열람 후 이벤트 트리거 등에 사용 */
  onMailBack?: (mailId: string) => void;
}

export function MailPanel({ onOpenForm, onOpenDoc, onMailBack }: MailPanelProps) {
  const { gameState, isVisible, markMailRead, setFlag, isFormSubmitted, getMailReply, sendMailReply } = useGame();
  const [selected, setSelected] = useState<Mail | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const allMails = [...mails, ...gameState.dynamicMails];
  const visible = allMails.filter(isVisible);
  const sorted  = [...visible].sort((a, b) => b.date.localeCompare(a.date));
  const unread  = visible.filter(m => !gameState.readMails.includes(m.id)).length;

  // 탭 전환 시 언마운트될 때도 onMailBack이 호출되도록 ref로 추적
  const selectedIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedIdRef.current = selected?.id ?? null;
  }, [selected]);
  useEffect(() => () => {
    if (selectedIdRef.current) onMailBack?.(selectedIdRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelect(mail: Mail) {
    const isFirstRead = !gameState.readMails.includes(mail.id);
    setSelected(mail);
    markMailRead(mail.id);
    if (isFirstRead && mail.onReadFlags) {
      Object.entries(mail.onReadFlags).forEach(([k, v]) => setFlag(k, v));
    }
    setComposeOpen(false);
    setReplyText('');
  }

  function handleBack() {
    const mailId = selected!.id;
    setSelected(null);
    onMailBack?.(mailId);
  }

  function handleSendReply() {
    if (!selected || !replyText.trim()) return;
    const text = replyText.trim();
    sendMailReply(selected.id, text);
    if (selected.replyKeywords) {
      const lower = text.toLowerCase();
      for (const rule of selected.replyKeywords) {
        if (rule.words.some(w => lower.includes(w.toLowerCase()))) {
          Object.entries(rule.setFlags).forEach(([k, v]) => setFlag(k, v));
        }
      }
    }
    setReplyText('');
    setComposeOpen(false);
  }

  /* ── 상세 뷰 ─────────────────────────────────────────────── */
  if (selected) {
    return (
      <div className="panel">
        <div className="sec-hd">
          <span className="sec-hd__mark">■</span>
          <span className="sec-hd__title">메일함 — 메일 상세</span>
        </div>
        <div className="back-bar">
          <div className="back-bar__row">
            <button className="back-btn" onClick={handleBack}>
              ◀ 목록으로
            </button>
            {!selected.system && !getMailReply(selected.id) && (
              <button className="back-bar__reply-btn" onClick={() => { setReplyText(''); setComposeOpen(true); }}>
                ✉ 답장
              </button>
            )}
          </div>
        </div>
        <div className="detail-body">
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {selected.system   && <span className="badge badge--system">SYSTEM</span>}
            {selected.important && <span className="badge badge--urgent">중요</span>}
          </div>
          <div className="det-title">{selected.subject}</div>
          <div className="det-meta">
            <span className="det-meta__lbl">발신자</span>
            <span className="det-meta__val">
              {selected.from}
              {selected.fromDept && ` (${selected.fromDept})`}
            </span>
            <span className="det-meta__lbl">수신자</span>
            <span className="det-meta__val">{selected.to}</span>
            <span className="det-meta__lbl">발송 일시</span>
            <span className="det-meta__val" style={{ fontFamily: 'var(--mono)' }}>{selected.date}</span>
          </div>

          {selected.attachments && selected.attachments.length > 0 && (
            <div className="mail-attachments">
              <div className="mail-attachments__hd">첨부파일 ({selected.attachments.length})</div>
              <div className="mail-attachments__list">
                {selected.attachments.map((att, i) => {
                  const submitted = att.formId ? isFormSubmitted(att.formId) : false;
                  if (att.formId) return (
                    <button
                      key={i}
                      className={`mail-att-item mail-att-item--form${submitted ? ' mail-att-item--done' : ''}`}
                      onClick={() => onOpenForm(att.formId!)}
                    >
                      <span className="mail-att-item__ico">{submitted ? '✔' : '📄'}</span>
                      <span className="mail-att-item__name">{att.name}</span>
                      <span className="mail-att-item__arrow">→ 작성하기</span>
                    </button>
                  );
                  if (att.docId) return (
                    <button
                      key={i}
                      className="mail-att-item mail-att-item--doc"
                      onClick={() => onOpenDoc(att.docId!)}
                    >
                      <span className="mail-att-item__ico">📋</span>
                      <span className="mail-att-item__name">{att.name}</span>
                      <span className="mail-att-item__arrow">→ 열람하기</span>
                    </button>
                  );
                  return (
                    <div key={i} className="mail-att-item mail-att-item--readonly">
                      <span className="mail-att-item__ico">🔒</span>
                      <span className="mail-att-item__name">{att.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="det-content">{selected.body}</div>

          {(() => {
            const sentReply = getMailReply(selected.id);
            if (sentReply) {
              return (
                <div className="mail-reply">
                  <div className="det-section-title">답장</div>
                  <div className="mail-reply__sent">
                    <div className="mail-reply__sent-label">발송한 답장</div>
                    <div className="mail-reply__sent-text">{sentReply}</div>
                  </div>
                </div>
              );
            }
            if (selected.system) {
              return (
                <div className="mail-reply">
                  <div className="det-section-title">답장</div>
                  <div className="mail-reply__disabled">
                    시스템 자동발송 메일에는 답장할 수 없습니다.
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {composeOpen && (
          <div className="mail-compose-overlay" onClick={() => setComposeOpen(false)}>
            <div className="mail-compose-dialog" onClick={e => e.stopPropagation()}>
              <div className="mail-compose-titlebar">
                <span className="mail-compose-titlebar__icon">✉</span>
                <span className="mail-compose-titlebar__text">메일 작성</span>
                <button className="mail-compose-titlebar__close" onClick={() => setComposeOpen(false)}>✕</button>
              </div>
              <div className="mail-compose-body">
                <div className="mail-compose-field">
                  <label className="mail-compose-field__lbl">받는사람</label>
                  <input
                    className="mail-compose-field__input"
                    readOnly
                    value={`${selected.from}${selected.fromDept ? ` (${selected.fromDept})` : ''}`}
                  />
                </div>
                <div className="mail-compose-field">
                  <label className="mail-compose-field__lbl">제목</label>
                  <input
                    className="mail-compose-field__input"
                    readOnly
                    value={`RE: ${selected.subject}`}
                  />
                </div>
                <textarea
                  className="mail-compose-textarea"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="내용을 입력하십시오."
                  rows={10}
                  autoFocus
                />
              </div>
              <div className="mail-compose-footer">
                <button
                  className="mail-compose-send"
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                >
                  보내기
                </button>
                <button className="mail-compose-cancel" onClick={() => setComposeOpen(false)}>
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── 목록 뷰 (테이블) ────────────────────────────────────── */
  return (
    <div className="panel">
      <div className="sec-hd">
        <span className="sec-hd__mark">■</span>
        <span className="sec-hd__title">메일함 — 받은 메일함</span>
        <span className="sec-hd__info">
          총 {visible.length}건
          {unread > 0 && (
            <span className="sec-hd__info--alert" style={{ marginLeft: 8 }}>
              / 미읽음 {unread}건
            </span>
          )}
        </span>
      </div>

      <div className="tbl-wrap">
        {visible.length === 0 ? (
          <div className="panel-empty">
            <div className="panel-empty__ico">□</div>
            <div className="panel-empty__text">메일이 없습니다.</div>
          </div>
        ) : (
          <table className="tbl">
            <colgroup>
              <col style={{ width: 42 }} />
              <col style={{ width: 24 }} />
              <col />  {/* 제목 */}
              <col style={{ width: 100 }} />
              <col style={{ width: 80 }} />
            </colgroup>
            <thead>
              <tr>
                <th>번호</th>
                <th>●</th>
                <th style={{ textAlign: 'left', paddingLeft: 10 }}>제목</th>
                <th>발신자</th>
                <th>날짜</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((mail, i) => {
                const isRead = gameState.readMails.includes(mail.id);
                return (
                  <tr
                    key={mail.id}
                    className={`${!isRead ? 'tbl-row--unread' : ''}`}
                    onClick={() => handleSelect(mail)}
                  >
                    <td className="tbl-col-num">{sorted.length - i}</td>
                    <td className="tbl-col-dot">
                      {!isRead && <span className="unread-dot" />}
                    </td>
                    <td style={{ paddingLeft: 10 }}>
                      {mail.system && (
                        <span className="badge badge--system" style={{ marginRight: 5 }}>SYSTEM</span>
                      )}
                      {mail.important && (
                        <span style={{ color: 'var(--red)', marginRight: 4 }}>★</span>
                      )}
                      {mail.subject}
                    </td>
                    <td className="tbl-col-from">
                      {mail.from}{mail.fromDept ? ` / ${mail.fromDept}` : ''}
                    </td>
                    <td className="tbl-col-date">{mail.date.slice(5, 10).replace('-', '.')}</td>
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
