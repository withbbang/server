export interface Comment {
  ID: number;
  REF_ID?: number;
  NICKNAME: string;
  CREATE_DT: string;
  UPDATE_DT?: string;
  IS_SECRET: string;
}
