import type { DayEvent } from '../types';
import raw from './events.json?raw';

const d = JSON.parse(raw) as {
  DAY_EVENTS: Record<number, DayEvent>;
  DAY_ARRIVAL_EVENTS: Record<number, DayEvent>;
  DAY_OUTING_EVENTS: Record<number, DayEvent>;
};

export const DAY_EVENTS         = d.DAY_EVENTS;
export const DAY_ARRIVAL_EVENTS = d.DAY_ARRIVAL_EVENTS;
export const DAY_OUTING_EVENTS  = d.DAY_OUTING_EVENTS;

// 2회차 1일차 — 퇴근 후 귀가 이벤트
export const NG_DAY1_OUTING_EVENT: DayEvent = {
  id: 'ng-day1-outing',
  title: '귀가',
  startScene: 'home',
  scenes: {
    home: {
      id: 'home',
      location: '귀가',
      time: '20:18',
      text: '퇴근했다.\n\n하루종일 주머니에 넣어 두었던 뱃지를 마침내 꺼내볼 수 있었다.',
      choices: [{ label: '손 위에서 굴려봤다', next: 'badge_roll' }],
    },
    badge_roll: {
      id: 'badge_roll',
      location: '귀가',
      text: '특별한 기능이 있을 것 같다는 직감이 드는 한편으로, 어떻게 사용하는지 전혀 모르겠어서 한참 쳐다만 볼 수밖에 없었다.',
      choices: [{ label: '계속 쳐다봤다', next: 'laugh' }],
    },
    laugh: {
      id: 'laugh',
      location: '귀가',
      text: '그러고 보면 어디선가 여자 웃음소리 같은 게 들리는 것 같았다.\n\n"바보. 그것도 몰라?"\n\n그리 웃는 목소리도.',
      choices: [{ label: '...', next: 'feeling' }],
    },
    feeling: {
      id: 'feeling',
      location: '귀가',
      text: '어쩌면 이 감정은 그리움일지도 몰랐다.',
      isEnd: true,
      endLabel: '잠에 든다.',
      arrivalFlags: { ng1OutingEventDone: true },
    },
  },
};

// 2회차 2일차 — 퇴근 이벤트 (주작팀 야근 목격)
export const NG_DAY2_OUTING_EVENT: DayEvent = {
  id: 'ng-day2-outing',
  title: '퇴근',
  startScene: 'hallway',
  scenes: {
    hallway: {
      id: 'hallway',
      location: '초자연재난관리국 / 1층 로비',
      time: '18:04',
      text: '집으로 가는 길에 주작팀 요원 두 명과 마주쳤다.\n\n각자 커피를 두 잔씩이나 들고 있는 것을 보니, 금방 퇴근하기는 그른 모양이었다.',
      choices: [{ label: '"퇴근은 안 하나?"', next: 'jujeok_reply' }],
    },
    jujeok_reply: {
      id: 'jujeok_reply',
      location: '초자연재난관리국 / 1층 로비',
      text: '"저희요?"\n\n우스운 농담이라도 들은 것마냥 깔깔 웃는다.\n\n"오늘 기억소거 대상자가 열두 명이에요. 현장 수습도 아직 두 곳 남았고. 어젯밤부터, 후...... 일이 진짜 끝이 없네요."\n\n함께 있던 요원이 천장을 올려다보며 한숨을 내쉬었다.\n\n"그냥 여기서 자야 할 것 같아요, 진짜로."',
      choices: [
        { label: '거들겠다고 한다.', next: 'help_move' },
        { label: '다음에 보자고 하고 돌아섰다.', next: 'go_home' },
      ],
    },

    // ── 도움 경로 ──────────────────────────────────────
    help_move: {
      id: 'help_move',
      location: '초자연재난관리국 / 현장',
      time: '22:31',
      text: '일에 짓눌린 주작팀을 돕다 보니 시간이 빠르게 흘러갔다.\n\n현장 정리가 끝났을 무렵, 서류를 챙기던 요원 하나가 나를 돌아보았다.\n\n 정확히는, 내가 하고 있는 뱃지를.',
      choices: [{ label: '...', next: 'pendant_reveal' }],
    },
    pendant_reveal: {
      id: 'pendant_reveal',
      location: '초자연재난관리국 / 현장',
      text: '"어... 그거, ■■ 팀장님 거 아닌가요?"',
      choices: [{ label: '"무슨 소리지?"', next: 'pendant_deny' }],
    },
    pendant_deny: {
      id: 'pendant_deny',
      location: '초자연재난관리국 / 현장',
      text: '요원이 멈칫했다.\n\n"아, 죄송해요. 저도 제가 무슨 말을 했는지..."\n\n"생각해보니까 그런 팀장님은 여기 안 계시는데, 하하......',
      choices: [{ label: '......', next: 'end_help' }],
    },
    end_help: {
      id: 'end_help',
      location: '귀가',
      time: '23:52',
      text: '집에 돌아왔을 때는 이미 자정을 넘은 시간이었다.',
      isEnd: true,
      endLabel: '잠에 든다.',
      arrivalFlags: { ng2OutingEventDone: true },
    },

    // ── 귀가 경로 ──────────────────────────────────────
    go_home: {
      id: 'go_home',
      location: '귀가',
      time: '18:21',
      text: '집에 돌아왔다.\n\n눕기 전에 할 수 있는 것이라곤 씻는 게 고작이었다.\n\n기억을 찾기 전에 운동이라도 해야겠다는 생각이 들었다.',
      isEnd: true,
      endLabel: '잠에 든다.',
      arrivalFlags: { ng2OutingEventDone: true },
    },
  },
};

