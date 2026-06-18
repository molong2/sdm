import { documents } from '../../data/documents';
import { useGame } from '../../context/GameContext';

// ============================================================
// 자료보관소 신규 문서 알림 토스트 (우하단 고정)
// requiredFlags로 잠금 해제된 문서가 새로 열람 가능해지면 표시됩니다.
// ============================================================

interface Props {
  dismissed: Set<string>;
  onOpen: (docId: string) => void;
  onDismiss: (docId: string) => void;
}

// 긴급호출 빨간 배너로 이미 알림이 가는 문서는 toast 중복 제외
const EMERGENCY_LINKED_DOCS = new Set(['doc-ng-gbs-emergency']);

const CATEGORY_LABEL: Record<string, string> = {
  '공문':   '공문',
  '보고서': '보고서',
  '녹취록': '녹취록',
  '기밀':   '기밀',
};

export function ArchiveToast({ dismissed, onOpen, onDismiss }: Props) {
  const { gameState, isVisible } = useGame();

  const pending = documents.filter(doc => {
    if (!doc.requiredFlags || doc.requiredFlags.length === 0) return false;
    if (EMERGENCY_LINKED_DOCS.has(doc.id)) return false;
    if (!isVisible(doc)) return false;
    if (gameState.readDocuments.includes(doc.id)) return false;
    if (dismissed.has(doc.id)) return false;
    return true;
  });

  if (pending.length === 0) return null;

  return (
    <div className="archive-toast-zone">
      {pending.map(doc => (
        <div
          key={doc.id}
          className="archive-toast"
          onClick={() => { onDismiss(doc.id); onOpen(doc.id); }}
          role="button"
        >
          <div className="archive-toast__icon">
            <span>문</span>
            <span className="archive-toast__dot" />
          </div>
          <div className="archive-toast__info">
            <div className="archive-toast__label">
              자료보관소 — {CATEGORY_LABEL[doc.category] ?? doc.category}
            </div>
            <div className="archive-toast__title">
              {doc.title.length > 30 ? doc.title.slice(0, 30) + '…' : doc.title}
            </div>
          </div>
          <button
            className="archive-toast__close"
            onClick={e => { e.stopPropagation(); onDismiss(doc.id); }}
            title="닫기"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
