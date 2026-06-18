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
      { role: 'npc', speaker: '명경',   content: '오늘 밤에 또 비 온다는데요?' },
      { role: 'npc', speaker: '적목',   content: '하... 그럼 또 그 교통괴담 처리해야겠네요.' },
      { role: 'npc', speaker: '벽화',   content: '그래도 최근엔 거기서 사상자가 별로 안 나오지 않았나요ㅜㅜ' },
      { role: 'npc', speaker: '홍파',   content: '그래두 가긴 해야하니까여... 퇴근하구 싶다' },
      { role: 'npc', speaker: '창파',   content: '그러고 보면 세광시에 GBS도 없는데 GBS 괴담인 거 좀 웃기지 않아요?ㅋㅋ' },
      { role: 'npc', speaker: '황운',   content: '뭐, 없으니까 더 원하게 된다... 그런 거 아닐까요?' },
      { role: 'npc', speaker: '창파',   content: '이거 완전 지역차별 아니에요?ㅋㅋㅋㅋ' },
      { role: 'npc', speaker: '적목',   content: '그러게나 말이에에요. 우리 지역은 방송사도 안 챙겨주고...' },
      { role: 'npc', speaker: '황운',   content: '이거 국회에 청원 넣어야 하는 거 아니에요?!' },
      { role: 'npc', speaker: '창파',   content: '오 좋다, 이참에 세광시 독립합시다ㅋㅋㅋㅋㅋ' },
      { role: 'npc', speaker: '벽화',   content: '국기도 만들어야 하나요.' },
      { role: 'npc', speaker: '적목',   content: '국가명은 세광공화국으로 하죠?' },
      { role: 'npc', speaker: '창파',   content: '태산팀장님 어떻게 생각하세요ㅋㅋㅋ' },
      {
        role: 'player',
        choices: [
          { text: '......', setFlags: { respondedTeamChat: true } },
          { text: '일할 시간에 이런 거 할 정신이 있나.', setFlags: { respondedTeamChat: true } },
        ],
      },
      { role: 'npc', speaker: '창파',   content: '아 죄송합니다ㅎㅎ 자! 다들 다시 업무 모드!' },
      { role: 'npc', speaker: '황운',   content: '참, 내일 사무용품 신청 마감인 거 다들 잊지 마세요.' },
      { role: 'npc', speaker: '적목',   content: '아 맞다' },
      { role: 'npc', speaker: '벽화',   content: '저는 신청했어요' },
      { role: 'npc', speaker: '명경',   content: '저도 완료했습니다.' },
      { role: 'npc', speaker: '창파',   content: '저만 안 했네요ㅋㅋㅋ 지금 바로 할게요~~!' },
    ],
  },
];
