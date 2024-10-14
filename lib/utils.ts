import { adjectives, fruitsVegetables } from "./constants";

export function formatToTimeAgo(date: string): string {
  const dayInMs = 1000 * 60 * 60 * 24;
  const time = new Date(date).getTime(); //unix timestamp
  const now = new Date().getTime();
  const diff = Math.round((time - now) / dayInMs);

  const formatter = new Intl.RelativeTimeFormat("ko");

  return formatter.format(diff, "days");
}

export function formatToWon(price: number): string {
  return price.toLocaleString("ko-KR");
}

export function genRandomFourNumber() {
  return Math.floor(1000 + Math.random() * 9000);
}

// 랜덤으로 형용사를 선택하는 함수
function getRandomAdjective() {
  const randomIndex = Math.floor(Math.random() * adjectives.length);
  return adjectives[randomIndex];
}

// 랜덤으로 과일이나 채소를 선택하는 함수
function getRandomFruitOrVegetable() {
  const randomIndex = Math.floor(Math.random() * fruitsVegetables.length);
  return fruitsVegetables[randomIndex];
}

// 닉네임 생성
export function generateNickname() {
  const adjective = getRandomAdjective();
  const fruitOrVegetable = getRandomFruitOrVegetable();
  return `${adjective}${fruitOrVegetable}${genRandomFourNumber().toString()}`;
}

// 이메일의 @이전 아이디 앞3글자 빼고 *로 변경
export function emailMasking(email: string) {
  return email.replaceAll(/(?<=.{3}).(?=[^@]*?@)/g, "*");
}

// 영문, 숫자, 특수문자(~!@#$%) 각 1개씩 무조건 포함하는 10자리의 랜덤 비번을 생성
export function generateRandomPw() {
  const lowerChars = "abcdefghijklmnopqrstuvwxyz";
  const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specialChars = "~!@#$%";

  // 각각 하나씩 포함
  const randomLower = lowerChars[Math.floor(Math.random() * lowerChars.length)];
  const randomUpper = upperChars[Math.floor(Math.random() * upperChars.length)];
  const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
  const randomSpecial =
    specialChars[Math.floor(Math.random() * specialChars.length)];

  // 나머지 6자리를 랜덤으로 채운다.
  const allChars = lowerChars + upperChars + numbers + specialChars;
  let remainingChars = "";
  for (let i = 0; i < 6; i++) {
    remainingChars += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // 비밀번호를 섞는다.
  const password =
    randomLower + randomUpper + randomNumber + randomSpecial + remainingChars;
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

// 초기화용 다음날 날짜 구하기

/**
 * 현재 부로 N일 이후 시작 날짜 getTime
 * @param days 뒤로 보낼 날짜 수
 * @returns
 */
export function getNextDayStartTime(days: number): number {
  const now = new Date(); // 현재 시간
  const tomorrow = new Date(now); // 현재 시간을 기반으로 새 날짜 객체 생성

  // 다음 날로 설정
  tomorrow.setDate(now.getDate() + days);

  // 시간을 자정으로 설정
  tomorrow.setHours(0, 0, 0, 0); // 00:00:00.000

  return tomorrow.getTime(); // 밀리초 타임스탬프 반환
}
