import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { messengerChats } from '../../data/messenger';
import { getChatDateLabel } from '../../utils/date';
import type { PlayerChatStep } from '../../types';

// ============================================================
// 메신저 채팅창 (플로팅 오버레이)
// 같은 npcId를 가진 모든 대화(현재 보이는 것)를 정의 순서대로 이어붙여
// 하나의 연속된 스레드처럼 표시한다.
// ============================================================

interface Props {
  npcId: string;
  onClose: () => void;
  /** 메시지에 첨부된 문서 링크 클릭 시 — 자료보관소에서 해당 문서를 바로 연다 */
  onOpenDoc: (docId: string) => void;
}

interface RenderedMsg {
  role: 'npc' | 'player';
  content: string;
  docLink?: { docId: string; label: string };
}

export function MessengerWindow({ npcId, onClose, onOpenDoc }: Props) {
  const { gameState, isVisible, setFlag, advanceChatNpcStep, chooseChatOption } = useGame();

  // 훅은 항상 최상단에 (조건부 return 전)
  const [showTyping, setShowTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // 이 NPC와 연결된, 현재 보이는 모든 대화 (정의 순서 = 진행 순서)
  const npcChats = messengerChats.filter(c => c.npcId === npcId && isVisible(c));

  // 아직 끝나지 않은 첫 대화 = 현재 진행 중인 활성 대화
  const activeChat = npcChats.find(c => (gameState.chatProgress[c.id] ?? 0) < c.script.length) ?? null;
  const activeProgress = activeChat ? (gameState.chatProgress[activeChat.id] ?? 0) : 0;
  const activeChatId = activeChat?.id;

  // 자동 재생: 활성 대화의 progress 위치 스텝이 NPC이면 타이핑 표시 후 진행
  useEffect(() => {
    if (!activeChat) return;
    if (activeProgress >= activeChat.script.length) return;
    const step = activeChat.script[activeProgress];
    if (step.role !== 'npc') return;

    setShowTyping(true);
    const timer = setTimeout(() => {
      setShowTyping(false);
      if (step.setFlags) {
        Object.entries(step.setFlags).forEach(([k, v]) => setFlag(k, v));
      }
      advanceChatNpcStep(activeChat.id);
    }, 700);
    return () => {
      clearTimeout(timer);
      setShowTyping(false);
    };
  }, [activeChatId, activeProgress]); // eslint-disable-line react-hooks/exhaustive-deps

  // 스크롤 최하단
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  if (npcChats.length === 0) return null;

  const npcName = npcChats[0].npcName;

  // 보이는 모든 대화를 순서대로 이어붙여 하나의 메시지 목록 구성
  const messages: RenderedMsg[] = [];
  for (const chat of npcChats) {
    const progress = gameState.chatProgress[chat.id] ?? 0;
    const storedChoices = gameState.chatChoices[chat.id] ?? {};
    for (let i = 0; i < progress; i++) {
      const step = chat.script[i];
      if (step.role === 'npc') {
        if (step.showIfChoice) {
          const { step: st, choice: c } = step.showIfChoice;
          if ((storedChoices[st] ?? -1) !== c) continue;
        }
        if (step.showIfAnyChoice) {
          if (!step.showIfAnyChoice.some(({ step: st, choice: c }) => (storedChoices[st] ?? -1) === c)) continue;
        }
        messages.push({ role: 'npc', content: step.content, docLink: step.docLink });
      } else {
        if (step.showIfAnyChoice) {
          if (!step.showIfAnyChoice.some(({ step: st, choice: c }) => (storedChoices[st] ?? -1) === c)) continue;
        }
        const idx = storedChoices[i];
        if (idx !== undefined) {
          messages.push({ role: 'player', content: step.choices[idx].text });
        }
      }
    }
  }

  const isComplete = activeChat === null;
  const currentStep =
    activeChat && !showTyping ? activeChat.script[activeProgress] : null;

  function handleChoice(stepIndex: number, choiceIndex: number) {
    if (!activeChat) return;
    const step = activeChat.script[stepIndex] as PlayerChatStep;
    const choice = step.choices[choiceIndex];
    if (choice.setFlags) {
      Object.entries(choice.setFlags).forEach(([k, v]) => setFlag(k, v));
    }
    chooseChatOption(activeChat.id, stepIndex, choiceIndex);
  }

  return (
    <div className="messenger-window">
      {/* 헤더 */}
      <div className="messenger-header">
        <div className="messenger-header__avatar">{npcName[0]}</div>
        <span className="messenger-header__name">{npcName}</span>
        <button className="messenger-header__close" onClick={onClose} title="닫기">
          ×
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="messenger-body" ref={bodyRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`msg-row msg-row--${msg.role}`}>
            {msg.role === 'npc' && (
              <div className="msg-avatar">{npcName[0]}</div>
            )}
            <div className="msg-bubble">
              {msg.content}
              {msg.docLink && (
                <button
                  type="button"
                  className="msg-doc-link"
                  onClick={() => onOpenDoc(msg.docLink!.docId)}
                >
                  📄 {msg.docLink.label}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* 타이핑 인디케이터 */}
        {showTyping && (
          <div className="msg-row msg-row--npc">
            <div className="msg-avatar">{npcName[0]}</div>
            <div className="msg-bubble msg-bubble--typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        {/* 플레이어 선택지 */}
        {currentStep?.role === 'player' && (
          <div className="messenger-choices">
            {currentStep.choices.map((choice, i) => (
              <button
                key={i}
                className="messenger-choice-btn"
                onClick={() => handleChoice(activeProgress, i)}
              >
                {choice.text}
              </button>
            ))}
          </div>
        )}

        {/* 대화 종료 — 날짜 구분선 */}
        {isComplete && (
          <div className="messenger-date-divider">
            <span>{getChatDateLabel(npcChats[npcChats.length - 1].unlockDay ?? 1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
