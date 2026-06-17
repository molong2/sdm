import type { DiscardedItem } from '../types';

// ============================================================
// 폐기 자료 데이터
//
// fullyHidden: true  → 조건 미충족 시 목록에서도 안 보임
// fullyHidden: false → 조건 미충족 시 제목은 보이되 내용 잠김
//
// 해금 조건: unlockDay 또는 requiredFlags
// ============================================================

export const discardedItems: DiscardedItem[] = [
  {
    id: 'disc-001',
    title: '2023년 3분기 감사 보고서 (폐기본)',
    type: 'document',
    originalDate: '2023-09-30',
    destroyedDate: '2024-01-10',
    content: `재관감 제2023-19호
2023년 3분기 내부 감사 보고서
작성: 백호2팀 감사담당   일자: 2023.09.30

────────────────────

1. 감사 개요

대상 기간: 2023.07.01. ~ 2023.09.30.
감사 범위: 사건 접수·처리 절차, 문서 보안등급 분류, 비품 지급 현황

────────────────────

2. 주요 점검 사항

가. 사건 접수 후 등급 확정까지의 처리 기간: 평균 4.2일 (기준 7일 이내 — 양호)

나. 보안등급 미기재 문서: 3건 발견. 해당 부서에 시정 권고 완료.

다. 비품 지급 대비 사용 보고서 제출률: 91.4% (기준 90% 이상 — 양호)

────────────────────

3. 종합 의견

전반적으로 운영 절차가 규정에 따라 적절히 이행되고 있는 것으로 판단됨. 일부 보안등급 미기재 사례는 반복되지 않도록 부서별 재교육이 필요함.

────────────────────

4. 처리

본 보고서는 보존 기간(1년) 만료에 따라 정기 폐기 대상으로 분류됨. 폐기 전 백호2팀장 결재 완료.`,
    reason: '보존 기간 만료',
    fullyHidden: false,
    unlockDay: 1,
  },
  {
    id: 'disc-003',
    title: '[미구현] 완전 숨김 폐기 자료',
    type: 'case_file',
    originalDate: '2022-01-01',
    destroyedDate: '2023-01-01',
    content: '[내용 미구현]',
    reason: '[폐기 사유 미구현]',
    // 조건 미충족 시 목록에서도 보이지 않음
    fullyHidden: true,
    unlockDay: 5,
  },
  {
    id: 'disc-004',
    title: '[미구현] 플래그 조건부 폐기 자료',
    type: 'mail',
    originalDate: '2023-11-20',
    destroyedDate: '2024-02-28',
    content: '[내용 미구현]',
    fullyHidden: false,
    unlockDay: 1,
    requiredFlags: ['discoveredBroadcast'],
  },
  {
    id: 'disc-005',
    title: '[미구현] 완전 숨김 + 플래그',
    type: 'media',
    originalDate: '2023-01-01',
    destroyedDate: '2023-06-01',
    content: '[내용 미구현]',
    fullyHidden: true,
    unlockDay: 1,
    requiredFlags: ['foundArchiveKey'],
  },
];
