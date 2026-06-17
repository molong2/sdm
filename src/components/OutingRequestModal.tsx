import { useState } from 'react';
import { ACTIVE_EMERGENCY_CALLS, APPROVED_OUTING_REASONS, APPROVED_OUTING_REASONS_BY_DAY, OUTING_CONDITIONS } from '../data/config';
import { useGame } from '../context/GameContext';

interface Props {
  currentDay: number;
  onApproved: (isOutingEvent?: boolean) => void;
  onClose: () => void;
}

type Step = 'select' | 'other-input' | 'rejected' | 'approved';
type Reason = 'supernatural' | 'other';

export function OutingRequestModal({ currentDay, onApproved, onClose }: Props) {
  const { gameState } = useGame();
  const flags = gameState.flags;

  const [step, setStep]           = useState<Step>('select');
  const [reason, setReason]       = useState<Reason | null>(null);
  const [otherText, setOtherText] = useState('');
  const [rejectMsg, setRejectMsg] = useState('');
  const [isOutingEvent, setIsOutingEvent] = useState(false);

  // 일차별 조건부 외근 승인 가능 여부
  function checkOutingCondition(forReason: 'supernatural' | 'other'): boolean {
    const cond = OUTING_CONDITIONS[currentDay];
    if (!cond || cond.reason !== forReason) return false;
    return !!flags[cond.requiredFlag] && !flags[cond.doneFlag];
  }

  function selectReason(r: Reason) {
    setReason(r);
    if (r === 'supernatural') {
      const staticCalls = ACTIVE_EMERGENCY_CALLS[currentDay] ?? [];
      const condOk = checkOutingCondition('supernatural');
      if (staticCalls.length > 0 || condOk) {
        setIsOutingEvent(condOk);
        setStep('approved');
      } else {
        setRejectMsg(
          '현재 모든 초자연재난은 담당 요원들이 관리하고 있습니다.\n외근 신청이 반려되었습니다.'
        );
        setStep('rejected');
      }
    } else {
      setStep('other-input');
    }
  }

  function submitOther() {
    const trimmed = otherText.trim();
    if (!trimmed) return;
    // 전역 승인 목록 체크
    if (APPROVED_OUTING_REASONS.includes(trimmed)) {
      setIsOutingEvent(false);
      setStep('approved');
      return;
    }
    // 일차별 승인 목록 체크 (띄어쓰기 제거 + 조건 플래그)
    const normalized = trimmed.replace(/\s/g, '');
    const dayReasons = APPROVED_OUTING_REASONS_BY_DAY[currentDay] ?? [];
    if (dayReasons.includes(normalized) && checkOutingCondition('other')) {
      setIsOutingEvent(true);
      setStep('approved');
      return;
    }
    setRejectMsg(
      '입력하신 사유는 현재 승인 가능한 외근 사유에 해당하지 않습니다.\n외근 신청이 반려되었습니다.'
    );
    setStep('rejected');
  }

  return (
    <div className="modal-overlay">
      <div className="outing-dialog">
        <div className="outing-dialog__titlebar">
          <span>외근신청서</span>
          <button className="outing-dialog__close" onClick={onClose}>✕</button>
        </div>

        <div className="outing-dialog__body">
          {step === 'select' && (
            <>
              <div className="outing-dialog__label">외근 사유를 선택하십시오.</div>
              <div className="outing-dialog__reason-row">
                <button className="outing-reason-btn" onClick={() => selectReason('supernatural')}>
                  초자연재난
                </button>
                <button className="outing-reason-btn" onClick={() => selectReason('other')}>
                  기타사유
                </button>
              </div>
            </>
          )}

          {step === 'other-input' && (
            <>
              <div className="outing-dialog__label">외근 사유를 직접 입력하십시오.</div>
              <textarea
                className="outing-dialog__textarea"
                value={otherText}
                onChange={e => setOtherText(e.target.value)}
                placeholder="외근 사유 입력"
                rows={3}
                autoFocus
              />
              <div className="outing-dialog__footer">
                <button className="outing-dialog__btn outing-dialog__btn--secondary"
                  onClick={() => setStep('select')}>이전</button>
                <button className="outing-dialog__btn outing-dialog__btn--primary"
                  onClick={submitOther} disabled={!otherText.trim()}>제출</button>
              </div>
            </>
          )}

          {step === 'rejected' && (
            <>
              <div className="outing-dialog__status outing-dialog__status--rejected">
                <span className="outing-dialog__status-ico">✕</span>
                <div className="outing-dialog__status-text">반려</div>
              </div>
              <div className="outing-dialog__reject-msg">
                {rejectMsg.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
              <div className="outing-dialog__footer">
                <button className="outing-dialog__btn outing-dialog__btn--secondary"
                  onClick={() => { setStep('select'); setOtherText(''); }}>재신청</button>
                <button className="outing-dialog__btn outing-dialog__btn--secondary"
                  onClick={onClose}>닫기</button>
              </div>
            </>
          )}

          {step === 'approved' && (
            <>
              <div className="outing-dialog__status outing-dialog__status--approved">
                <span className="outing-dialog__status-ico">✓</span>
                <div className="outing-dialog__status-text">승인</div>
              </div>
              <div className="outing-dialog__reject-msg">외근 신청이 승인되었습니다.</div>
              <div className="outing-dialog__footer">
                <button className="outing-dialog__btn outing-dialog__btn--primary"
                  onClick={() => onApproved(isOutingEvent)}>확인</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
