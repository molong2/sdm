import type { MessengerChat } from '../types';

// ============================================================
// 메신저 대화 스크립트
// role 'npc'   → NPC가 보내는 메시지 (자동 재생)
// role 'player'→ 플레이어 선택지 (버튼 표시)
// ============================================================

export const messengerChats: MessengerChat[] = [
  {
    id: 'chat-changpa-001',
    npcId: 'emp-001',
    npcName: '창파',
    unlockDay: 1,
    requiredFlags: ['readWelcomeMail'],
    script: [
      {
        role: 'npc',
        content: '팀장님!! 복귀하셨다고 들었어요!',
      },
      {
        role: 'npc',
        content: '와 진짜 반갑다… 저 완전 목 빠지게 기다렸잖아요. 근데 연락도 없으시고, 너무 정 없는 거 아니에요? 저 나름 팀장님이랑 완전 친하다고 생각했는데.',
      },
      {
        role: 'player',
        choices: [
          { text: '그럴 만한 일이 있었다.' },
          { text: '잘 지냈나?' },
        ],
      },
      {
        role: 'npc',
        content: '엇, 너무 딱딱하신데요. 알겠어요, 바로 본론 갈게요.',
      },
      {
        role: 'npc',
        content: '오늘은 서류만 좀 훑어보시고 일찍 들어가세요. 몸도 안 좋으셨다면서 너무 무리하지 마시고!',
      },
      {
        role: 'player',
        choices: [
          { text: '내가 없는 동안 계속 이렇게 느슨하게 굴었나?' },
          { text: '그러지.' },
        ],
      },
      {
        role: 'npc',
        content: '헐, 말씀이 심하시네. 제가 누군지 잊으셨어요? 팀장님이니까 특별히 봐 드리는 거라고요.',
      },
      {
        role: 'npc',
        content: '내일부턴 각오하세요!',
      },
      {
        role: 'npc',
        content: '아 맞다! 팀장님 안 계신 동안 연차 신청 하나 올려놨거든요. 왔으니까 승인 좀 해 주세요.',
      },
      {
        role: 'npc',
        content: '며칠만 늦게 복직하셨으면 저 휴가도 못 갈뻔?ㅋㅋ',
      },
      {
        role: 'player',
        choices: [
          { text: '확인해보겠다.' },
          { text: '검토하지.' },
        ],
      },
      {
        role: 'npc',
        content: '역시! 그럼 오늘은 푹 쉬세요~',
      },
    ],
  },
  {
    id: 'chat-hwangun-memorywipe',
    npcId: 'emp-005',
    npcName: '황운',
    unlockDay: 2,
    requiredFlags: ['readDay2Mail'],
    script: [
      {
        role: 'npc',
        content: '팀장님, 주작1팀 황운입니다.',
      },
      {
        role: 'npc',
        content: '회색 건물(1087PSYA.2021.마04) 관련해서 기억소거 대상자가 많아져서 연락드려요.',
      },
      {
        role: 'npc',
        content: '최근 그 건물에 들어갔다 나온 민간인 신고가 늘었는데, 다들 불안감·이명·반복적인 꿈 회상 같은 인지오염 증상을 호소하고 있어요. 평가 결과 기억소거 대상으로 판정된 분들이고요.',
      },
      {
        role: 'npc',
        content: '인원이 많아서 저희 팀만으로는 일정 내에 다 처리하기가 어려울 것 같아요. 혹시 팀장님도 세 분 정도만 맡아주실 수 있을까요?',
      },
      {
        role: 'player',
        choices: [
          { text: '지원하겠다.', setFlags: { agreedMemoryWipeHelp: true } },
          { text: '지금은 어렵다.' },
        ],
      },
    ],
  },
  {
    id: 'chat-hwangun-mw-perfect',
    npcId: 'emp-005',
    npcName: '황운',
    unlockDay: 2,
    requiredFlags: ['mwOutcomePerfect'],
    script: [
      {
        role: 'npc',
        content: '팀장님! 방금 결과 보고받았어요.',
      },
      {
        role: 'npc',
        content: '세 분 다 완벽하게 처리됐다고요? 진짜 감사해요. 덕분에 한숨 돌렸어요.',
      },
      {
        role: 'npc',
        content: '오늘 진짜 큰 도움 받았습니다. 다음에 제가 커피라도 한 잔 사야겠네요!',
      },
    ],
  },
  {
    id: 'chat-hwangun-mw-partial',
    npcId: 'emp-005',
    npcName: '황운',
    unlockDay: 2,
    requiredFlags: ['mwOutcomePartial'],
    script: [
      {
        role: 'npc',
        content: '팀장님, 오늘 처리 결과 보고받았어요.',
      },
      {
        role: 'npc',
        content: '한두 분 정도는 잘 안 됐다고요? 음, 그럴 수 있죠. 처음부터 다 잘 되면 그게 더 이상하죠.',
      },
      {
        role: 'npc',
        content: '남은 분들은 저희 쪽에서 마무리할게요. 신경 쓰지 마세요. 오늘 도와주신 것만으로도 충분해요.',
      },
    ],
  },
  {
    id: 'chat-hwangun-mw-allfail',
    npcId: 'emp-005',
    npcName: '황운',
    unlockDay: 2,
    requiredFlags: ['mwOutcomeAllFail'],
    script: [
      {
        role: 'npc',
        content: '팀장님, 오늘 결과 보고받았는데요...',
      },
      {
        role: 'npc',
        content: '세 분 다 잘 안 되셨다고 들었어요.',
      },
      {
        role: 'npc',
        content: '기억소거 집행 세부 지침(재관내규 제2020-12호) 한 번 다시 확인해보시는 게 좋을 것 같아요.',
        docLink: { docId: 'doc-009', label: '기억소거 집행 세부 지침 (재관내규 제2020-12호)' },
      },
      {
        role: 'npc',
        content: '다음엔 잘 될 거예요. 너무 신경 쓰지 마시고요!',
      },
    ],
  },
  {
    id: 'chat-hwangun-mw-perfect-breakdown',
    npcId: 'emp-005',
    npcName: '황운',
    unlockDay: 2,
    requiredFlags: ['mwOutcomePerfectBreakdown'],
    script: [
      {
        role: 'npc',
        content: '팀장님, 결과 보고받았어요.',
      },
      {
        role: 'npc',
        content: '기억소거는 셋 다 성공한 모양인데요...',
      },
      {
        role: 'npc',
        content: '그런데 한 분 오염이 더 심해졌다는 보고가 같이 들어와서요. 혹시 무슨 일이 있었는지 여쭤봐도 될까요?',
      },
      {
        role: 'player',
        choices: [
          { text: '모르는 일이다.', setFlags: { deniedWomanBreakdown: true } },
          { text: '추후 보고서로 설명하겠다.', setFlags: { promisedReportOnBreakdown: true } },
        ],
      },
    ],
  },
  {
    id: 'chat-hwangun-mw-breakdown-deny',
    npcId: 'emp-005',
    npcName: '황운',
    unlockDay: 2,
    requiredFlags: ['deniedWomanBreakdown'],
    script: [
      {
        role: 'npc',
        content: '...아, 그러시군요. 그럼 제가 좀 더 조사해볼게요.',
      },
    ],
  },
  {
    id: 'chat-hwangun-mw-breakdown-report',
    npcId: 'emp-005',
    npcName: '황운',
    unlockDay: 2,
    requiredFlags: ['promisedReportOnBreakdown'],
    script: [
      {
        role: 'npc',
        content: '...네, 알겠습니다. 보고서 기다리고 있을게요.',
      },
    ],
  },
  {
    id: 'chat-changpa-traffic-news',
    npcId: 'emp-001',
    npcName: '창파',
    unlockDay: 3,
    requiredFlags: ['viewedSuicideBroadcastCase'],
    script: [
      {
        role: 'npc',
        content: '팀장님 이거 보셨어요?',
      },
      {
        role: 'npc',
        content: '【속보】 세광대로 일대 추돌사고 잇따라… 오늘 오후 3건째',
      },
      {
        role: 'player',
        choices: [
          { text: '조사해봐야겠군.' },
          { text: '업무 시간에 이상한 기사 보내지 마라.' },
        ],
      },
      {
        role: 'npc',
        content: '그게 좀 이상해서요. 사고 차량 블랙박스에 그 교통방송 소리가 다 녹음돼 있었대요.',
      },
      {
        role: 'npc',
        content: '아시죠? GBC 교통방송...',
      },
      {
        role: 'npc',
        content: '저희 팀에서 정리해서 보고서 자료실에 올려놨어요. 한번 보세요.',
        docLink: { docId: 'doc-004', label: '세광대로 일대 교통사고 현황 및 블랙박스 음성 분석 보고' },
      },
    ],
  },

  // ── Day 6: 창파(현무1팀) — 집단 변사 현장 출동 요청 ──────────────────
  {
    id: 'chat-changpa-day6',
    npcId: 'emp-001',
    npcName: '창파',
    unlockDay: 6,
    requiredFlags: ['readDay6Case'],
    script: [
      // step 0
      { role: 'npc', content: '팀장님 지금 괜찮으세요? 사건 올라온 거 보셨어요?' },
      // step 1
      {
        role: 'player',
        choices: [
          { text: '방금 봤다' },
          { text: '응, 봤어' },
        ],
      },
      // step 2
      { role: 'npc', content: '청룡팀이 새벽부터 유사 현장 두 곳 먼저 나갔고 오늘 아침에 또 두 곳 더 올라왔대요. 청룡2팀이랑 주작1팀도 지금 나갔고요. 저희도 나가야 할 것 같아서요.' },
      // step 3
      {
        role: 'player',
        choices: [
          { text: '같이 가자' },
          { text: '어디로 가야 하는 거야?' },
        ],
      },
      // step 4 — "어디로?" 선택 시만
      {
        role: 'npc',
        content: '저도 정확한 위치는 아직 전달 못 받았어요. 일단 신청 먼저 넣으시면 바로 연락 온다고 하더라고요.',
        showIfChoice: { step: 3, choice: 1 },
      },
      // step 5 — 항상 (setFlags로 외근 승인 활성화)
      {
        role: 'npc',
        content: '외근 신청 사유는 초자연재난으로 넣어주시면 돼요. 기다릴게요.',
        setFlags: { day6OutingEnabled: true },
      },
    ],
  },

  // ── Day 5: 벽화(청룡1팀) — 유쾌연구소 현장 동행 요청 ─────────────────
  {
    id: 'chat-byeokwha-day5',
    npcId: 'emp-003',
    npcName: '벽화',
    unlockDay: 5,
    requiredFlags: ['readYuriLab'],
    script: [
      {
        role: 'npc',
        content: '팀장님!! 저 오늘 현장 나가는데 같이 가실 수 있어요? 유쾌연구소 조사 관련이에요',
      },
      // step 1
      {
        role: 'player',
        choices: [
          { text: '청룡팀 팀장은 어디 갔는데?' },
          { text: '원래 우리 관할이 아니잖아.' },
          { text: '뭐, 같이 가지.' },
        ],
      },
      // step 2 — 팀장 어디 갔냐 물었을 때
      {
        role: 'npc',
        content: '에ㅎㅎ 태산 팀장님이 저희 팀 정신적 팀장님이신 거 모르셨어요? 그러니까 같이 가주셔야죠!',
        showIfChoice: { step: 1, choice: 0 },
      },
      // step 3 — 관할 아니다 했을 때
      {
        role: 'npc',
        content: '에이~ 기억도 아직 다 돌아오신 것도 아니잖아요. 이런 현장도 같이 다니면서 보시는 게 낫지 않을까요ㅎㅎ',
        showIfChoice: { step: 1, choice: 1 },
      },
      // step 4 — 팀장/관할 답변 이후 재선택 (choice 2 경로는 이 스텝 스킵)
      {
        role: 'player',
        choices: [{ text: '...알겠어, 같이 가지.' }],
        showIfAnyChoice: [{ step: 1, choice: 0 }, { step: 1, choice: 1 }],
      },
      // step 5 — "같이 가지"를 처음부터 고른 경우 감사 인사
      {
        role: 'npc',
        content: '진짜요?? 감사합니다!!',
        showIfChoice: { step: 1, choice: 2 },
      },
      // step 6 — 팀장/관할 경로에서 "같이 가지" 누른 경우 감사 인사
      {
        role: 'npc',
        content: '감사합니다!!',
        showIfAnyChoice: [{ step: 1, choice: 0 }, { step: 1, choice: 1 }],
      },
      // step 7 — 외근 안내 (모든 경로 공통)
      {
        role: 'npc',
        content: '아 외근 신청 사유 칸에 \'청룡1팀 조사 보조\' 적으시면 돼요~ 보고는 제가 올려둘게요!',
        setFlags: { day5OutingEnabled: true },
      },
    ],
  },
];
