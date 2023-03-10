export interface USER {
  ID: string;
  PASSWORD: string;
  SALT: string;
  ACCESS_TOKEN: string;
  REFRESH_TOKEN: string;
  AUTH: number;
  CREATE_DT: string;
  UPDATE_DT: string;
  DELETE_DT: string;
  UPDATE_USER: string;
  IS_DELETED: string;
}
