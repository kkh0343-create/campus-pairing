
export enum AppView {
  LOGIN = 'LOGIN',
  PROFILE_SETUP = 'PROFILE_SETUP',
  DASHBOARD = 'DASHBOARD',
  GROUP_SETUP = 'GROUP_SETUP',
  MATCH_LIST = 'MATCH_LIST',
  CHAT_LIST = 'CHAT_LIST',
  MY_PAGE = 'MY_PAGE',
  CHAT = 'CHAT',
  MEETING_MODE = 'MEETING_MODE',
  REVIEW = 'REVIEW'
}

export enum Gender {
  MALE = '남성',
  FEMALE = '여성'
}

export interface UserProfile {
  id: string;
  name: string;
  profileImage?: string;
  isVerified: boolean;
  gender: Gender;
  age: number;
  university: string;
  major: string;
  bio: string;
  mbti?: string;
  instaId?: string;
  faceType?: string;
  idealType?: string;
  values?: string[];
}

export interface GroupMember {
  name: string;
  major: string;
  university?: string; // Basic info
  age: number;
  gender?: string;
  mbti?: string;      // Extended
  profileImage?: string; // Extended
  faceType?: string;  // Extended
  idealType?: string; // Extended
  values?: string[];  // Extended
}

export interface MyGroup {
  matchType: 'date' | 'group';
  size: 1 | 2 | 3 | 4;
  members: GroupMember[];
  region: string;
  atmosphere: '연애 지향' | '친목 지향';
  gamePreference: '대화 위주' | '술게임 선호';
  preferredAgeMin: number;
  preferredAgeMax: number;
  preferredUniversity: string;
  preferredMajorType: '상관없음' | '메디컬' | '문과' | '이과' | '예체능';
}

export interface MatchGroup {
  id: string;
  university: string;
  department: string;
  avgAge: number;
  members: GroupMember[];
  region: string;
  atmosphere: string;
  bio: string;
  matchScore?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'partner' | 'system';
  text: string;
  timestamp: number;
  isImage?: boolean;
}

export interface Appointment {
  id: string;
  matchId: string;
  partnerName: string;
  date: string;
  time: string;
  location: string;
  status: 'confirmed';
}

export interface AppState {
  view: AppView;
  language: 'ko' | 'en';
  user: UserProfile | null;
  myGroup: MyGroup | null;
  matches: MatchGroup[];
  activeMatch: MatchGroup | null;
  chatHistories: Record<string, ChatMessage[]>;
  appointments: Appointment[];
  isProfileRevealed: boolean;
  unlockedMatches: string[];
}
