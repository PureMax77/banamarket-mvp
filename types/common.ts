interface IKakaoProfile {
  nickname: string;
  thumbnail_image_url: string;
  profile_image_url: string;
  is_default_image: boolean;
  is_default_nickname: boolean;
}

export interface IKakaoAccount {
  profile_nickname_needs_agreement: boolean;
  profile_image_needs_agreement: boolean;
  profile: IKakaoProfile;
  has_email: boolean;
  email_needs_agreement: boolean;
  is_email_valid: boolean;
  is_email_verified: boolean;
  email: string;
}

/**
 * 한국 은행 코드 매핑
 * 계좌이체 가능한 은행별 코드
 */
export const BANK_CODES = {
  '농협': '011', // 농협은행
  '수협': '007', // 수협은행
  '기업은행': '003', // 기업은행
  '국민은행': '004', // 국민은행
  '신한은행': '088', // 신한은행
  '우리은행': '020', // 우리은행
  '하나은행': '081', // 하나은행
  'IM뱅크': '089', // IM뱅크
  '제주은행': '035', // 제주은행
  '부산은행': '032', // 부산은행
  '광주은행': '034', // 광주은행
  '경남은행': '039', // 경남은행
  '전북은행': '037', // 전북은행
} as const;

export type BankType = keyof typeof BANK_CODES;