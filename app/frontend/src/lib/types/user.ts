export type CurrentInfoProps = {
  currentWeeksNumber: number;
  currentDate: string;
};

export type UserInfoProps = {
  name: string;
  email: string;
  role: string;
  group: string;
};

export type SentDataOnChangedUserInfoProps = {
  user_id: number;
  group?: string;
  role?: string;
};
