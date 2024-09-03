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