// 2회차 2일차 — 백호팀 면담 (기억소거 미니게임 직전까지)
export const NG_DAY2_BAEKHO_INTRO_EVENT: DayEvent = {
  id: 'ng-day2-baekho-intro',
  title: '백호팀',
  startScene: 'arrive_baekho',
  isArrivalEvent: true,
  scenes: {
    arrive_baekho: {
      id: 'arrive_baekho',
      location: '초자연재난관리국 / 백호팀',
      time: '10:31',
      text: '백호팀의 사무실은 현무팀보다 2층 위에 있었다.',
      choices: [{ label: '들어갔다', next: 'device_out' }],
    },
    device_out: {
      id: 'device_out',
      location: '초자연재난관리국 / 백호팀',
      text: '요원이 작은 장비를 꺼냈다. 장비에서 일정한 간격으로 빛이 점멸했다.',
      choices: [{ label: '"...저건 기억소거용 장비 아닌가?"', next: 'baekho_explain' }],
    },
    baekho_explain: {
      id: 'baekho_explain',
      location: '초자연재난관리국 / 백호팀',
      text: '"하지만 기억 소거의 원리도 결국 암시인 법이죠."\n\n"암시를 통해 기억을 묻을 수 있다면, 꺼낼 수도 있는 것 아니겠습니까. 허허."\n\n"불빛에 맞춰 눈을 깜박여 주십시오."',
      choices: [{ label: '눈을 깜박였다', next: 'question' }],
    },
    question: {
      id: 'question',
      location: '초자연재난관리국 / 백호팀',
      text: '"방송국을 봉쇄한 방법에 대해 기억나는 게 있습니까?"',
      isEnd: true,
      endLabel: '기억해보려 했다',
      arrivalFlags: { ng2BaekhoIntroADone: true },
    },
  },
};

