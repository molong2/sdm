import { useGame } from '../../context/GameContext';
import { messengerChats } from '../../data/messenger';

// ============================================================
// 메신저 알림 토스트 (우하단 고정)
// 같은 NPC와의 대화는 여러 개일 수 있지만, 토스트는 NPC당 하나만 표시한다.
// ============================================================

interface Props {
  /** npcId 기준으로 닫은(숨긴) 목록 */
  dismissed: Set<string>;
  onOpen: (npcId: string) => void;
  onDismiss: (npcId: string) => void;
}

export function MessengerToast({ dismissed, onOpen, onDismiss }: Props) {
  const { gameState, isVisible } = useGame();

  const incomplete = messengerChats.filter(chat => {
    if (!isVisible(chat)) return false;
    const progress = gameState.chatProgress[chat.id] ?? 0;
    return progress < chat.script.length;
  });

  // NPC별로, 아직 끝나지 않은 대화 중 정의 순서상 가장 앞선 것 하나만 토스트로 표시
  const byNpc = new Map<string, (typeof incomplete)[number]>();
  for (const chat of incomplete) {
    if (!byNpc.has(chat.npcId)) byNpc.set(chat.npcId, chat);
  }

  const pending = Array.from(byNpc.values()).filter(chat => !dismissed.has(chat.npcId));

  if (pending.length === 0) return null;

  return (
    <div className="messenger-toast-zone">
      {pending.map(chat => {
        const firstMsg = chat.script.find(s => s.role === 'npc');
        const preview =
          firstMsg && firstMsg.role === 'npc'
            ? firstMsg.content.length > 28
              ? firstMsg.content.slice(0, 28) + '…'
              : firstMsg.content
            : '';
        const isNew = (gameState.chatProgress[chat.id] ?? 0) === 0;

        return (
          <div
            key={chat.npcId}
            className="messenger-toast"
            onClick={() => onOpen(chat.npcId)}
            role="button"
          >
            <div className="messenger-toast__avatar">
              {chat.npcName[0]}
              {isNew && <span className="messenger-toast__dot" />}
            </div>
            <div className="messenger-toast__info">
              <div className="messenger-toast__name">{chat.npcName}</div>
              <div className="messenger-toast__preview">{preview}</div>
            </div>
            <button
              className="messenger-toast__close"
              onClick={e => { e.stopPropagation(); onDismiss(chat.npcId); }}
              title="닫기"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
