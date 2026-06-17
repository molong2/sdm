import { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { groupChats } from '../../data/groupChats';
import { getChatDateLabel } from '../../utils/date';
import type { GroupChatPlayerStep } from '../../types';

// ============================================================
// 단체 대화방 창 — 1:1 메신저와 달리 여러 발신자가 등장한다.
// 메시지 진행은 App.tsx의 전역 타이머가 담당하므로, 이 창은
// 단순히 진행 상태를 보여주고 플레이어 선택지만 처리한다.
// ============================================================

interface Props {
  groupChatId: string;
  onClose: () => void;
}

interface RenderedMsg {
  role: 'npc' | 'player';
  speaker?: string;
  content: string;
}

// 발신자별 프로필 색 — 한눈에 누가 말하는지 구분되도록
const SPEAKER_COLORS: Record<string, string> = {
  명경: '#1a6fc4',
  적목: '#b8402c',
  벽화: '#2a8a5c',
  창파: '#7a4ab8',
  황운: '#c89020',
};
const DEFAULT_SPEAKER_COLOR = '#6a7888';

function speakerColor(name?: string): string {
  if (!name) return DEFAULT_SPEAKER_COLOR;
  return SPEAKER_COLORS[name] ?? DEFAULT_SPEAKER_COLOR;
}

export function TeamChatWindow({ groupChatId, onClose }: Props) {
  const { gameState, setFlag, chooseChatOption } = useGame();
  const bodyRef = useRef<HTMLDivElement>(null);

  const groupChat = groupChats.find(c => c.id === groupChatId);
  const progress = gameState.chatProgress[groupChatId] ?? 0;
  const storedChoices = gameState.chatChoices[groupChatId] ?? {};

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  if (!groupChat) return null;

  const messages: RenderedMsg[] = [];
  for (let i = 0; i < progress; i++) {
    const step = groupChat.script[i];
    if (step.role === 'npc') {
      messages.push({ role: 'npc', speaker: step.speaker, content: step.content });
    } else {
      const idx = storedChoices[i];
      if (idx !== undefined) {
        messages.push({ role: 'player', content: step.choices[idx].text });
      }
    }
  }

  const isComplete = progress >= groupChat.script.length;
  const currentStep = !isComplete ? groupChat.script[progress] : null;

  function handleChoice(stepIndex: number, choiceIndex: number) {
    const step = groupChat!.script[stepIndex] as GroupChatPlayerStep;
    const choice = step.choices[choiceIndex];
    if (choice.setFlags) {
      Object.entries(choice.setFlags).forEach(([k, v]) => setFlag(k, v));
    }
    chooseChatOption(groupChatId, stepIndex, choiceIndex);
  }

  return (
    <div className="teamchat-window">
      {/* 헤더 */}
      <div className="teamchat-header">
        <div className="teamchat-header__avatar">☰</div>
        <span className="teamchat-header__name">{groupChat.title}</span>
        <button className="teamchat-header__close" onClick={onClose} title="닫기">
          ×
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="teamchat-body" ref={bodyRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`msg-row msg-row--${msg.role}`}>
            {msg.role === 'npc' && (
              <div className="msg-avatar msg-avatar--team" style={{ background: speakerColor(msg.speaker) }}>
                {msg.speaker?.[0]}
              </div>
            )}
            <div className="msg-col">
              {msg.role === 'npc' && (
                <div className="teamchat-speaker" style={{ color: speakerColor(msg.speaker) }}>
                  {msg.speaker}
                </div>
              )}
              <div className="msg-bubble">{msg.content}</div>
            </div>
          </div>
        ))}

        {/* 플레이어 선택지 */}
        {currentStep?.role === 'player' && (
          <div className="messenger-choices">
            {currentStep.choices.map((choice, i) => (
              <button
                key={i}
                className="messenger-choice-btn"
                onClick={() => handleChoice(progress, i)}
              >
                {choice.text}
              </button>
            ))}
          </div>
        )}

        {/* 대화 종료 — 날짜 구분선 */}
        {isComplete && (
          <div className="messenger-date-divider">
            <span>{getChatDateLabel(groupChat.unlockDay ?? 1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
