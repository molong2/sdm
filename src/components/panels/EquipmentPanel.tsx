import { useState } from 'react';
import { equipmentItems } from '../../data/equipment';
import { useGame } from '../../context/GameContext';
import { BASE_DATE } from '../../data/config';

// ============================================================
// 장비신청 패널 (서식 제EQ-01호)
// 분류 선택 → 해당 분류의 장비만 선택 가능 → 사용계획 입력 → 신청
// 인터페이스는 항상 렌더링되며, 별도 트리거(플래그) 해금 전까지는
// 입력 요소가 비활성화되고 권한 없음 팝업이 그 위를 덮는다.
// ============================================================

export function EquipmentPanel() {
  const { gameState, addToInventory, addDynamicMail } = useGame();
  const unlocked = gameState.flags['equipmentAccessGranted'] === true;

  const [category, setCategory] = useState('');
  const [itemId, setItemId]     = useState('');
  const [reason, setReason]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  const categories = Array.from(new Set(equipmentItems.map(i => i.category)));
  const itemsInCategory = equipmentItems.filter(i => i.category === category);
  const selectedItem = equipmentItems.find(i => i.id === itemId);

  function handleCategoryChange(value: string) {
    setCategory(value);
    setItemId('');
    setSubmitted(false);
  }

  function handleItemChange(value: string) {
    setItemId(value);
    setSubmitted(false);
  }

  function handleSubmit() {
    if (!selectedItem || !reason.trim()) return;
    addToInventory(selectedItem.id);

    const d = new Date(BASE_DATE);
    d.setDate(d.getDate() + gameState.currentDay - 1);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} 09:45`;

    addDynamicMail({
      id: `mail-eq-${selectedItem.id}-${Date.now()}`,
      from: '총무 담당',
      fromDept: '주작1팀',
      to: '태산 팀장 (A-2019-0047)',
      subject: `[장비신청] ${selectedItem.name} 지급 완료 안내`,
      body: `태산 팀장 (A-2019-0047) 귀하,

신청하신 장비의 검토가 완료되어 아래와 같이 지급 처리하였음을 알립니다.

────────────────────

신청 장비  ·  ${selectedItem.name}
지급 일자  ·  ${dateStr.split(' ')[0]}
신청 사유  ·  ${reason.trim()}

────────────────────

지급된 장비는 수령 즉시 이상 여부를 확인하시고, 문제 발생 시 주작1팀 총무 담당(내선 1-0542)으로 연락하십시오.

---
주작1팀 총무 담당
내선: 1-0542`,
      date: dateStr,
      system: true,
      onReadFlags: { equipmentMailRead: true },
    });

    setSubmitted(true);
  }

  return (
    <div className="panel equip-panel">
      <div className="sec-hd">
        <span className="sec-hd__mark">■</span>
        <span className="sec-hd__title">장비신청</span>
        <span className="sec-hd__info">서식 제EQ-01호</span>
      </div>

      <div className="equip-panel__body">
        <div className="detail-body">
          <div className="form-desc">
            지급·신청 가능 장비 목록(자료보관소, 재관내규 제2024-15호)에 따라 분류를 선택한 뒤 장비를 신청하십시오.
          </div>

          <div className="form-fields">
            <div className="form-row">
              <label className="form-row__label">
                장비 분류<span className="form-row__req">*</span>
              </label>
              <select
                className="form-row__input"
                value={category}
                onChange={e => handleCategoryChange(e.target.value)}
                disabled={!unlocked}
              >
                <option value="">분류를 선택하십시오</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label className="form-row__label">
                신청 장비<span className="form-row__req">*</span>
              </label>
              <select
                className="form-row__input"
                value={itemId}
                onChange={e => handleItemChange(e.target.value)}
                disabled={!unlocked || !category}
              >
                <option value="">
                  {category ? '장비를 선택하십시오' : '먼저 장비 분류를 선택하십시오'}
                </option>
                {itemsInCategory.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            {selectedItem && (
              <>
                <div className="form-row">
                  <label className="form-row__label">효과</label>
                  <span className="form-row__readonly">{selectedItem.effect}</span>
                </div>
                <div className="form-row">
                  <label className="form-row__label">사용조건</label>
                  <span className="form-row__readonly">{selectedItem.condition}</span>
                </div>
              </>
            )}

            <div className="form-row">
              <label className="form-row__label">
                사용 계획 및 사유<span className="form-row__req">*</span>
              </label>
              <textarea
                className="form-row__textarea"
                rows={4}
                placeholder="신청 장비의 사용 계획 및 사유를 입력하십시오."
                value={reason}
                onChange={e => { setReason(e.target.value); setSubmitted(false); }}
                disabled={!unlocked}
              />
            </div>

            <div className="form-actions" style={{ gap: 12 }}>
              {submitted && <span className="equip-submitted-msg">신청이 접수되었습니다.</span>}
              <button
                className="form-submit-btn"
                onClick={handleSubmit}
                disabled={!unlocked || !selectedItem || !reason.trim()}
              >
                신청
              </button>
            </div>
          </div>
        </div>

        {!unlocked && (
          <div className="equip-lock-overlay">
            <div className="equip-lock-dialog">
              <div className="equip-lock-dialog__titlebar">
                <span className="equip-lock-dialog__icon">⚠</span>
                <span>권한 오류</span>
              </div>
              <div className="equip-lock-dialog__body">
                <div className="equip-lock-dialog__msg">
                  현재 계정에는 [장비신청] 기능 사용 권한이 부여되지 않았습니다.
                </div>
                <div className="equip-lock-dialog__sub">
                  권한 관련 문의는 백호2팀 시스템 담당(내선 2-0261)으로 연락하십시오.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
