export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 20;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 6;

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
