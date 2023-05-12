export interface Content {
  ID: number;
  CATEGORY_ID: number;
  CATEGORY?: string;
  TITLE: string;
  CONTENT: string;
  HIT?: number;
  HEART?: number;
  CREATE_DT?: string;
  UPDATE_DT?: string;
  IS_DONE?: string;
  IS_DELETED: string;
  PATH: string;
}
