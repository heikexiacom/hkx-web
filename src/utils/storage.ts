import type { UserInfo } from "@/api/member";

/* eslint-disable max-classes-per-file */
type SessionObj = {
  token: string;
  accessToken: string;
  refreshToken: string;
  userInfo: UserInfo;
};

export class Session {
  static get<T extends keyof SessionObj>(name: T): SessionObj[T] | null {
    const value = sessionStorage.getItem(name);
    return value ? (JSON.parse(value).v as SessionObj[T]) : null;
  }

  static remove<T extends keyof SessionObj>(name: T) {
    sessionStorage.removeItem(name);
  }

  static set<T extends keyof SessionObj>(name: T, value: SessionObj[T]) {
    sessionStorage.setItem(name, JSON.stringify({ v: value }));
  }
}

type LocalStorageObj = {
  hideStageTip: boolean;
  uuid: string;
  accessToken: string;
  refreshToken: string;
  userInfo: UserInfo;
};
export class LocalStorage {
  static get<T extends keyof LocalStorageObj>(
    name: T
  ): LocalStorageObj[T] | null {
    const value = localStorage.getItem(name);
    return value ? (JSON.parse(value).v as LocalStorageObj[T]) : null;
  }

  static remove<T extends keyof LocalStorageObj>(name: T) {
    localStorage.removeItem(name);
  }

  static set<T extends keyof LocalStorageObj>(
    name: T,
    value: LocalStorageObj[T]
  ) {
    localStorage.setItem(name, JSON.stringify({ v: value }));
  }
}