// 2회차 2일차 — 기억 복원 결과 (기억소거 미니게임 완료 후 트리거)
export const NG_DAY2_BAEKHO_MEMORIES_EVENT: DayEvent = {
  id: 'ng-day2-baekho-memories',
  title: '기억 복원 시도',
  startScene: 'corrupt_1',
  isArrivalEvent: true,
  scenes: {
    corrupt_1: {
      id: 'corrupt_1',
      location: '',
      isBlackout: true,
      text: '금■ 팀장은 ▮◼⬛▪이 드문 ■◾▮▓이었다. ■■팀 전체가 그■를 ▓⬛■▮◾하였고 봉■ ◾▮■◼⬛ 방면에서는 ■■■이 따를 수 없는 ▪⬛◼▮◾를 갖추고 있었다. 특히 ◼■▮◾⬛와 ■■▪ 상황에서의 금■ 팀장의 ⬛■◼▮는 현장 ▓■◾에 기록된 바 있으며',
      autoNext: true,
      choices: [{ label: '', next: 'corrupt_2' }],
    },
    corrupt_2: {
      id: 'corrupt_2',
      location: '',
      isBlackout: true,
      textBlur: true,
      text: '▮▪▓⬛◼■▮◾█▓▒░⬛◼■▪◾▮■⬛◼▓▒░■◼⬛▪◾▮█▓■◼⬛▮◼▮⬛▪■■◼⬛▪◾▮■⬛◼▓▒░◼■▮▪⬛◾▮■◼⬛▪◾▮█▓▒░⬛◼■▪◾▮■⬛◼▓▒░■◼⬛▪◾▮▪▓⬛◼■▮◾█▓▒░■◼⬛▪◾▮◼⬛▪■■◼⬛▪◾▮■⬛◼▓▒░◼■▮▪⬛◾▮█▓▒░⬛◼■▪◾▮■◼⬛▓▒░■◼⬛▪◾▮▪▓⬛◼■▮◾█▓▒░■◼⬛▪◾▮▮▪▓⬛◼■▮◾█▓▒░⬛◼■▪◾▮■⬛◼▓▒░■◼⬛▪◾▮█▓■◼⬛▮◼▮⬛▪■■◼⬛▪◾▮■⬛◼▓▒░◼■▮▪⬛◾▮■◼⬛▪◾▮█▓▒░⬛◼■▪◾▮■⬛◼▓▒░■◼⬛▪◾▮▪▓⬛◼■▮◾█▓▒░■◼⬛▪◾▮◼⬛▪■■◼⬛▪◾▮■⬛◼▓▒░◼■▮▪⬛◾▮█▓▒░⬛◼■▪◾▮■◼⬛▓▒░■◼⬛▪◾▮▪▓⬛◼■▮◾█▓▒░■◼⬛▪◾▮▮▪▓⬛◼■▮◾█▓▒░⬛◼■▪◾▮■⬛◼▓▒░■◼⬛▪◾▮█▓■◼⬛▮◼▮⬛▪■■◼⬛▪◾▮■⬛◼▓▒░◼■▮▪⬛◾▮■◼⬛▪◾▮█▓▒░⬛◼■▪◾▮■⬛◼▓▒░■◼⬛▪◾▮▪▓⬛◼■▮◾█▓▒░■◼⬛▪◾▮◼⬛▪■■◼⬛▪◾▮■⬛◼▓▒░◼■▮▪⬛◾▮█▓▒░⬛◼■▪◾▮■◼⬛▓▒░■◼⬛▪◾▮▪▓⬛◼■▮◾█▓▒░■◼⬛▪◾▮',
      autoNext: true,
      autoNextDelay: 2000,
      choices: [{ label: '', next: 'blur_1' }],
    },
    blur_1: {
      id: 'blur_1',
      location: '',
      isBlackout: true,
      blackoutDim: true,
      text: '...맛 가셨는데?',
      textAlign: 'center',
      autoNext: true,
      autoNextDelay: 1800,
      choices: [{ label: '', next: 'blur_2' }],
    },
    blur_2: {
      id: 'blur_2',
      location: '',
      isBlackout: true,
      blackoutDim: true,
      text: '그냥 돌려놓자...\n자료는 우리가 더 찾아 보면 되는 거잖아.',
      textAlign: 'center',
      autoNext: true,
      autoNextDelay: 2000,
      choices: [{ label: '', next: 'wake' }],
    },
    wake: {
      id: 'wake',
      location: '초자연재난관리국 / 백호팀',
      time: '10:58',
      text: '헉.\n\n절로 눈이 떠졌다.',
      isEnd: true,
      endLabel: '자리로 돌아간다',
      arrivalFlags: { ng2BaekhoEventDone: true },
    },
  },
};

