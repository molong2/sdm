import { BASE_DATE } from '../data/config';

/** Day N에 해당하는 한국어 날짜 반환: 2026년 6월 24일 */
export function getKoreanDateForDay(day: number): string {
  const d = new Date(BASE_DATE.getTime());
  d.setDate(d.getDate() + (day - 1));
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** Day N에 해당하는 한국 정부 표준 날짜 문자열 반환: 2026. 06. 18. */
export function getDateForDay(day: number): string {
  const d = new Date(BASE_DATE.getTime());
  d.setDate(d.getDate() + (day - 1));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}. ${m}. ${dd}.`;
}

const DOW = ['일', '월', '화', '수', '목', '금', '토'];

/** Day N에 해당하는 메신저용 날짜 구분선 문자열: 2026년 6월 18일 목요일 */
export function getChatDateLabel(day: number): string {
  const d = new Date(BASE_DATE.getTime());
  d.setDate(d.getDate() + (day - 1));
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const dd = d.getDate();
  const dow = DOW[d.getDay()];
  return `${y}년 ${m}월 ${dd}일 ${dow}요일`;
}
