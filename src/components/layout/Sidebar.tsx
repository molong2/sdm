import { Fragment } from 'react';
import {
  LayoutDashboard, Mail, Siren,
  Megaphone, FolderOpen, ClipboardList, Users,
  Stamp, PackagePlus,
  type LucideIcon,
} from 'lucide-react';
import { mails } from '../../data/mails';
import { submittableForms } from '../../data/forms';
import { approvals } from '../../data/approvals';
import { useGame } from '../../context/GameContext';
import type { MenuSection } from '../../types';

interface SidebarProps {
  active: MenuSection;
  onSelect: (section: MenuSection) => void;
}

type MenuGroup = 'work' | 'request' | 'records';

const GROUP_LABELS: Record<MenuGroup, string> = {
  work:    '업무',
  request: '신청·서식',
  records: '자료·조직',
};

const MENU_ITEMS: {
  id: MenuSection;
  label: string;
  Icon: LucideIcon;
  group: MenuGroup;
}[] = [
  { id: 'home',      label: '홈',          Icon: LayoutDashboard, group: 'work'    },
  { id: 'notices',   label: '공지사항',    Icon: Megaphone,       group: 'work'    },
  { id: 'mail',      label: '메일함',      Icon: Mail,            group: 'work'    },
  { id: 'approval',  label: '결재 서류',   Icon: Stamp,           group: 'work'    },
  { id: 'cases',     label: '초자연재난',  Icon: Siren,           group: 'work'    },

  { id: 'forms',     label: '서류제출',    Icon: ClipboardList,   group: 'request' },
  { id: 'equipment', label: '장비신청',    Icon: PackagePlus,     group: 'request' },

  { id: 'archive',   label: '자료 보관소', Icon: FolderOpen,      group: 'records' },
  { id: 'personnel', label: '조직 현황',   Icon: Users,           group: 'records' },
];

export function Sidebar({ active, onSelect }: SidebarProps) {
  const { gameState, isVisible, getApprovalStatus } = useGame();

  const unreadMailCount = mails.filter(
    m => isVisible(m) && !gameState.readMails.includes(m.id)
  ).length;

  const pendingFormCount = submittableForms.filter(
    f => isVisible(f) && !gameState.submittedForms.includes(f.id)
  ).length;

  const pendingApprovalCount = approvals.filter(
    a => isVisible(a) && getApprovalStatus(a.id) === 'pending'
  ).length;

  function renderItem(item: (typeof MENU_ITEMS)[number]) {
    const isBadged = (item.id === 'mail' && unreadMailCount > 0) ||
                     (item.id === 'forms' && pendingFormCount > 0) ||
                     (item.id === 'approval' && pendingApprovalCount > 0);
    const badgeCount = item.id === 'mail' ? unreadMailCount
                      : item.id === 'approval' ? pendingApprovalCount
                      : pendingFormCount;
    const isActive = active === item.id;
    return (
      <div
        key={item.id}
        className={`sidebar__item${isActive ? ' sidebar__item--active' : ''}`}
        onClick={() => onSelect(item.id)}
        {...(item.id === 'forms' ? { 'data-glitch-target': 'forms' } : {})}
      >
        <span className="sidebar__icon">
          <item.Icon size={14} strokeWidth={isActive ? 2.2 : 1.8} />
        </span>
        <span className="sidebar__label">{item.label}</span>
        {isBadged && (
          <span className="sidebar__badge">{badgeCount}</span>
        )}
      </div>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__scroll">
        {MENU_ITEMS.map((item, i) => (
          <Fragment key={item.id}>
            {(i === 0 || MENU_ITEMS[i - 1].group !== item.group) && (
              <div className="sidebar__grp-hd">{GROUP_LABELS[item.group]}</div>
            )}
            {renderItem(item)}
          </Fragment>
        ))}
      </div>
    </aside>
  );
}