// 2회차 3일차 → 4일차 — 의무실 기상 이벤트 (doc-ng-001 열람 후 자료보관소 닫는 순간 트리거)
export const NG_DAY4_INTRO_EVENT: DayEvent = {
  id: 'ng-day4-intro',
  title: '4일차',
  startScene: 'blackout_long',
  scenes: {
    blackout_long: {
      id: 'blackout_long',
      location: '',
      isBlackout: true,
      autoNext: true,
      autoNextDelay: 2500,
      text: '',
      choices: [{ label: '', next: 'flicker' }],
    },
    flicker: {
      id: 'flicker',
      location: '',
      isBlackout: true,
      screenFlicker: true,
      autoNext: true,
      autoNextDelay: 1800,
      text: '',
      choices: [{ label: '', next: 'wake' }],
    },
    wake: {
      id: 'wake',
      location: '',
      isBlackout: true,
      blackoutDim: true,
      textAlign: 'center',
      autoNext: true,
      autoNextDelay: 1500,
      text: '눈이 떠졌다.',
      choices: [{ label: '', next: 'kumyang_seen' }],
    },
    kumyang_seen: {
      id: 'kumyang_seen',
      location: '초자연재난관리국 / 의무실',
      time: '06:41',
      text: '낯선 천장이었다.\n\n소독약 냄새가 독한 것을 보니 의무실인 모양인데......\n\n몸을 일으키려는데 어깨가 욱신했다.\n\n이윽고 들리는 것은 의자를 끌어당기는 소리. 시선을 돌리자—',
      choices: [{ label: '...', next: 'tsk' }],
    },
    tsk: {
      id: 'tsk',
      location: '초자연재난관리국 / 의무실',
      text: '금양. 주작1팀의 팀장이다.\n\n팔짱을 낀 채 나의 침대 옆에 앉아 있던 그녀는, 어째서인지 나를 보자마자 혀를 찼다.',
      choices: [{ label: '...', next: 'scold_1' }],
    },
    scold_1: {
      id: 'scold_1',
      location: '초자연재난관리국 / 의무실',
      text: '"정확히 뭘 보셔서 쓰러지신 건지는 저도 모르겠네요. 물어봤을 때 정신도 멀쩡해 보이진 않으셨고."\n\n"대체 쓰러지셨을 때 주변에 아무도 없었으면 어쩔 뻔했어요?"',
      choices: [{ label: '...', next: 'scold_2' }],
    },
    scold_2: {
      id: 'scold_2',
      location: '초자연재난관리국 / 의무실',
      text: '"복직하신 지 며칠이나 됐다고."\n\n금양이 한숨을 쉬었다.\n\n"재활도 채 끝나지 않은 상태에서 무모한 짓 하지 마세요. 뭐가 그렇게 급하다고 오염 문서를 열람해요?"',
      choices: [
        { label: '"중요한 일이었습니다."', next: 'response_a' },
        { label: '"...죄송합니다."', next: 'response_b' },
      ],
    },
    response_a: {
      id: 'response_a',
      location: '초자연재난관리국 / 의무실',
      text: '금양이 미간을 좁혔다.\n\n"얼마나 중요하면 몸이 부서져가는 것도 모르고 해요?"',
      choices: [{ label: '...', next: 'kumyang_stands' }],
    },
    response_b: {
      id: 'response_b',
      location: '초자연재난관리국 / 의무실',
      text: '"...뭐, 죄송하다고 될 일이 아닌 건 알죠?\n\n"우리 요원들 말은 안 해도 태산 팀장한테 의지 많이 해요."',
      choices: [{ label: '...', next: 'kumyang_stands' }],
    },
    kumyang_stands: {
      id: 'kumyang_stands',
      location: '초자연재난관리국 / 의무실',
      text: '금양이 자리에서 일어섰다.\n\n"하... 됐어요. 몸 좀 괜찮아지면 일어나세요. 벌써 업무 쌓여 있을 거예요."',
      isEnd: true,
      endLabel: '자리로 돌아간다',
      arrivalFlags: { ng3Day4IntroDone: true },
    },
  },
};

