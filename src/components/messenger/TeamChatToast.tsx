import { useGame } from '../../context/GameContext';
import { groupChats } from '../../data/groupChats';

// ============================================================
// 단체 대화방 알림 토스트 — 1:1 메신저 토스트와 구분되는 배경색
// ============================================================

interface Props {
  dismissed: Set<string>;
  onOpen: (groupChatId: string) => void;
  onDismiss: (groupChatId: string) => void;
}

export function TeamChatToast({ dismissed, onOpen, onDismiss }: Props) {
  const { gameState, isVisible } = useGame();

  const pending = groupChats.filter(gc => {
    if (!isVisible(gc)) return false;
    if (dismissed.has(gc.id)) return false;
    const progress = gameState.chatProgress[gc.id] ?? 0;
    return progress < gc.script.length;
  });

  if (pending.length === 0) return null;

  return (
    <div className="teamchat-toast-zone">
      {pending.map(gc => {
        const progress = gameState.chatProgress[gc.id] ?? 0;
        const lastNpcMsg = [...gc.script.slice(0, progress)].reverse().find(s => s.role === 'npc');
        const preview = lastNpcMsg && lastNpcMsg.role === 'npc'
          ? `${lastNpcMsg.speaker}: ${lastNpcMsg.content.length > 20 ? lastNpcMsg.content.slice(0, 20) + '…' : lastNpcMsg.content}`
          : '새 대화가 시작되었습니다.';

        return (
          <div
            key={gc.id}
            className="teamchat-toast"
            onClick={() => onOpen(gc.id)}
            role="button"
          >
            <div className="teamchat-toast__avatar">☰</div>
            <div className="teamchat-toast__info">
              <div className="teamchat-toast__name">{gc.title}</div>
              <div className="teamchat-toast__preview">{preview}</div>
            </div>
            <button
              className="teamchat-toast__close"
              onClick={e => { e.stopPropagation(); onDismiss(gc.id); }}
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
