import type { GroupChat } from '../types';

// ============================================================
// 단체 대화방 데이터
// 1:1 메신저와 달리 여러 발신자가 등장하며, 창을 열지 않아도
// 시간이 지나면 자동으로 새 메시지가 쌓인다 (App.tsx의 전역 타이머로 진행).
// ============================================================

export const groupChats: GroupChat[] = [
  {
    id: 'groupchat-broadcast-weather',
    title: '초자연재난관리국 세광특별시',
    unlockDay: 2,
    requiredFlags: ['triggeredTeamChat'],
    script: [
      { role: 'npc', speaker: '명경',   content: '오늘 밤부터 비 온다고 하네요. 일기예보 공유드립니다.' },
      { role: 'npc', speaker: '적목',   content: '하... 그럼 또 그 교통괴담 처리해야겠네요.' },
      { role: 'npc', speaker: '벽화',   content: '그거 최근엔 사상자가 별로 안 나오지 않았나요.' },
      { role: 'npc', speaker: '창파',   content: '어 근데 생각해보니까 세광시에 GBS도 없는데 GBS 괴담인 거 좀 수상하지 않아요?ㅋㅋ' },
      { role: 'npc', speaker: '황운',   content: '어, 진짜 그러네요. 근데 세광시엔 왜 GBS가 없는 거예요?' },
      { role: 'npc', speaker: '창파',   content: '이거 완전 지역차별 아니에요?ㅋㅋㅋㅋ' },
      { role: 'npc', speaker: '적목',   content: '...그러고보니 너무하네요. 우리 지역은 방송사도 안 챙겨주고.' },
      { role: 'npc', speaker: '황운',   content: '이거 국회에 청원 넣어야 하는 거 아니에요?!' },
      { role: 'npc', speaker: '창파',   content: '오 좋다, 이참에 세광시 독립합시다ㅋㅋㅋㅋㅋ' },
      { role: 'npc', speaker: '벽화',   content: '국기도 만들어야 하나요.' },
      { role: 'npc', speaker: '적목',   content: '...국가명은 세광공화국으로 하죠.' },
      { role: 'npc', speaker: '창파',   content: '팀장님 어떻게 생각하세요ㅋㅋㅋ' },
      {
        role: 'player',
        choices: [
          { text: '......', setFlags: { respondedTeamChat: true } },
          { text: '일할 시간에 이런 거 할 정신이 있나.', setFlags: { respondedTeamChat: true } },
        ],
      },
      { role: 'npc', speaker: '창파',   content: '...아 죄송합니다ㅎㅎ 다시 업무 모드로 돌아갈게요.' },
      { role: 'npc', speaker: '황운',   content: '참, 내일 사무용품 신청 마감인 거 다들 잊지 마세요.' },
      { role: 'npc', speaker: '적목',   content: '아 맞다 깜빡했다' },
      { role: 'npc', speaker: '벽화',   content: '저는 신청했어요' },
      { role: 'npc', speaker: '명경',   content: '저도 완료했습니다.' },
      { role: 'npc', speaker: '창파',   content: '저만 안 했네요ㅋㅋㅋ 지금 바로 할게요' },
    ],
  },
];
