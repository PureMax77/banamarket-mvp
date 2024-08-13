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