// 2회차 1일차 — 국장 면담 이벤트 (mail-ng01 답장 후 메일창 나가는 순간 트리거)
export const NG_DAY1_DIRECTOR_EVENT: DayEvent = {
  id: 'ng-day1-director',
  title: '국장실',
  startScene: 'enter',
  isArrivalEvent: true,
  scenes: {
    enter: {
      id: 'enter',
      location: '국장실',
      time: '09:12',
      text: '국장실 문을 두드렸다.\n\n"들어오게."',
      choices: [{ label: '국장의 맞은편에 앉는다', next: 'talk' }],
    },
    talk: {
      id: 'talk',
      location: '국장실',
      text: '"솔직하게 말하면, 나도 거, 그렇게 많이 알진 못해."\n\n"그래도 간단하게는 말야... 방송국 관련 사건들, 오기 전에 찾아 봤지? 거기에 걸려 있던 봉인들이 슬슬 풀리고 있어."\n\n"최악의 경우엔 도시 전체가 위험할 수도 있겠지."',
      choices: [{ label: '계속 듣는', next: 'request' }],
    },
    request: {
      id: 'request',
      location: '국장실',
      text: '"우리 태산 팀장이 세광시 지부 종결 담당이니까, 거 좀 도와줘야 할 것 같어. 관련 징후 있으면 즉시 보고 좀 하고."',
      choices: [{ label: '알겠습니다', next: 'leaving' }],
    },
    leaving: {
      id: 'leaving',
      location: '국장실',
      text: '면담은 허무하리만치 일찍 끝났다.\n\n자리를 뜨려고 몸을 일으키는데—',
      choices: [{ label: '일어났다', next: 'badge_q' }],
    },
    badge_q: {
      id: 'badge_q',
      location: '국장실',
      text: '"잠깐."\n\n국장이 불러세웠다.\n\n"...그 뱃지는 뭔가? 처음 보는 것 같은데."',
      choices: [{ label: '모르겠습니다', next: 'outside' }],
    },
    outside: {
      id: 'outside',
      location: '복도',
      text: '"...그래."\n\n국장은 더 캐묻지 않았다.\n\n국장실을 나왔다.\n\n실제로 뱃지가 없어서 모르겠다고 말했을 뿐인데, 막상 나와 보니 가슴팍에서 무언가가 만져졌다.\n\n작고 납작한 금속 뱃지. 이걸 대체 언제부터 들고 있었던 건지도 기억나지 않았다.\n\n그런데도 어쩐지, 낯설지 않았다/',
      isEnd: true,
      endLabel: '자리로 돌아간다',
      arrivalFlags: { ng1DirectorEventDone: true },
    },
  },
};

