import { get, post, type Records, type SearchParams } from "./request";

export type mtlType =
  | "SHAPE"
  | "ICON"
  | "ILLUSTRATION"
  | "SEGMENT_IMAGE"
  | "LOGO"
  | "GENERAL_PIC"
  | "";

export type materialItem = {
  id: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  deleteFlag: boolean;
  name: string;
  type: string;
  url: string;
  imgRatio: number;
  userId: string;
  viewSort: number;
};

export const materialListGet = get<
  SearchParams & {
    name?: string;
    type?: mtlType;
  },
  Records<materialItem>
>("buyer/material/getByPage");

/**
 * 新增素材
 * @param params
 * @returns
 */
export const materialAdd = post<
  {
    imgRatio: number;
    name: string;
    type: mtlType;
    url: string;
    userId: string;
    viewSort: number;
  },
  void
>("buyer/material/add");

export const materialDelByIds = post<
  {
    ids: string[];
  },
  void
>("buyer/material/delByIds");
