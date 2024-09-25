export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 20;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 6;
export const FEED_CONTENT_COUNT = 7;

// 소문자, 대문자, 숫자, 해당특수문자 포함 정규식
export const PASSWORD_REGEX = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*?[#?!@$%^&*-]).+$/
);

export const PASSWORD_REGEX_ERROR =
  "A password must have lowercase, UPPERCASE, a number and special characters.";

export const PATH_NAME = {
  HOME: "/",
  LOGIN: "/login",
  JOIN: "/join",
  KAKAO_START: "/kakao/start",
  KAKAO_COMPLETE: "/kakao/complete",
  PROFILE: "/profile",
};

export const PhoneNumberRegex = /^(01[016789]{1})-?[0-9]{3,4}-?[0-9]{4}$/;

export const OnlyNumberRegex = /^\d+$/;

// 과일과 채소 목록
export const fruitsVegetables = [
  "사과",
  "바나나",
  "당근",
  "토마토",
  "상추",
  "오렌지",
  "포도",
  "오이",
  "복숭아",
  "브로콜리",
  "배",
  "감자",
  "양파",
  "호박",
  "고구마",
  "무",
  "파프리카",
  "딸기",
  "시금치",
  "레몬",
];

// 형용사
export const adjectives = [
  "행복한",
  "즐거운",
  "활기찬",
  "상쾌한",
  "밝은",
  "달콤한",
  "싱그러운",
  "든든한",
  "사랑스러운",
  "귀여운",
  "멋진",
  "친절한",
  "용감한",
  "씩씩한",
  "따뜻한",
  "건강한",
  "상냥한",
  "매력적인",
  "신나는",
  "기분좋은",
];
