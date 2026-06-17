import type { SubmittableForm } from '../types';

// ============================================================
// 서류제출 양식 데이터
// ============================================================

export const submittableForms: SubmittableForm[] = [
  {
    id: 'form-sc02',
    formNumber: 'SC-02',
    title: '보안서약서 (갱신본)',
    description: '재관보안 제SC-02호 — 복직·발령 시 의무 제출 서류',
    unlockDay: 1,
    fields: [
      { id: 'name',     label: '성명 (요원명)', type: 'readonly', value: '태산' },
      { id: 'empId',    label: '사번',          type: 'readonly', value: 'A-2019-0047' },
      { id: 'dept',     label: '소속',          type: 'readonly', value: '초자연재난관리국 세광특별시 지부 현무1팀' },
      { id: 'position', label: '직위',          type: 'readonly', value: '팀장' },
      { id: 'date',     label: '작성일자',      type: 'date', required: true },
      {
        id: 'clause1',
        label: '제1조  (비밀유지 의무)',
        type: 'clause',
        value:
          '본인은 초자연재난관리국에서의 직무를 수행하면서 취득하게 되는 모든 정보(문서, 구두, 전자적 형태 및 그 밖의 모든 수단으로 전달·저장된 내용을 포함한다)를 재직 기간 중은 물론 퇴직 후에도 제3자에게 유출하거나 공개하지 아니하며, 직무 외의 목적으로 사용하지 아니할 것을 서약한다.\n\n본 조의 정보에는 초자연재난 관련 사건 기록, 요원 신원 정보, 봉인·봉쇄 시설 위치, 대응 절차 및 등급 분류 자료 등 초자연재난관리국이 보안 정보로 지정한 모든 사항이 포함된다.',
        required: true,
      },
      {
        id: 'clause2',
        label: '제2조  (보안 규정 준수 의무)',
        type: 'clause',
        value:
          '본인은 초자연재난관리국의 보안 취급 규정(재난관리보안규정 제1장 내지 제5장), 공무원 행동강령 및 관련 법령을 충분히 숙지하였으며, 이를 성실히 준수할 것을 서약한다.\n\n본인은 비인가자에 대한 내부 자료 열람 허용, 내부망 계정 공유, 보안 구역 무단 동행 등 보안 취급 규정에서 금지하는 일체의 행위를 하지 아니하며, 보안 위협 또는 의심 상황 발생 시 즉시 소속 팀장 및 보안 담당에 보고할 것을 서약한다.',
        required: true,
      },
      {
        id: 'clause3',
        label: '제3조  (위반 시 책임 인지)',
        type: 'clause',
        value:
          '본인은 제1조 및 제2조에 규정된 사항을 위반하였을 경우, 국가공무원법, 보안업무규정, 형법 및 그 밖의 관련 법령에 따른 형사처벌·징계처분을 감수하며, 초자연재난관리국이 이로 인해 입은 손해에 대하여 민사상 배상 책임을 질 것을 인지하고 이에 서약한다.\n\n또한 본 서약서에 기재한 사항이 사실임을 확인하며, 기재 내용이 허위일 경우에도 위와 동일한 책임을 진다.',
        required: true,
      },
    ],
  },
  {
    id: 'form-pi01',
    formNumber: 'PI-01',
    title: '개인정보 처리 동의서',
    description: '인사 업무 처리를 위한 개인정보 수집·이용 동의',
    unlockDay: 1,
    fields: [
      { id: 'name',    label: '성명 (요원명)', type: 'readonly', value: '태산' },
      { id: 'empId',   label: '사번',          type: 'readonly', value: 'A-2019-0047' },
      {
        id: 'info-items',
        label: '수집 항목',
        type: 'readonly',
        value: '성명(요원명), 사번, 연락처, 발령 정보, 비상연락망',
      },
      {
        id: 'info-purpose',
        label: '수집 목적',
        type: 'readonly',
        value: '인사 업무 처리, 비상연락망 관리, 보안 취급인가 심사',
      },
      {
        id: 'info-period',
        label: '보유 기간',
        type: 'readonly',
        value: '재직 기간 및 퇴직 후 5년',
      },
      {
        id: 'consent1',
        label: '동의 1',
        type: 'checkbox',
        value: '위 개인정보 수집 및 이용 목적에 동의합니다.',
        required: true,
      },
      {
        id: 'consent2',
        label: '동의 2',
        type: 'checkbox',
        value: '유관기관 협조를 위한 제3자 제공에 동의합니다. (거부 시 일부 업무 처리 제한)',
        required: false,
      },
      {
        id: 'signature',
        label: '성명 기재 (서명 대체)',
        type: 'text',
        placeholder: '요원명을 정확히 입력하십시오',
        required: true,
      },
    ],
  },
  {
    id: 'form-r6d',
    formNumber: 'OR-18',
    title: '외근 결과 보고서',
    description: '재관보안 제OR-18호 — 외근 완료 후 72시간 내 의무 제출',
    unlockDay: 7,
    forcedFieldId: 'report-body',
    forcedContent: `외근 결과 보고서

작성일: {{date}}
소속: 초자연재난관리국 세광특별시 지부 현무1팀
담당자: 태산 (팀장)
조사 구역: 오후로 17-3 방송국 외벽 송신기 시설

1. 조사 경위

당일 오전 현장 조사 지시에 따라 오후로 17-3 방송국 외벽 인근 송신기 시설 점검 실시. 비인가 전파 신호 발신 정황 사전 포착됨.

2. 현장 상황

송신기 시설 외관 육안 이상 없음. 기기 내부에서 출처 불명의 음성 신호 수신. 신호 내용은 ■▮▓▒░■▮▓▒░■▮▓▒░■▮▓▒░▓▒그분의자▓으로회귀하리라▓▒░■▮▓▒░■▮▓▒░■▮▓▒░. 청취 중 인지 기능 일시 저하 발생.

3. 조사 결과

신호 출처 미확인. 자체 발신 장치 존재 가능성 있음. 담당자 기억 공백 발생 (추정 40분). 귀소 경위 불명.
■▮▓▒░■▮▓▒░■▮▓▒░■▮▓▒░■▮▓▒░■▮▓▒░■▮▓▒░■▮▓▒░■▮▓▒░■▮▓▒░■▮▓▒░

4. 조치 사항

인지 방호 장비 미착용 상태 조사로 인한 노출 가능성 높음. 담당자 추가 건강 검진 필요. 해당 시설 접근 금지 및 추가 조사 팀 파견 권고.
▓▒░그분께돌아와주십시오▓▒░`,
    fields: [
      { id: 'name',     label: '성명',      type: 'readonly', value: '태산' },
      { id: 'date',     label: '작성일',    type: 'readonly', value: '2026-06-18' },
      { id: 'location', label: '조사 구역', type: 'readonly', value: '오후로 17-3 방송국 외벽 송신기 시설' },
      { id: 'report-body', label: '보고 내용', type: 'textarea', required: true, placeholder: '조사 결과를 입력하십시오' },
    ],
  },
];
