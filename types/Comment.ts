export interface Comment {
  ID: number;
  IP?: string;
  REF_ID?: number;
  NICKNAME: string;
  PASSWORD?: string;
  COMMENTS: string;
  CREATE_DT: string;
  UPDATE_DT?: string;
  IS_SECRET: string;
}