// 2회차 4일차 — 교통사고 현장 외근 이벤트
export const NG_DAY4_OUTING_EVENT: DayEvent = {
  id: 'ng-day4-outing',
  title: '4일차',
  startScene: 'arrival',
  scenes: {
    arrival: {
      id: 'arrival',
      location: '세광특별시 / GBS 방송국 부지 인근',
      time: '09:15',
      text: '현장에는 이미 요원이 잔뜩 나와 있었다. 혈흔 묻은 중앙선 너머로 차들이 잔뜩 보였다. 보기 좋은 광경이 아니었다.\n\n"현무1팀장님, 오셨습니까."\n\n다가온 요원이 짧게 브리핑했다. 4중 추돌, 08시 22분. 사상자 없음. 발현 흔적은 있으나 현재 소멸 상태. 잔류물 채취 진행 중.',
      choices: [{ label: '합류한다.', next: 'order' }],
    },
    order: {
      id: 'order',
      location: '세광특별시 / GBS 방송국 부지 인근',
      time: '09:22',
      text: '브리핑이 끝나고 잠시 현장을 둘러봤다.\n\n발현 패턴치고는 사고의 범위가 좁았다. 아니, 정확히는 특정 지점에 집중돼 있는 것 같았다.\n\n생각에 빠져 있을 무렵 누군가 말을 걸었다.\n\n"팀장님, 추가 지시사항 있으시면 말씀해 주십시오."',
      choices: [
        { label: '잔류물 채취 구역을 추돌 구간 북쪽으로 확장하라.', next: 'work' },
        { label: '피해 차량 내부 정밀 스캔을 진행하라.', next: 'work' },
        { label: '주변 구역 내 송신기를 찾아 수거하라.', next: 'order_transmitter' },
      ],
    },
    order_transmitter: {
      id: 'order_transmitter',
      location: '세광특별시 / GBS 방송국 부지 인근',
      text: '지시를 전달하는 순간, 귓가에 이명이 들렸다.',
      choices: [{ label: '...', next: 'order_transmitter_voice' }],
    },
    order_transmitter_voice: {
      id: 'order_transmitter_voice',
      location: '세광특별시 / GBS 방송국 부지 인근',
      glitchText: true,
      text: '——그게 정말로 문제의 핵심같아?\n\n——█■▪■▫를 찾아야지. 방송이 어떻게 존속하는지 생각해봐...',
      choices: [{ label: '...', next: 'order_transmitter_end' }],
    },
    order_transmitter_end: {
      id: 'order_transmitter_end',
      location: '세광특별시 / GBS 방송국 부지 인근',
      text: '아니, 이명이 아닌가? 알 수 없었다.\n\n이윽고 주변의 소리는 다시 돌아왔다.\n\n요원들이 움직이고 있었다. 아무것도 달라지지 않았다.',
      choices: [
        { label: '마음속으로 엄청나게 꼽을 준다. (어쩐지 이 쪽이 자연스러운 행동으로 느껴진다.)', next: 'work' },
        { label: '무시하고 할 일을 한다.', next: 'work' },
      ],
    },
    work: {
      id: 'work',
      location: '세광특별시 / GBS 방송국 부지 인근',
      time: '11:40',
      text: '두 시간이 넘게 지났다.\n\n샘플 채취, 사진 기록, 좌표 마킹까지. 우리는 프로토콜에 따라 체크리스트를 하나씩 지워 나갔다.\n\n어느새 햇볕이 강해졌고, 아스팔트에서 열기가 올라오기 시작했다. 때맞춰 어지럼증이 심해진다.\n\n소방차 그늘 쪽에 빈자리가 있길래 잠시 앉아서 눈을 붙였다.',
      choices: [{ label: '...', next: 'hongpa' }],
    },
    hongpa: {
      id: 'hongpa',
      location: '세광특별시 / GBS 방송국 부지 인근',
      text: '발소리가 옆에서 멈췄다.\n\n"팀장님."\n\n청룡2팀 홍파였다. 그녀는 내 옆에 쭈그리더니, 내 허리춤에 묶인 작두를 보고 말을 붙였다.\n\n"작두는 왜 들고 다니세요? 굿 하실 것도 아니면서."',
      choices: [
        { label: '"그러게. 설마 쓸 일이 있을까."', next: 'response_a' },
        { label: '"사람 앞날은 모르는 것 아니겠나."', next: 'response_b' },
      ],
    },
    response_a: {
      id: 'response_a',
      location: '세광특별시 / GBS 방송국 부지 인근',
      text: '홍파가 피식 웃었다.\n\n"하긴요. 저도 알죠. 농담이었습니다."\n\n"저도 잠깐 앉겠습니다. 다리 죽겠어요."',
      choices: [{ label: '한숨을 쉬며 자리를 터 준다.', next: 'overnight' }],
    },
    response_b: {
      id: 'response_b',
      location: '세광특별시 / GBS 방송국 부지 인근',
      text: '홍파의 얼굴에서 웃음기가 빠졌다.\n\n"...아니죠? 요원님은 굿 하시면 안 되시는 거 알잖아요. 이미 저번 굿으로—"\n\n홍파는 자기 머리카락을 한 번 헝클어뜨리더니, 젖은 장갑을 집어 들고 몸을 돌렸다.\n\n"아무것도 아닙니다. 죄송합니다."\n\n그녀는 말을 더 걸어 볼 틈도 없이 가버렸다.',
      choices: [{ label: '한숨을 쉬며 브로치를 만지작거린다.', next: 'overnight' }],
    },
    overnight: {
      id: 'overnight',
      location: '세광특별시 / GBS 방송국 부지 인근',
      time: '15:20',
      text: '오후가 지나도 사태 수습은 끝날 기미가 없었다. 하기야 그 정도로 규모가 큰 사고이기는 했다.\n\n현장 책임자가 무전을 끊고 목소리를 높였다.\n\n"이거 오늘 안에 안 끝납니다. 교대로 쉬고, 새벽까지 끌어야 해요."\n\n짧은 침묵이 내려앉았다. 이의 없음이었다.\n\n분주하던 현장은 그렇게 밤으로 접어들었다.',
      choices: [{ label: '...', next: 'watch' }],
    },
    watch: {
      id: 'watch',
      location: '세광특별시 / GBS 방송국 부지 인근',
      time: '03:12',
      text: '불침번은 두 시간씩 돌아갔다.\n\n교대가 끝나면 차 시트에 등을 기대거나, 비닐 위에 쓰러지거나 하는 식이었다. 침구 같은 사치는 물론 없었다.\n\n청담은 통제선 안쪽 아스팔트에 재킷을 덮고 누워 있었다.\n\n누운 모습을 바라보고 있자면, 불현듯 청담의 휴대폰 화면이 번쩍였다.',
      choices: [{ label: '...', next: 'cheongdam' }],
    },
    cheongdam: {
      id: 'cheongdam',
      location: '세광특별시 / GBS 방송국 부지 인근',
      time: '03:13',
      text: '구조신호였다.\n\n자동 발신. 발신자는 신원 확인 불가.\n\n화면에 구조 요청자의 위치 좌표가 떠 있었다.',
      choices: [{ label: '좌표를 확인한다.', next: 'end_reveal' }],
    },
    end_reveal: {
      id: 'end_reveal',
      location: '세광특별시 / GBS 방송국 부지 인근',
      time: '03:13',
      text: '방송국이었다.\n\n현장에서 직선거리 약 삼백 미터.\n\n고개를 들었다. 통제선 너머로, 어둠 속에 건물의 실루엣이 우뚝 솟아 있었다.',
      choices: [{ label: '눈을 고정한 채 서 있는다.', next: 'broadcast_approach' }],
    },
    broadcast_approach: {
      id: 'broadcast_approach',
      location: '세광특별시 / GBS 방송국 부지 인근',
      time: '03:14',
      text: '삼백 미터.\n\n발이 먼저 움직였다. 통제선을 넘어 어둠 속 윤곽을 향해 걷기 시작했다. 요원들이 무전을 주고받는 소리가 점점 멀어졌다.\n\n사박사박. 아스팔트 밟는 소리만이 귓가에 울렸다.\n\n얼마나 지났을까, 나는 건물 앞에 서 있었다.',
      choices: [{ label: '문을 연다.', next: 'door_creak' }],
    },
    door_creak: {
      id: 'door_creak',
      location: '',
      isBlackout: true,
      textStyle: 'plain',
      textAlign: 'center',
      text: '끼익',
      autoNext: true,
      autoNextDelay: 2200,
      choices: [{ label: '', next: 'voice_1' }],
    },
    voice_1: {
      id: 'voice_1',
      location: '',
      isBlackout: true,
      textStyle: 'plain',
      textAlign: 'center',
      text: '아, 태산.\n\n와줬구나.',
      autoNext: true,
      autoNextDelay: 2200,
      choices: [{ label: '', next: 'voice_2' }],
    },
    voice_2: {
      id: 'voice_2',
      location: '',
      isBlackout: true,
      textStyle: 'plain',
      textAlign: 'center',
      text: '그래 나도… 네가 돌아와줄 걸 알고 있었어.\n\n내가 분명히 말했잖아. 이 재난의 완벽한 해결책은 오직 █▪■▫█ 하나뿐이라고. 너도 천재인 내 말을 믿고 충분히 준비해 왔겠지?\n\n자, 어서 들어와.\n\n네가 나 대신 이 재난의 끝을 보기 위해통제본부수신하라구원의편성표가완성되었█시청자여러분모두스스로숨을거두어전파가되어하늘로날아올라야진정한안식이니목을매어구원을■▪█■▫■▪▪█■■▫▪█■▪■▫█▪■■▫▪■█▫■▪▪■█▫▪■▫■▪█■■▫▪█■▪▪■▫▪■▪█▫█■▫■▪▪█■■▫▪█▪▫■▪█■▫▪■■▫■▪▪█■▫▪█■▪■▫▪■█▫■▫▪▪█■■▫▪■▫█▪■▪▪■▫█■▫▪■▪█■▫■▪▪▫▪█■▫▪■█■▫▪▪█■▫■▪▪█■▫▪■▫▪█■▪■▫▪▪█■▫▪■█▫■▪▪■▫▪█■▪■▫▪▪██▫■▪▪▫█■▫▪■▪█■▫▪▪█■■▫▪■▫█▪■▪▪▫█▪■▫■▪▪█■▫▪■▫▪▪█■▫■▪▪■▫▪█■▪▪■▫▪■█▫■▪▪■▫▪█▫■▪▪▫█■▫▪■▪█■▫▪▪█■■▫▪■▫█▫█■▪■▫▪▪█■▫■▪▪█▫█■▫▪■▪▪█■■▫▪▪█■▫▪■▫▪▪█■▫■▪▪■▫▪█■▪▫█▫■▪▪▫█■▫▪■▪█■▫▪▪█■▫■▪▪█▫▪■▫▪▪█■▫■▪▪■▫',
      glitchAfterMs: 1200,
      hardTimeout: 3500,
      choices: [{ label: '', next: 'black_pause' }],
    },
    black_pause: {
      id: 'black_pause',
      location: '',
      isBlackout: true,
      text: '',
      autoNext: true,
      autoNextDelay: 1000,
      choices: [{ label: '', next: 'choice_screen' }],
    },
    choice_screen: {
      id: 'choice_screen',
      location: '',
      isBlackout: true,
      blackoutDim: true,
      text: '',
      choices: [
        { label: '>재난을 봉인한다.', next: 'end_seal', requiredItems: ['eq-012'] },
        { label: '>우리 이제 하나가 되자', next: 'end_merge', labelStyle: 'glitch-censor' },
        { label: '>사특한 것을 베어낸다.', next: 'end_cut', requiredItems: ['eq-012'] },
      ],
    },
    end_seal: {
      id: 'end_seal',
      location: '',
      isBlackout: true,
      errorSpread: true,
      text: '',
      arrivalFlags: { ng4OutingDone: true, ng4EndingSeal: true },
    },
    end_cut: {
      id: 'end_cut',
      location: '',
      isBlackout: true,
      cutEnding: true,
      text: '',
      arrivalFlags: { ng4OutingDone: true, ng4EndingCut: true },
    },
    end_merge: {
      id: 'end_merge',
      location: '',
      isBlackout: true,
      lightEnding: true,
      text: '',
      arrivalFlags: { ng4OutingDone: true, ng4EndingMerge: true },
    },
  },
};
