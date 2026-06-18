// ============================================================
// 장비 목록 데이터 — 장비신청 탭 / 자료보관소 문서(재관내규 제2024-15호)와 연동
// ============================================================

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  effect: string;
  condition: string;
}

export const equipmentItems: EquipmentItem[] = [
  { id: 'eq-001', name: '도깨비불 호롱',   category: '탐지·감지',   effect: '비인간 존재 근접 시 점멸 경고',             condition: '없음' },
  { id: 'eq-002', name: '행방 막대',       category: '탐지·감지',   effect: '괴이 현상 관련 매개체 위치 탐지',           condition: '없음' },
  { id: 'eq-003', name: '시큼달큼',        category: '진실확인',    effect: '허위 진술 시 신체적 불쾌감 유발',           condition: '없음' },
  { id: 'eq-004', name: '진실호흡기',      category: '진실확인',    effect: '발화 내용의 진위를 디스플레이에 표시',      condition: '없음' },
  { id: 'eq-005', name: '햇살잡이',        category: '진실확인',    effect: '대상의 진위 여부 시각적 판별 보조',         condition: '없음' },
  { id: 'eq-006', name: '공기누름돌',      category: '신변보호',    effect: '주변 부정적 기운 완화',                    condition: '없음' },
  { id: 'eq-007', name: '신발끈',          category: '신변보호',    effect: '지정 등급 이하 현장 긴급 탈출 보조',        condition: '적용 등급 이하 현장 한정' },
  { id: 'eq-008', name: '줄잡이',          category: '신변보호',    effect: '고형(告刑)급 이하 정신간섭 저항력 부여',    condition: '8급 이상 공무원' },
  { id: 'eq-009', name: '간이 유리 감옥',   category: '제압·구속',   effect: '명중 시 대상 포박 및 호송',                condition: '없음' },
  { id: 'eq-010', name: '사인검',          category: '제압·구속',   effect: '조건 충족 시 사령형 존재에 위력 발현',      condition: '없음' },
  { id: 'eq-011', name: '유리손포',        category: '제압·구속',   effect: '특수 유리탄 장전형 소형 퇴마 장비',         condition: '없음' },
  { id: 'eq-012', name: '작두',            category: '제압·구속',   effect: '공격용. 악인제압형·의식형 2종',            condition: '없음' },
  { id: 'eq-013', name: '포승줄',          category: '제압·구속',   effect: '대상 제압·구속',                          condition: '없음' },
  { id: 'eq-014', name: '미끼놀이',        category: '유인',       effect: '파형(破刑)급 이하 대상의 주의 유인',        condition: '7급 이상 공무원 또는 별도 허가자' },
  { id: 'eq-015', name: '도깨비 감투',      category: '위장·은신',   effect: '착용자 시각적 은폐',                       condition: '없음' },
  { id: 'eq-016', name: '손수건',           category: '신변보호',    effect: '소지 시 정신오염·인지변형 발생 초기에 이상 감지 반응 제공 및 오염 진행 지연. 외관상 일반 면 손수건과 구별 불가. 이미 오염된 상태에서는 효과 없음', condition: '없음' },
  { id: 'eq-017', name: '그립톡',          category: '통신·기록',   effect: '구조요청 신호 발신 (33자 이내)',           condition: '구조대상자 인식 시에만 작동' },
  { id: 'eq-018', name: '옥방울',          category: '정화·치유',   effect: '인지오염 대상의 정신 안정 및 회복 보조',    condition: '없음' },
  { id: 'eq-019', name: '도깨비불 초롱',   category: '의식·특수',   effect: '위험 감지 보조 및 부가 기능',              condition: '도깨비시련 이수자 전용. 시련자 귀속품으로 반납 불요' },
  { id: 'eq-020', name: '은심장',          category: '의식·특수',   effect: '이타적 행동 누적치에 비례한 대인 신뢰 유도', condition: '대여 규정에 따른 별도 승인 필요' },
  { id: 'eq-021', name: '옥패',            category: '의식·특수',   effect: '일부 현장 화폐 대용 사용 가능',             condition: '없음' },
  { id: 'eq-022', name: '액운 삼키미',     category: '현장정리',    effect: '현장 잔존 기운 제거',                      condition: '현장정리반 한정' },
];
